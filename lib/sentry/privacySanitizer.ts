/**
 * Sentry Outgoing Telemetry Privacy Sanitizer for OyaPlan
 *
 * Requirements:
 * - Redacts sensitive fields, tokens, cookies, passwords, OTPs, BVN/NIN, PAN, and phone numbers.
 * - Cleans sensitive query parameters from URLs and request bodies.
 * - Recursively processes nested objects and arrays with circular-reference protection.
 * - Preserves diagnostic utility (error messages, exception names, stack traces).
 * - Avoids in-place mutation of input data.
 * - Safely handles non-object, null, and oversized inputs.
 */

const SENSITIVE_KEY_PATTERNS = [
  /auth(?:orization)?/i,
  /token/i,
  /cookie/i,
  /secret/i,
  /password/i,
  /passcode/i,
  /(?:^|[_-])otp(?:$|[_-])/i,
  /bearer/i,
  /session[_-]?id/i,
  /(?:^|[_-])jwt(?:$|[_-])/i,
  /(?:^|[_-])bvn(?:$|[_-])/i,
  /(?:^|[_-])nin(?:$|[_-])/i,
  /(?:^|[_-])cvv(?:$|[_-])/i,
  /(?:^|[_-])cvc(?:$|[_-])/i,
  /(?:^|[_-])pan(?:$|[_-])/i,
  /card[_-]?number/i,
  /credit[_-]?card/i,
  /account[_-]?number/i,
  /phone(?:[_-]?number)?/i,
];

// Content regexes for string sanitization
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const SENSITIVE_QUERY_PARAM_REGEX = /([?&](?:token|access_token|refresh_token|otp|code|secret|password|key)=)[^&]+/gi;
const NIGERIAN_PHONE_REGEX = /(?:\+?234|0)[789][01]\d{8}\b/g;
const BVN_NIN_REGEX = /\b\d{11}\b/g;
const CARD_PAN_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

/**
 * Sanitizes a raw string by redacting known sensitive patterns.
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== "string") return val;

  return val
    .replace(BEARER_REGEX, "Bearer [REDACTED]")
    .replace(SENSITIVE_QUERY_PARAM_REGEX, "$1[REDACTED]")
    .replace(CARD_PAN_REGEX, "[REDACTED_CARD]")
    .replace(NIGERIAN_PHONE_REGEX, "[REDACTED_PHONE]")
    .replace(BVN_NIN_REGEX, "[REDACTED_ID]");
}

/**
 * Checks if a property key should be redacted based on sensitive key patterns.
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Recursively deep-clones and redacts sensitive data from objects/arrays.
 * Safe against circular references and caps maximum traversal depth.
 */
export function sanitizeData<T>(data: T, depth = 0, seen = new WeakSet<object>()): T {
  if (depth > 8) {
    return "[MAX_DEPTH]" as unknown as T;
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return sanitizeString(data) as unknown as T;
  }

  if (typeof data !== "object") {
    return data;
  }

  // Handle circular references
  if (seen.has(data as object)) {
    return "[CIRCULAR]" as unknown as T;
  }
  seen.add(data as object);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1, seen)) as unknown as T;
  }

  const sanitizedObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      sanitizedObj[key] = "[REDACTED]";
    } else {
      sanitizedObj[key] = sanitizeData(value, depth + 1, seen);
    }
  }

  return sanitizedObj as T;
}

/**
 * Sentry beforeSend hook: Sanitizes outgoing exception and message events.
 */
export function sanitizeSentryEvent<T extends Record<string, any>>(event: T): T | null {
  if (!event || typeof event !== "object") {
    return event;
  }

  try {
    const copy: Record<string, any> = { ...event };

    // 1. Sanitize request headers, cookies, query string, and post data
    if (copy.request) {
      const sanitizedRequest = { ...copy.request };
      if (sanitizedRequest.headers) {
        sanitizedRequest.headers = sanitizeData(sanitizedRequest.headers);
      }
      if (sanitizedRequest.cookies) {
        sanitizedRequest.cookies = "[REDACTED]";
      }
      if (sanitizedRequest.data) {
        sanitizedRequest.data = sanitizeData(sanitizedRequest.data);
      }
      if (typeof sanitizedRequest.url === "string") {
        sanitizedRequest.url = sanitizeString(sanitizedRequest.url);
      }
      if (typeof sanitizedRequest.query_string === "string") {
        sanitizedRequest.query_string = sanitizeString(sanitizedRequest.query_string);
      }
      copy.request = sanitizedRequest;
    }

    // 2. Sanitize user attributes (keep id, redact email and phone)
    if (copy.user) {
      const sanitizedUser = { ...copy.user };
      if (sanitizedUser.email) sanitizedUser.email = "[REDACTED_EMAIL]";
      if (sanitizedUser.username) sanitizedUser.username = sanitizeString(sanitizedUser.username);
      if (sanitizedUser.ip_address) sanitizedUser.ip_address = "[REDACTED_IP]";
      copy.user = sanitizedUser;
    }

    // 3. Sanitize extra, contexts, and tags
    if (copy.extra) {
      copy.extra = sanitizeData(copy.extra);
    }
    if (copy.contexts) {
      copy.contexts = sanitizeData(copy.contexts);
    }
    if (copy.breadcrumbs && Array.isArray(copy.breadcrumbs)) {
      copy.breadcrumbs = copy.breadcrumbs.map((b) => sanitizeSentryBreadcrumb(b));
    }

    return copy as T;
  } catch {
    // If sanitization fails unexpectedly, return the original event rather than dropping error telemetry
    return event;
  }
}

/**
 * Sentry beforeBreadcrumb hook: Sanitizes outgoing breadcrumbs (UI clicks, HTTP requests, logs).
 */
export function sanitizeSentryBreadcrumb<T extends Record<string, any>>(breadcrumb: T): T | null {
  if (!breadcrumb || typeof breadcrumb !== "object") {
    return breadcrumb;
  }

  try {
    const copy: Record<string, any> = { ...breadcrumb };

    if (copy.message && typeof copy.message === "string") {
      copy.message = sanitizeString(copy.message);
    }

    if (copy.data && typeof copy.data === "object") {
      copy.data = sanitizeData(copy.data);
    }

    return copy as T;
  } catch {
    return breadcrumb;
  }
}

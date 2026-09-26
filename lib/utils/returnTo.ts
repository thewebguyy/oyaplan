/**
 * Sanitizes and validates internal returnTo / redirect paths.
 * Strictly prevents Open Redirect vulnerabilities (disallowing external domains, protocol-relative '//', javascript:, etc.)
 */
export function sanitizeReturnTo(rawPath: string | null | undefined, fallback: string = '/'): string {
  if (!rawPath || typeof rawPath !== 'string') {
    return fallback;
  }

  const trimmed = rawPath.trim();

  // Must start with a single slash '/' and not '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Prevent control characters, CRLF injection, null bytes, backslashes
  if (/[\r\n\0\\]/.test(trimmed)) {
    return fallback;
  }

  // Disallow javascript:, data:, etc.
  if (/^\/[/\\]*javascript:/i.test(trimmed) || /^\/[/\\]*data:/i.test(trimmed)) {
    return fallback;
  }

  // Normalize: ensure it's parseable as a relative path
  try {
    const dummyOrigin = 'http://localhost';
    const parsed = new URL(trimmed, dummyOrigin);

    // If the origin changed, it's an attempted escape
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }

    // Return the safe pathname + search + hash
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeData,
  sanitizeSentryEvent,
  sanitizeSentryBreadcrumb,
} from "./privacySanitizer";

describe("Privacy Sanitizer", () => {
  describe("sanitizeString", () => {
    it("redacts Bearer tokens in headers or strings", () => {
      const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz";
      expect(sanitizeString(input)).toBe("Authorization: Bearer [REDACTED]");
    });

    it("redacts sensitive query parameters from URLs", () => {
      const input = "https://api.oyaplan.com/callback?code=sec_12345&state=ok&access_token=tok_998877";
      const sanitized = sanitizeString(input);
      expect(sanitized).toContain("code=[REDACTED]");
      expect(sanitized).toContain("access_token=[REDACTED]");
      expect(sanitized).toContain("state=ok");
    });

    it("redacts 16-digit credit card numbers", () => {
      const input = "Charged card 4111 2222 3333 4444 successfully";
      expect(sanitizeString(input)).toBe("Charged card [REDACTED_CARD] successfully");
    });

    it("redacts 11-digit BVN or NIN numbers", () => {
      const input = "User verification BVN 22233344455 submitted";
      expect(sanitizeString(input)).toBe("User verification BVN [REDACTED_ID] submitted");
    });

    it("redacts Nigerian telephone numbers", () => {
      const input = "Contact host at +2348012345678 or 08098765432";
      expect(sanitizeString(input)).toBe("Contact host at [REDACTED_PHONE] or [REDACTED_PHONE]");
    });

    it("handles non-string or empty inputs cleanly", () => {
      // @ts-expect-error test non-string
      expect(sanitizeString(null)).toBe(null);
      // @ts-expect-error test non-string
      expect(sanitizeString(undefined)).toBe(undefined);
      expect(sanitizeString("")).toBe("");
    });
  });

  describe("sanitizeData", () => {
    it("recursively redacts sensitive keys in nested objects and arrays", () => {
      const payload = {
        transactionId: "tx_123",
        credentials: {
          password: "mySecretPassword123",
          otp_code: "123456",
          authToken: "bearer-sample-token",
        },
        participants: [
          { name: "Tunde", phone_number: "+2348012345678" },
          { name: "Amina", phone: "08011223344" },
        ],
        metadata: {
          regularField: "safe value",
        },
      };

      const sanitized = sanitizeData(payload);

      expect(sanitized.transactionId).toBe("tx_123");
      expect(sanitized.credentials.password).toBe("[REDACTED]");
      expect(sanitized.credentials.otp_code).toBe("[REDACTED]");
      expect(sanitized.credentials.authToken).toBe("[REDACTED]");
      expect(sanitized.participants[0].name).toBe("Tunde");
      expect(sanitized.participants[0].phone_number).toBe("[REDACTED]");
      expect(sanitized.participants[1].phone).toBe("[REDACTED]");
      expect(sanitized.metadata.regularField).toBe("safe value");
    });

    it("does not mutate original object", () => {
      const original = { password: "secretPassword" };
      const result = sanitizeData(original);
      expect(result.password).toBe("[REDACTED]");
      expect(original.password).toBe("secretPassword");
    });

    it("safely handles circular references without infinite loops", () => {
      const circularObj: any = { name: "Root" };
      circularObj.self = circularObj;

      const result = sanitizeData(circularObj);
      expect(result.name).toBe("Root");
      expect(result.self).toBe("[CIRCULAR]");
    });
  });

  describe("sanitizeSentryEvent", () => {
    it("sanitizes request headers, cookies, query_string, and body", () => {
      const mockEvent = {
        event_id: "evt_123",
        message: "Failed to process payment",
        request: {
          url: "https://oyaplan.com/api/verify?token=secret123",
          headers: {
            Authorization: "Bearer top-secret-token",
            "User-Agent": "Mozilla/5.0",
          },
          cookies: "session=sess_abc; auth=secret_cookie",
          data: {
            bvn: "12345678901",
            amount: 50000,
          },
        },
        user: {
          id: "usr_42",
          email: "user@example.com",
          ip_address: "197.210.64.1",
        },
      };

      const sanitized = sanitizeSentryEvent(mockEvent);

      expect(sanitized?.event_id).toBe("evt_123");
      expect(sanitized?.message).toBe("Failed to process payment");
      expect(sanitized?.request?.url).toBe("https://oyaplan.com/api/verify?token=[REDACTED]");
      expect(sanitized?.request?.headers?.Authorization).toBe("[REDACTED]");
      expect(sanitized?.request?.headers?.["User-Agent"]).toBe("Mozilla/5.0");
      expect(sanitized?.request?.cookies).toBe("[REDACTED]");
      expect(sanitized?.request?.data?.bvn).toBe("[REDACTED]");
      expect(sanitized?.request?.data?.amount).toBe(50000);
      expect(sanitized?.user?.id).toBe("usr_42");
      expect(sanitized?.user?.email).toBe("[REDACTED_EMAIL]");
      expect(sanitized?.user?.ip_address).toBe("[REDACTED_IP]");
    });

    it("preserves stack traces and exception types for diagnostics", () => {
      const errorEvent = {
        exception: {
          values: [
            {
              type: "TypeError",
              value: "Cannot read property 'id' of undefined",
              stacktrace: {
                frames: [
                  { filename: "candidateEngine.ts", lineno: 42, function: "calculateCandidates" },
                ],
              },
            },
          ],
        },
      };

      const sanitized = sanitizeSentryEvent(errorEvent);
      expect(sanitized?.exception?.values[0].type).toBe("TypeError");
      expect(sanitized?.exception?.values[0].value).toBe("Cannot read property 'id' of undefined");
      expect(sanitized?.exception?.values[0].stacktrace.frames[0].filename).toBe("candidateEngine.ts");
    });
  });

  describe("sanitizeSentryBreadcrumb", () => {
    it("redacts sensitive text inside breadcrumb messages and data", () => {
      const breadcrumb = {
        category: "xhr",
        message: "POST /auth/login with Authorization: Bearer token123",
        data: {
          url: "https://api.oyaplan.com/auth?token=myToken",
          password: "myRawPassword",
          status_code: 401,
        },
      };

      const sanitized = sanitizeSentryBreadcrumb(breadcrumb);
      expect(sanitized?.message).toBe("POST /auth/login with Authorization: Bearer [REDACTED]");
      expect(sanitized?.data?.password).toBe("[REDACTED]");
      expect(sanitized?.data?.status_code).toBe(401);
      expect(sanitized?.data?.url).toBe("https://api.oyaplan.com/auth?token=[REDACTED]");
    });
  });
});

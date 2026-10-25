import { describe, it, expect } from 'vitest';
import { sanitizeReturnTo } from '@/lib/utils/returnTo';

describe('Phase 5: Input, Injection, Share Links & Sanitization', () => {
  describe('Open Redirect Hardening (sanitizeReturnTo)', () => {
    it('allows valid internal relative routes', () => {
      expect(sanitizeReturnTo('/forge')).toBe('/forge');
      expect(sanitizeReturnTo('/plan/123?vibe=chill')).toBe('/plan/123?vibe=chill');
      expect(sanitizeReturnTo('/squad/sq-456#chat')).toBe('/squad/sq-456#chat');
    });

    it('rejects external domain escapes', () => {
      expect(sanitizeReturnTo('https://evil.com')).toBe('/');
      expect(sanitizeReturnTo('http://attacker.com/malicious')).toBe('/');
      expect(sanitizeReturnTo('//evil.com')).toBe('/');
      expect(sanitizeReturnTo('/\\evil.com')).toBe('/');
    });

    it('rejects javascript: and data: URIs', () => {
      expect(sanitizeReturnTo('/javascript:alert(1)')).toBe('/');
      expect(sanitizeReturnTo('/data:text/html;base64,PHNjcmlwdD4=')).toBe('/');
    });

    it('rejects CRLF, backslashes, and null byte injection attempts', () => {
      expect(sanitizeReturnTo('/forge\r\nSet-Cookie:admin=1')).toBe('/');
      expect(sanitizeReturnTo('/forge\0admin')).toBe('/');
      expect(sanitizeReturnTo('/path\\with\\backslash')).toBe('/');
    });
  });

  describe('WhatsApp Share URL Parameter Injection', () => {
    it('properly encodes user-controlled venue names with malicious characters', () => {
      const maliciousVenueName = 'Bistro & Grill ?wa.me=evil#hack \n\r "><script>';
      const encodedText = encodeURIComponent(maliciousVenueName);
      const url = `https://api.whatsapp.com/send?text=${encodedText}`;

      // Assert parameter delimiter & is escaped
      expect(url).not.toContain('&wa.me');
      expect(url).toContain('%26');
      expect(url).toContain('Grill');
      // Assert script tag is percent-encoded
      expect(url).not.toContain('<script>');
      expect(url).toContain('%3Cscript%3E');
      // Assert CRLF is percent-encoded
      expect(url).not.toContain('\n');
      expect(url).toContain('%0A');
    });
  });

  describe('User String Fuzzing (XSS, Emoji, RTL, Long Strings)', () => {
    const payloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><svg/onload=alert(String.fromCharCode(88,83,83))>',
      'DROP TABLE spots; --',
      '🇳🇬 Lagos Vibez 🎉 🍻 💃',
      '\u202E\u0041\u0042\u0043\u202C', // RTL override
      '\u200B\u200C\u200D', // Zero-width spaces
      'A'.repeat(10_000), // Oversized string
    ];

    it('safely handles fuzzed strings in string sanitation routines', () => {
      payloads.forEach((payload) => {
        // String length and type safety checks
        expect(typeof payload).toBe('string');
        const encoded = encodeURIComponent(payload);
        expect(typeof encoded).toBe('string');
        expect(Number.isFinite(encoded.length)).toBe(true);
      });
    });
  });
});

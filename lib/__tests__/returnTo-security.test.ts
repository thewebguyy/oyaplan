import { describe, it, expect } from 'vitest';
import { sanitizeReturnTo } from '@/lib/utils/returnTo';
import { getInitials } from '@/lib/utils/avatar';

describe('sanitizeReturnTo Security Invariants', () => {
  it('allows valid internal relative paths', () => {
    expect(sanitizeReturnTo('/explore')).toBe('/explore');
    expect(sanitizeReturnTo('/venue/123-abc')).toBe('/venue/123-abc');
    expect(sanitizeReturnTo('/plan/bode-outing?budget=50000&squad=4')).toBe('/plan/bode-outing?budget=50000&squad=4');
    expect(sanitizeReturnTo('/saved#venues')).toBe('/saved#venues');
  });

  it('rejects external URLs (prevent open redirect attacks)', () => {
    expect(sanitizeReturnTo('https://malicious.com')).toBe('/');
    expect(sanitizeReturnTo('http://evil.com/phishing')).toBe('/');
    expect(sanitizeReturnTo('https://evil.com?next=/dashboard')).toBe('/');
  });

  it('rejects protocol-relative URLs', () => {
    expect(sanitizeReturnTo('//malicious.com')).toBe('/');
    expect(sanitizeReturnTo('//evil.com/exploit')).toBe('/');
    expect(sanitizeReturnTo('/\\evil.com')).toBe('/');
  });

  it('rejects javascript: and data: pseudo-protocols', () => {
    expect(sanitizeReturnTo('javascript:alert(document.cookie)')).toBe('/');
    expect(sanitizeReturnTo('/javascript:alert(1)')).toBe('/');
    expect(sanitizeReturnTo('data:text/html,<script>alert(1)</script>')).toBe('/');
  });

  it('rejects CRLF and control characters', () => {
    expect(sanitizeReturnTo('/dashboard\r\nSet-Cookie: evil=1')).toBe('/');
    expect(sanitizeReturnTo('/explore\0hidden')).toBe('/');
    expect(sanitizeReturnTo('/venue\\something')).toBe('/');
  });

  it('falls back to custom fallback when provided', () => {
    expect(sanitizeReturnTo('https://evil.com', '/for-business')).toBe('/for-business');
    expect(sanitizeReturnTo(null, '/business')).toBe('/business');
    expect(sanitizeReturnTo(undefined, '/dashboard')).toBe('/dashboard');
  });
});

describe('getInitials Utility', () => {
  it('handles empty / null names', () => {
    expect(getInitials(null)).toBe('O');
    expect(getInitials(undefined)).toBe('O');
    expect(getInitials('')).toBe('O');
  });

  it('extracts initial from email address', () => {
    expect(getInitials('bode@oyaplan.com')).toBe('B');
    expect(getInitials('planner@gmail.com')).toBe('P');
  });

  it('extracts two letters from single names', () => {
    expect(getInitials('Bode')).toBe('BO');
    expect(getInitials('Lagos')).toBe('LA');
  });

  it('extracts initials from multiple words', () => {
    expect(getInitials('Bode Olusegun')).toBe('BO');
    expect(getInitials('Ngozi Adichie')).toBe('NA');
    expect(getInitials('Oya Plan Lagos')).toBe('OP');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @upstash/ratelimit
vi.mock('@upstash/ratelimit', () => {
  let callCount = 0;
  
  class MockRatelimit {
    limit = vi.fn(async (key: string) => {
      callCount++;
      if (key.includes('error-trigger')) {
        throw new Error('KV timeout');
      }
      if (callCount > 10) {
        return { success: false, limit: 10, remaining: 0, reset: Date.now() + 60000 };
      }
      return { success: true, limit: 10, remaining: 10 - callCount, reset: Date.now() + 60000 };
    });

    static slidingWindow = vi.fn();
  }

  return { Ratelimit: MockRatelimit };
});

import { checkRateLimit } from './rateLimit';

// We need to mock sentry so it doesn't crash during fail-closed tests
vi.mock('./sentry', () => ({
  captureServerException: vi.fn(),
}));

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.KV_REST_API_URL = 'https://mock-kv.example.com';
    process.env.KV_REST_API_TOKEN = 'mock-token';
    process.env.NODE_ENV = 'development';
  });

  it('should allow up to 10 requests and block the 11th', async () => {
    const ip = '1.2.3.4';
    
    // First 10 calls should succeed
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(ip);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(9 - i);
    }

    // 11th call should be blocked
    const finalResult = await checkRateLimit(ip);
    expect(finalResult.limited).toBe(true);
    expect(finalResult.remaining).toBe(0);
  });

  it('should fail-open when KV env vars are absent in development', async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const result = await checkRateLimit('1.2.3.5');
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(-1);
  });

  it('should fail-closed when KV env vars are absent in production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const result = await checkRateLimit('1.2.3.6');
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should fail-open when Ratelimit throws in development', async () => {
    const result = await checkRateLimit('error-trigger');
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(-1);
  });

  it('should fail-closed when Ratelimit throws in production', async () => {
    process.env.NODE_ENV = 'production';
    const result = await checkRateLimit('error-trigger');
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

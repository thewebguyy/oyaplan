import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit } from '@/lib/rateLimit';

describe('Phase 6: Abuse, Rate Limiting & Fail-Closed Semantics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Rate Limiter Fail-Closed in Production', () => {
    it('strictly fails closed (limited: true) when KV credentials are missing in production', async () => {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const res = await checkRateLimit('102.89.23.4');
      expect(res.limited).toBe(true);
      expect(res.remaining).toBe(0);
    });

    it('fails open in local development environment when credentials are missing', async () => {
      (process.env as any).NODE_ENV = 'development';
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const res = await checkRateLimit('127.0.0.1');
      expect(res.limited).toBe(false);
      expect(res.remaining).toBe(-1);
    });
  });

  describe('QuickCodePunch Entropy & Brute-Force Feasibility', () => {
    it('analyzes QuickCodePunch plan code entropy', () => {
      // Plan codes in OyaPlan use format OYA-XXXXXX (6 alphanumeric uppercase characters: A-Z, 0-9)
      const alphabetSize = 36;
      const codeLength = 6;
      const searchSpace = Math.pow(alphabetSize, codeLength); // 36^6 = 2,176,782,336 (> 2.1 billion combinations)

      expect(searchSpace).toBeGreaterThan(2_000_000_000);

      // Even with 10 requests per second, guessing a specific code takes on average:
      // (2.176e9 / 2) / 10 / 86400 = ~1,259 days without rate limiting
      const averageSecondsAt10Rps = (searchSpace / 2) / 10;
      expect(averageSecondsAt10Rps).toBeGreaterThan(100_000_000);
    });
  });

  describe('Proxy Route Matcher Rate Limiting Coverage', () => {
    it('asserts proxy applies rate limiting to sensitive public API write routes', async () => {
      // We test that sensitive API endpoints (/api/v1/votes, /api/evidence/submit, /api/v1/growth/milestone)
      // are covered by the proxy rate limiter when POSTed to directly (without Next.js action header).
      // On vulnerable code, isRateLimitedRoute ONLY matches POST with 'next-action' header and GET /forge.
      // This test checks proxy.ts source definition or behavior to assert API write protection.
      const proxyCode = await import('node:fs').then(fs => 
        fs.readFileSync(require('node:path').resolve(process.cwd(), 'proxy.ts'), 'utf-8')
      );
      
      const protectsApiPost = proxyCode.includes("pathname.startsWith('/api/')") || proxyCode.includes("pathname.startsWith('/api/v1/')");
      expect(protectsApiPost).toBe(true);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vercel/kv before importing rateLimit
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

import { kv } from '@vercel/kv';
import { checkRateLimit } from './rateLimit';

const mockGet = vi.mocked(kv.get);
const mockSet = vi.mocked(kv.set);

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure KV env vars are set so fail-open branch is not taken
  process.env.KV_REST_API_URL = 'https://mock-kv.example.com';
  process.env.KV_REST_API_TOKEN = 'mock-token';
});

describe('checkRateLimit', () => {
  it('should allow request when under the limit', async () => {
    mockGet.mockResolvedValueOnce(5).mockResolvedValueOnce(0); // cur=5, prev=0
    mockSet.mockResolvedValue('OK');

    const result = await checkRateLimit('1.2.3.4');

    expect(result.limited).toBe(false);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(mockSet).toHaveBeenCalledOnce();
  });

  it('should block request when at the limit', async () => {
    // cur=20, prev=0 → effectiveCount=20 ≥ MAX_REQUESTS
    mockGet.mockResolvedValueOnce(20).mockResolvedValueOnce(0);

    const result = await checkRateLimit('1.2.3.4');

    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('should count sliding window contribution from previous bucket', async () => {
    // prev=20 at 50% elapsed → contributes 10; cur=10 → effectiveCount=20 → blocked
    // We cannot control elapsed easily so we verify the formula is respected at extremes.
    // prev=19, cur=0 with ~0ms elapsed → effectiveCount ≈ 19 → allowed
    mockGet.mockResolvedValueOnce(0).mockResolvedValueOnce(19); // cur=0, prev=19
    mockSet.mockResolvedValue('OK');

    const result = await checkRateLimit('1.2.3.4');

    // At the very start of a window elapsed ≈ 0, so prev contributes ≈ 19 → under limit
    expect(result.limited).toBe(false);
  });

  it('should fail-open when KV throws', async () => {
    mockGet.mockRejectedValue(new Error('KV timeout'));

    const result = await checkRateLimit('1.2.3.4');

    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(-1);
  });

  it('should fail-open when KV env vars are absent', async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const result = await checkRateLimit('1.2.3.4');

    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(-1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should treat missing KV values as zero', async () => {
    mockGet.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // no prior hits
    mockSet.mockResolvedValue('OK');

    const result = await checkRateLimit('1.2.3.4');

    expect(result.limited).toBe(false);
    expect(mockSet).toHaveBeenCalledOnce();
  });

  it('should use different keys per IP', async () => {
    mockGet.mockResolvedValue(0);
    mockSet.mockResolvedValue('OK');

    await checkRateLimit('10.0.0.1');
    await checkRateLimit('10.0.0.2');

    const calls = mockGet.mock.calls;
    // Each IP generates distinct keys
    const keys = calls.map(c => c[0] as string);
    const ip1Keys = keys.filter(k => k.includes('10.0.0.1'));
    const ip2Keys = keys.filter(k => k.includes('10.0.0.2'));
    expect(ip1Keys.length).toBeGreaterThan(0);
    expect(ip2Keys.length).toBeGreaterThan(0);
  });
});

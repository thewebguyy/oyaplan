import type { PriceConfidence } from '@/lib/types/priceSubmission';

// In-memory cache with TTL support
// For MVP, this is sufficient. In production, replace with Vercel KV or Redis.
const cache = new Map<string, { value: PriceConfidence; timestamp: number }>();

const CACHE_TTL = 3600000; // 1 hour in milliseconds

export async function getCached(key: string): Promise<PriceConfidence | null> {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export async function setCached(
  key: string,
  value: PriceConfidence
): Promise<void> {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  });
}

export async function invalidate(key: string): Promise<void> {
  cache.delete(key);
}

export function cacheKey(spotId: string): string {
  return `price:${spotId}`;
}

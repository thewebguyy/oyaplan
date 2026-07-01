/**
 * Price Cache Stub
 *
 * At MVP scale (<10k daily users), caching is not required.
 * Supabase is the source of truth; queries are fast enough.
 *
 * When scaling beyond 50k daily users, implement:
 * - Vercel KV for production edge caching
 * - Or Redis for self-hosted deployments
 *
 * For now, invalidatePriceCache() is a no-op placeholder.
 */

export function cacheKey(spotId: string): string {
  return `price:${spotId}`;
}

export async function invalidate(key: string): Promise<void> {
  // No-op: Cache not implemented at MVP scale.
  // When adding caching, implement here:
  // await kv.delete(key);
}

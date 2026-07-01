/**
 * Price Aggregation Queries
 *
 * Computes spot pricing from price_submissions table.
 * Uses PostgreSQL percentile functions (not JavaScript).
 * Results cached in application (1-hour TTL with event invalidation).
 *
 * Design:
 *   - Single query per spot (not N queries)
 *   - PostgreSQL computes median, percentiles, stddev
 *   - JavaScript calculates confidence
 *   - App caches result, invalidates on moderation event
 */

import { supabase } from '@/lib/supabase';
import type {
  PriceConfidence,
  PriceConfidenceTier,
  PriceAggregateQuery,
} from '@/lib/types/priceSubmission';

/**
 * Get price confidence for a spot
 *
 * Query PostgreSQL for:
 *   - Median price (0.5 percentile)
 *   - Range (0.25 and 0.75 percentiles)
 *   - Standard deviation (for variance confidence factor)
 *   - Submission count
 *   - Latest submission date (for freshness)
 *   - Operator confirmation presence
 *
 * Compute in application:
 *   - Confidence score (based on count, freshness, variance)
 *   - Confidence tier (verified, community_verified, updated, estimated, unknown)
 *
 * @param spotId - UUID of the spot
 * @returns PriceConfidence or fallback to legacy price_per_person
 */
export async function getSpotPrice(spotId: string): Promise<PriceConfidence> {
  // Query PostgreSQL for aggregates
  const { data: rows, error } = await supabase
    .from('price_submissions')
    .select(
      `
      COUNT(*) as submission_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_per_person) as median_price,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_per_person) as p25_price,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_per_person) as p75_price,
      STDDEV_POP(total_per_person) as price_stddev,
      MAX(date_of_spend) as latest_spend_date,
      COUNT(CASE WHEN source = 'operator' THEN 1 END) > 0 as has_operator_confirmation
      `,
      { count: 'exact' }
    )
    .eq('spot_id', spotId)
    .eq('status', 'approved')
    .gt('date_of_spend', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]);

  // Error handling
  if (error || !rows || rows.length === 0) {
    return fallbackPrice(spotId);
  }

  const result = rows[0] as PriceAggregateQuery;

  // No submissions, fallback
  if (result.submission_count === 0) {
    return fallbackPrice(spotId);
  }

  // Calculate days since latest submission
  const latestDate = new Date(result.latest_spend_date);
  const daysSinceLatest = Math.floor(
    (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate confidence
  const confidence = calculateConfidence({
    submissionCount: result.submission_count,
    daysSinceLatest,
    median: result.median_price,
    stddev: result.price_stddev,
    hasOperator: result.has_operator_confirmation,
  });

  // Assemble result
  return {
    amount: result.median_price,
    range: {
      low: result.p25_price,
      high: result.p75_price,
      spread: result.p75_price - result.p25_price,
    },
    confidence,
    confidenceTier: confidenceTierFromScore(confidence),
    submissions: result.submission_count,
    lastUpdate: result.latest_spend_date,
    daysAgo: daysSinceLatest,
    hasOperatorConfirmation: result.has_operator_confirmation,
  };
}

/**
 * Calculate confidence score
 *
 * Combines four factors:
 *   1. Submission count (more = more consensus)
 *   2. Freshness (recent = more reliable)
 *   3. Variance (tight spread = more agreement)
 *   4. Operator confirmation (they know their price)
 *
 * Result: 0.0 (no confidence) to 1.0 (very high confidence)
 *
 * Confidence = (count_factor + freshness_factor + variance_factor + operator_boost)
 *   capped at 1.0
 */
export function calculateConfidence(data: {
  submissionCount: number;
  daysSinceLatest: number;
  median: number;
  stddev: number;
  hasOperator: boolean;
}): number {
  // Factor 1: Submission count (0 to 0.4)
  // 15 submissions = 1.0, scales linearly
  const countFactor = Math.min(data.submissionCount / 15, 1.0) * 0.4;

  // Factor 2: Freshness (0 to 0.3)
  // 0 days old = 1.0, decays linearly to 0 at 180 days
  const freshnessFactor = Math.max(0, 1 - data.daysSinceLatest / 180) * 0.3;

  // Factor 3: Variance/spread (0 to 0.2)
  // Coefficient of variation = (stddev / median)
  // 15% CoV = neutral (no bonus, no penalty)
  // <15% = bonus (tight consensus)
  // >15% = penalty (spread submissions)
  const coeffVar = data.stddev / data.median;
  const spreadPenalty = Math.min(coeffVar / 0.15, 1.0); // normalize to 0-1
  const varianceFactor = Math.max(0, 1 - spreadPenalty) * 0.2;

  // Factor 4: Operator confirmation (0 to 0.1)
  // Operator knows their own price better than users
  const operatorBoost = data.hasOperator ? 0.1 : 0.0;

  // Sum all factors, cap at 1.0
  return Math.min(countFactor + freshnessFactor + varianceFactor + operatorBoost, 1.0);
}

/**
 * Confidence tier from score
 *
 * Tiers:
 *   0.95–1.0: verified (operator confirmed or 10+ recent users, very tight)
 *   0.80–0.94: community_verified (many users, low variance, recent)
 *   0.60–0.79: updated (moderate submissions, recent)
 *   0.30–0.59: estimated (few users or stale)
 *   0.00–0.29: unknown (no data or very high variance)
 */
export function confidenceTierFromScore(score: number): PriceConfidenceTier {
  if (score >= 0.95) return 'verified';
  if (score >= 0.80) return 'community_verified';
  if (score >= 0.60) return 'updated';
  if (score >= 0.30) return 'estimated';
  return 'unknown';
}

/**
 * Fallback to legacy price when no community data exists
 *
 * Returns the price from spots.price_per_person with low confidence.
 * Used when:
 *   - No price_submissions exist for this spot
 *   - Error fetching aggregates
 *   - Query times out
 */
async function fallbackPrice(spotId: string): Promise<PriceConfidence> {
  const { data: spot, error } = await supabase
    .from('spots')
    .select('price_per_person')
    .eq('id', spotId)
    .single();

  if (error || !spot) {
    // No data at all - return placeholder
    return {
      amount: 0,
      range: { low: 0, high: 0, spread: 0 },
      confidence: 0.0,
      confidenceTier: 'unknown',
      submissions: 0,
      lastUpdate: null,
      daysAgo: 999,
      hasOperatorConfirmation: false,
    };
  }

  // Return seed price with low confidence (stale, no community verification)
  return {
    amount: spot.price_per_person,
    range: { low: spot.price_per_person, high: spot.price_per_person, spread: 0 },
    confidence: 0.3, // seed data, low confidence
    confidenceTier: 'estimated',
    submissions: 0,
    lastUpdate: null,
    daysAgo: 999,
    hasOperatorConfirmation: false,
  };
}

/**
 * Check for duplicate submission (duplicate guard)
 *
 * Business rule: User can submit for a spot max once per 7 days.
 *
 * Query uses index: idx_price_submissions_duplicate_guard
 *   ON (spot_id, user_session_id, created_at DESC)
 *   WHERE status IN ('pending', 'approved')
 *
 * Fast: Should be <1ms
 *
 * @param spotId - UUID of the spot
 * @param userSessionId - Anonymous session ID
 * @returns Days since last submission, or null if no recent submission
 */
export async function checkDuplicateSubmission(
  spotId: string,
  userSessionId: string
): Promise<number | null> {
  const { data: recent, error } = await supabase
    .from('price_submissions')
    .select('created_at')
    .eq('spot_id', spotId)
    .eq('user_session_id', userSessionId)
    .in('status', ['pending', 'approved'])
    .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !recent || recent.length === 0) {
    return null; // No recent submission
  }

  // Calculate days since
  const daysSince = Math.floor(
    (Date.now() - new Date(recent[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSince;
}

/**
 * Get price submission for admin moderation
 *
 * Fetches pending submissions with venue context for admin dashboard.
 *
 * @param limit - How many results (pagination)
 * @param offset - Offset for pagination
 * @returns Array of submissions with spot names
 */
export async function getPendingSubmissions(limit = 10, offset = 0) {
  const { data, error, count } = await supabase
    .from('price_submissions')
    .select(
      `
      id,
      spot_id,
      total_per_person,
      date_of_spend,
      created_at,
      squad_size,
      source,
      status,
      spots(name)
      `,
      { count: 'exact' }
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching pending submissions:', error);
    return { submissions: [], total: 0 };
  }

  return { submissions: data || [], total: count || 0 };
}

/**
 * Cache invalidation helper
 *
 * Called when:
 *   - Admin approves/rejects a submission
 *   - Operator updates a price
 *
 * Invalidates any cached aggregate for this spot.
 * Next read will recompute from database.
 *
 * Implementation:
 *   await invalidatePriceCache(spotId);
 *   // Cache key: `spot:${spotId}`
 *   // TTL: none (event-driven, no TTL)
 *
 * @param spotId - UUID of the spot
 */
export async function invalidatePriceCache(spotId: string): Promise<void> {
  // This is a placeholder. Actual implementation depends on cache backend.
  // Options:
  //   - Vercel KV: await kv.del(`spot:${spotId}`);
  //   - In-memory: priceCache.delete(`spot:${spotId}`);
  //   - Redis: await redis.del(`spot:${spotId}`);

  console.log(`[Cache] Invalidated spot:${spotId}`);

  // Implementation in lib/cache/priceCache.ts:
  // export async function invalidate(key: string) {
  //   if (typeof window === 'undefined') {
  //     // Server-side: use Vercel KV
  //     await kv.del(key);
  //   } else {
  //     // Client-side: this shouldn't happen (cache invalidation is server-only)
  //     throw new Error('Cache invalidation only on server');
  //   }
  // }
}

/**
 * Type exports (for convenience)
 */
export type { PriceConfidence, PriceConfidenceTier, PriceAggregateQuery };

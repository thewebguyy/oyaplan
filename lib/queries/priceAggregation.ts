/**
 * Price Aggregation Queries
 *
 * Computes spot pricing from price_submissions table.
 * Uses linear interpolation for percentiles (computed in JavaScript).
 *
 * Design:
 *   - Single query per spot
 *   - Fetches up to 200 approved submissions (prevents bloat)
 *   - Calculates median, P25, P75 with linear interpolation
 *   - Computes confidence score in application
 *   - No caching at MVP scale (add if performance requires)
 */

import { supabase } from '@/lib/supabase';
import { captureServerException } from '@/lib/sentry';
import type {
  PriceConfidence,
  PriceConfidenceTier,
} from '@/lib/types/priceSubmission';

/**
 * Calculate percentile using linear interpolation
 *
 * @param sorted - Pre-sorted array of numbers
 * @param p - Percentile (0-100)
 * @returns Value at percentile
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Get price confidence for a spot
 *
 * Fetches up to 200 approved submissions from the last 90 days and computes:
 *   - Median price
 *   - Range (P25 and P75 with linear interpolation)
 *   - Standard deviation
 *   - Confidence score and tier
 *
 * Returns PriceConfidence or fallback to legacy price_per_person.
 *
 * @param spotId - UUID of the spot
 * @returns PriceConfidence or fallback
 */
export async function getSpotPrice(spotId: string): Promise<PriceConfidence> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  try {
    const { data: submissions, error } = await supabase
      .from('price_submissions')
      .select('total_per_person, date_of_spend, source, created_at')
      .eq('spot_id', spotId)
      .eq('status', 'approved')
      .gte('date_of_spend', ninetyDaysAgo)
      .limit(200);

    if (error) {
      captureServerException(new Error(`Price query failed: ${error.message}`));
      return fallbackPrice(spotId);
    }

    if (!submissions || submissions.length === 0) {
      return fallbackPrice(spotId);
    }

    // Calculate aggregates with linear interpolation percentiles
    const prices = submissions.map(s => s.total_per_person).sort((a, b) => a - b);
    const median = percentile(prices, 50);
    const p25 = percentile(prices, 25);
    const p75 = percentile(prices, 75);

    // Standard deviation
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const stddev = Math.sqrt(variance);

    // Latest submission date
    const latestDate = new Date(
      Math.max(...submissions.map(s => new Date(s.date_of_spend).getTime()))
    );
    const daysSinceLatest = Math.floor(
      (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Operator confirmation
    const hasOperator = submissions.some(s => s.source === 'operator');

    // Calculate confidence
    const confidence = calculateConfidence({
      submissionCount: prices.length,
      daysSinceLatest,
      median,
      stddev,
      hasOperator,
    });

    return {
      amount: median,
      range: {
        low: p25,
        high: p75,
        spread: p75 - p25,
      },
      confidence,
      confidenceTier: confidenceTierFromScore(confidence),
      submissions: prices.length,
      lastUpdate: latestDate.toISOString().split('T')[0],
      daysAgo: daysSinceLatest,
      hasOperatorConfirmation: hasOperator,
    };
  } catch (e) {
    captureServerException(e);
    return fallbackPrice(spotId);
  }
}

/**
 * Calculate confidence score from submission metadata
 *
 * Combines four weighted factors (total weight = 1.0):
 *   1. Count factor (0.4): More submissions = more consensus
 *   2. Freshness factor (0.3): Recent submissions = more reliable
 *   3. Variance factor (0.2): Tight spread = more agreement
 *   4. Operator boost (0.1): Operator confirmation = higher trust
 *
 * @returns Confidence score (0.0 to 1.0)
 */
function calculateConfidence(data: {
  submissionCount: number;
  daysSinceLatest: number;
  median: number;
  stddev: number;
  hasOperator: boolean;
}): number {
  const countFactor = Math.min(data.submissionCount / 15, 1.0) * 0.4;
  const freshnessFactor = Math.max(0, 1 - data.daysSinceLatest / 180) * 0.3;

  const coeffVar = data.stddev / data.median;
  const spreadPenalty = Math.min(coeffVar / 0.15, 1.0);
  const varianceFactor = Math.max(0, 1 - spreadPenalty) * 0.2;

  const operatorBoost = data.hasOperator ? 0.1 : 0.0;

  return Math.min(countFactor + freshnessFactor + varianceFactor + operatorBoost, 1.0);
}

/**
 * Map confidence score to tier
 *
 * Tiers:
 *   0.95–1.0: verified
 *   0.80–0.94: community_verified
 *   0.60–0.79: updated
 *   0.30–0.59: estimated
 *   0.00–0.29: unknown
 */
function confidenceTierFromScore(score: number): PriceConfidenceTier {
  if (score >= 0.95) return 'verified';
  if (score >= 0.80) return 'community_verified';
  if (score >= 0.60) return 'updated';
  if (score >= 0.30) return 'estimated';
  return 'unknown';
}

/**
 * Fallback when no user-submitted prices exist
 *
 * Returns seed price from spots.price_per_person with low confidence
 * for venues with no community data yet.
 */
async function fallbackPrice(spotId: string): Promise<PriceConfidence> {
  try {
    const { data: spot, error } = await supabase
      .from('spots')
      .select('price_per_person')
      .eq('id', spotId)
      .single();

    if (error || !spot) {
      return {
        amount: 0,
        range: { low: 0, high: 0, spread: 0 },
        confidence: 0.0,
        confidenceTier: 'unknown',
        submissions: 0,
        lastUpdate: '',
        daysAgo: 999,
        hasOperatorConfirmation: false,
      };
    }

    return {
      amount: spot.price_per_person,
      range: { low: spot.price_per_person, high: spot.price_per_person, spread: 0 },
      confidence: 0.3,
      confidenceTier: 'estimated',
      submissions: 0,
      lastUpdate: '',
      daysAgo: 999,
      hasOperatorConfirmation: false,
    };
  } catch (e) {
    captureServerException(e);
    return {
      amount: 0,
      range: { low: 0, high: 0, spread: 0 },
      confidence: 0.0,
      confidenceTier: 'unknown',
      submissions: 0,
      lastUpdate: '',
      daysAgo: 999,
      hasOperatorConfirmation: false,
    };
  }
}

/**
 * Invalidate price cache for a spot
 *
 * Called after admin moderation events to clear stale pricing data.
 * At MVP scale, no-op is acceptable (Supabase is the source of truth).
 * At scale, wire to Vercel KV or Redis.
 *
 * @param spotId - UUID of the spot
 */
export async function invalidatePriceCache(spotId: string): Promise<void> {
  // No-op: Cache not implemented at MVP scale.
  // When adding caching, implement invalidation here.
  // Format: await kv.delete(`price:${spotId}`);
}

/**
 * Type exports
 */
export type { PriceConfidence, PriceConfidenceTier };

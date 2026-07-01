import { Plan } from '@/lib/types';
import type { PriceConfidence } from '@/lib/types/priceSubmission';
import { getSpotPrice } from '@/lib/queries/priceAggregation';
import { captureServerException } from '@/lib/sentry';

export interface PlanWithPricing extends Plan {
  pricing?: PriceConfidence;
}

/**
 * Enrich a plan with current pricing confidence data
 *
 * Fetches community-submitted prices and calculates confidence.
 * Falls back to seed price if no submissions exist.
 *
 * If pricing fetch fails, returns plan without pricing data.
 * Allows degraded UX: plan still works, just without pricing confidence badge.
 */
export async function enrichPlanWithPricing(plan: Plan): Promise<PlanWithPricing> {
  try {
    const pricing = await getSpotPrice(plan.spot.id);
    return { ...plan, pricing };
  } catch (error) {
    // Log for monitoring, but don't break the plan
    captureServerException(error);
    // Return plan without pricing (graceful degradation)
    return plan;
  }
}

/**
 * Enrich multiple plans with pricing confidence data in parallel
 *
 * Errors in individual enrichment don't fail the whole batch.
 * Each plan either gets pricing or returns without it.
 */
export async function enrichPlansWithPricing(
  plans: Plan[]
): Promise<PlanWithPricing[]> {
  return Promise.all(plans.map(enrichPlanWithPricing));
}

import { Plan } from '@/lib/types';
import type { PriceConfidence } from '@/lib/types/priceSubmission';
import { getSpotPrice } from '@/lib/queries/priceAggregation';

export interface PlanWithPricing extends Plan {
  pricing?: PriceConfidence;
}

/**
 * Enrich a plan with current pricing confidence data.
 * Fetches community-submitted prices and calculates confidence.
 * Falls back to seed price if no submissions exist.
 */
export async function enrichPlanWithPricing(plan: Plan): Promise<PlanWithPricing> {
  try {
    const pricing = await getSpotPrice(plan.spot.id);
    return { ...plan, pricing };
  } catch (error) {
    // If pricing fetch fails, return plan without pricing
    // This ensures the plan is still usable
    console.error(`Failed to enrich plan ${plan.spot.id} with pricing:`, error);
    return plan;
  }
}

/**
 * Enrich multiple plans with pricing confidence data in parallel.
 */
export async function enrichPlansWithPricing(
  plans: Plan[]
): Promise<PlanWithPricing[]> {
  return Promise.all(plans.map(enrichPlanWithPricing));
}

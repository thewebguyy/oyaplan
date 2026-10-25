'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { Plan, ForgeInput, Spot } from '../types';
import { z } from 'zod';
import { getSpotForPricing } from '../queries/spots';
import { DefaultCostEngine } from '../planning/costEngine';
import { DefaultExplainabilityEngine } from '../planning/explainability';
import { createPlanningContext } from '../planning/planningEngine';
import { MatrixTransportProvider } from '../planning/transport';
import { isVenueCurrentlyClosed } from '../planning/closureUtils';
import { normalizeAreaSlug } from '../planning/utils';

// Trust boundary: the client-supplied `plan` is only used to IDENTIFY the venue
// (spot.id). Money fields are still shape-validated so malformed payloads are
// rejected early, but they are never persisted — every cost, the explanation and
// the Verified/Estimated status are recomputed from the database row below.
const sharePlanSchema = z.object({
  plan: z.object({
    spot: z.object({
      id: z.string().uuid()
    }).passthrough(),
    foodCost: z.number().int().nonnegative(),
    transportCost: z.number().int().nonnegative(),
    totalCost: z.number().int().nonnegative(),
    whyItFits: z.string().max(2000)
  }).passthrough(),
  input: z.object({
    startArea: z.string().max(100),
    squadSize: z.number().int().min(1).max(50),
    budget: z.number().int().positive().max(2_000_000),
    vibe: z.string().max(100),
    groupId: z.string().uuid().optional().nullable(),
  }).passthrough()
});

import { SessionResolver } from '../services/identity/sessionResolver';
import { SavedPlanService } from '../services/identity/savedPlanService';

type ShareResult = { success: boolean; id?: string; planCode?: string; error?: string };

/**
 * Recomputes the full plan from a trusted venue row. Returns null when the venue
 * has no usable price — we refuse to fabricate certainty for unpriced venues.
 */
function recomputePlan(spot: Spot, input: ForgeInput): Plan | null {
  const perPerson = Number(spot.price_per_person);
  if (!Number.isFinite(perPerson) || perPerson <= 0) return null;

  const trustedSpot: Spot = { ...spot, price_per_person: perPerson };
  const context = createPlanningContext({
    startArea: normalizeAreaSlug(input.startArea ?? '') || undefined,
    squadSize: input.squadSize,
    budget: input.budget,
    vibe: input.vibe,
    transportMode: 'ride-hailing',
  });

  const [costed] = new DefaultCostEngine().run([{ spot: trustedSpot }], context, new MatrixTransportProvider());
  const [explained] = new DefaultExplainabilityEngine().run([{ ...costed, score: 0 }], context, false);

  return {
    spot: trustedSpot,
    foodCost: explained.activityCost,
    transportCost: explained.transportCost,
    totalCost: explained.totalCost,
    whyItFits: explained.whyItFits,
    explanation: explained.explanation,
    // Transport is currently a flat destination-zone estimate (calculationVersion
    // "temporary-zone-v1"), not a verified route fare. The version tag is persisted
    // so consumers can label it honestly.
    transportEstimate: explained.transportEstimate,
  };
}

export async function createShareablePlan(
  clientPlan: Plan,
  input: ForgeInput
): Promise<ShareResult> {
  try {
    const parseResult = sharePlanSchema.safeParse({ plan: clientPlan, input });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid plan data' };
    }

    // 1. Resolve the venue from the database. A client-supplied id is only a reference.
    const { data: spot, error: spotError } = await getSpotForPricing(clientPlan.spot.id);
    if (spotError) {
      captureServerException(new Error(`sharePlan spot lookup error: ${spotError}`));
      return { success: false, error: 'Failed to create plan' };
    }
    if (!spot || spot.active === false || isVenueCurrentlyClosed(spot)) {
      return { success: false, error: 'Venue is not available' };
    }

    // 2. Recompute every cost component server-side.
    const plan = recomputePlan(spot, input);
    if (!plan) {
      return { success: false, error: 'Pricing is unavailable for this venue' };
    }

    if (clientPlan.totalCost !== plan.totalCost) {
      // Stale client state or tampering — the server value always wins.
      console.warn('[sharePlan] client total differs from server-computed total', {
        spotId: spot.id,
        clientTotal: clientPlan.totalCost,
        serverTotal: plan.totalCost,
      });
    }

    const identity = await SessionResolver.resolveIdentity();
    const userId = identity.type === 'authenticated' ? identity.profile.id : null;
    const sessionId = identity.sessionId;

    const { data, error } = await supabase
      .from('shared_plans')
      .insert({
        start_area: input.startArea,
        squad_size: input.squadSize,
        budget: input.budget,
        vibe: input.vibe,
        spot_id: spot.id,
        food_cost: plan.foodCost,
        transport_cost: plan.transportCost,
        total_cost: plan.totalCost,
        why_it_fits: plan.whyItFits,
        transport_estimate: plan.transportEstimate || null,
        explanation: plan.explanation || null,
        user_id: userId,
        session_id: sessionId,
        group_id: input.groupId || null,
      })
      .select('id, plan_code')
      .single();

    if (error) {
      captureServerException(new Error(`sharePlan Supabase error: ${error.message}`));
      return { success: false, error: 'Failed to create plan' };
    }

    // If logged in, automatically associate in user_saved_plans
    if (userId && data.id) {
      await SavedPlanService.savePlan(data.id).catch(console.error);
    }

    return { success: true, id: data.id, planCode: data.plan_code };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

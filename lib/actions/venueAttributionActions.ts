'use server';

import { createServerClient } from '@/lib/supabase-server';
import { checkVenueAuthorization } from '@/lib/queries/partner';
import { revalidatePath } from 'next/cache';
import { AttributedVisit } from '@/lib/types';
import { normalizePlanCode } from '@/lib/utils/planCodeUtils';

export interface VerifyVisitResult {
  success: boolean;
  error?: string;
  alreadyConfirmed?: boolean;
  visit?: AttributedVisit;
  message?: string;
}

/**
 * verifyVenueVisitAction
 * 
 * Verifies and records an attributed customer visit from an OyaPlan shared plan.
 * Strict trust invariants:
 * 1. Normalized exact lookup on shared_plans.plan_code.
 * 2. Strict venue match: spot_id must equal venueId.
 * 3. Safe generic error for other venues: "This plan isn't for this venue."
 * 4. Idempotent: repeat submission returns existing record without duplicating.
 * 5. Strict fact separation: Records confirmed visit intent match, NOT cash or reservation.
 */
export async function verifyVenueVisitAction(
  venueId: string,
  rawPlanCode: string
): Promise<VerifyVisitResult> {
  try {
    if (!venueId) {
      return { success: false, error: 'Venue ID is required.' };
    }

    const normalizedCode = normalizePlanCode(rawPlanCode);
    if (!normalizedCode || normalizedCode.length < 5) {
      return { success: false, error: 'Please enter a valid plan code (e.g. OYA-7K4M2P).' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    // Server-side authorization check
    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) {
      return { success: false, error: 'Unauthorized to verify visits for this venue.' };
    }

    // 1. Look up plan by exact public plan_code
    const { data: plan, error: planError } = await supabase
      .from('shared_plans')
      .select('id, plan_code, spot_id, squad_size, total_cost, budget, created_at')
      .eq('plan_code', normalizedCode)
      .maybeSingle();

    if (planError) {
      return { success: false, error: 'Failed to look up plan code.' };
    }

    if (!plan) {
      return {
        success: false,
        error: 'Plan code not found. Please double-check the code shown on the guest’s phone.'
      };
    }

    // 2. Strict venue boundary check
    if (plan.spot_id !== venueId) {
      // Intentionally generic: never leak details or IDs of other venues
      return {
        success: false,
        error: "This plan isn't for this venue."
      };
    }

    // 3. Idempotency check: see if already attributed
    const { data: existingVisit } = await supabase
      .from('venue_attributed_visits')
      .select('*')
      .eq('venue_id', venueId)
      .eq('shared_plan_id', plan.id)
      .maybeSingle();

    if (existingVisit) {
      return {
        success: true,
        alreadyConfirmed: true,
        visit: existingVisit as AttributedVisit,
        message: 'This squad visit was already confirmed earlier.'
      };
    }

    // 4. Record new attributed visit
    const actorIdentifier = user.email || user.id;
    const { data: newVisit, error: insertError } = await supabase
      .from('venue_attributed_visits')
      .insert({
        venue_id: venueId,
        shared_plan_id: plan.id,
        plan_code: plan.plan_code || normalizedCode,
        squad_size: plan.squad_size || 1,
        estimated_total_cost: plan.total_cost || null,
        confirmed_by: actorIdentifier,
      })
      .select('*')
      .single();

    if (insertError) {
      // Handle unique conflict gracefully in case of race condition
      if (insertError.code === '23505') {
        const { data: concurrentVisit } = await supabase
          .from('venue_attributed_visits')
          .select('*')
          .eq('venue_id', venueId)
          .eq('shared_plan_id', plan.id)
          .single();

        return {
          success: true,
          alreadyConfirmed: true,
          visit: concurrentVisit as AttributedVisit,
          message: 'This squad visit was already confirmed.'
        };
      }
      return { success: false, error: insertError.message };
    }

    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/activity`);

    return {
      success: true,
      alreadyConfirmed: false,
      visit: newVisit as AttributedVisit,
      message: 'Squad visit confirmed successfully.'
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred while verifying plan.'
    };
  }
}

/**
 * Fetches recent attributed visits for a venue to display in the business portal.
 */
export async function getVenueAttributedVisitsAction(
  venueId: string,
  limit: number = 20
): Promise<{ success: boolean; visits: AttributedVisit[]; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, visits: [], error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, visits: [], error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('venue_attributed_visits')
      .select('*')
      .eq('venue_id', venueId)
      .order('confirmed_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, visits: [], error: error.message };

    return { success: true, visits: (data || []) as AttributedVisit[] };
  } catch (err: unknown) {
    return {
      success: false,
      visits: [],
      error: err instanceof Error ? err.message : 'Failed to fetch visits'
    };
  }
}

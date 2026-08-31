'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';

interface ActualSpendInput {
  sharedPlanId: string | null;
  spotId: string | null;
  estimatedTotal: number;
  actualTotal: number;
  notes?: string | null;
}

/**
 * submitActualSpend — Server Action
 *
 * Records what a squad actually spent after an outing.
 * As per strategic constraints, this acts strictly as an observation layer.
 * A single user report NEVER automatically mutates canonical venue pricing.
 * It is fed into the DB so that future human/aggregated intelligence pipelines 
 * can perform recalibration.
 *
 * No authentication required — anonymous-first principle.
 */
export async function submitActualSpend(
  input: ActualSpendInput
): Promise<{ success: boolean; error?: string }> {
  // Runtime validation
  if (
    typeof input.actualTotal !== 'number' ||
    !Number.isInteger(input.actualTotal) ||
    input.actualTotal <= 0 ||
    input.actualTotal > 10_000_000
  ) {
    return { success: false, error: 'actualTotal must be a positive integer ≤ ₦10,000,000' };
  }

  if (
    typeof input.estimatedTotal !== 'number' ||
    !Number.isInteger(input.estimatedTotal) ||
    input.estimatedTotal < 0
  ) {
    return { success: false, error: 'estimatedTotal must be a positive integer' };
  }

  if (input.notes !== null && input.notes !== undefined) {
    if (typeof input.notes !== 'string' || input.notes.length > 500) {
      return { success: false, error: 'notes must be a string ≤ 500 characters' };
    }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (input.sharedPlanId && !uuidRegex.test(input.sharedPlanId)) {
    return { success: false, error: 'sharedPlanId must be a valid UUID' };
  }
  if (input.spotId && !uuidRegex.test(input.spotId)) {
    return { success: false, error: 'spotId must be a valid UUID' };
  }

  try {
    const { error } = await supabase.from('actual_spend_reports').insert({
      shared_plan_id: input.sharedPlanId || null,
      spot_id: input.spotId || null,
      estimated_total: input.estimatedTotal,
      actual_total: input.actualTotal,
      notes: input.notes?.trim() || null,
    });

    if (error) {
      captureServerException(new Error(`submitActualSpend error: ${error.message}`));
      return { success: false, error: 'Failed to record spend. Please try again.' };
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'Unexpected error recording spend.' };
  }
}


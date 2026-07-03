'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { processRawEvidence } from '../services/normalizationLayer';

interface ActualSpendInput {
  sharedPlanId: string | null;
  spotId: string | null;
  estimatedTotal: number;
  actualTotal: number;
  notes?: string | null;
}

/**
 * FLYWHEEL THRESHOLD
 * When actual spend deviates from the estimate by more than this percentage,
 * we inject a corrective price evidence record into the normalization pipeline.
 * This triggers aggregateVenuePricing → updated derived_typical_cost + confidence.
 *
 * 15% chosen to filter noise (rounding, drinks splits, extra items) while still
 * catching genuine price changes (venue repriced, menu changed, different season).
 *
 * At 10%: too sensitive — normal squad variation triggers it
 * At 20%: too loose — real price changes go undetected for longer
 */
const FLYWHEEL_VARIANCE_THRESHOLD_PCT = 15;

/**
 * SQUAD SIZE NORMALIZER
 * We only store total squad spend, not per-person. To inject a meaningful
 * per-item price into menu_items, we use a fixed squad-size normalization
 * factor of 2 (standard pair outing) since shared_plans doesn't store
 * squad_size in a reliably queryable way here.
 * This is an approximation — a deliberate engineering tradeoff.
 * The normalization layer will reconcile across multiple evidence points.
 */
const DEFAULT_SQUAD_SIZE_ESTIMATE = 2;

/**
 * submitActualSpend — Server Action
 *
 * Records what a squad actually spent after an outing.
 * When the spend diverges from our estimate by >15%, it injects a corrective
 * price evidence record into the normalizationLayer. This re-triggers venue
 * aggregation, improving future estimates. This is the pricing flywheel.
 *
 * No authentication required — anonymous-first principle.
 */
export async function submitActualSpend(
  input: ActualSpendInput
): Promise<{ success: boolean; error?: string }> {
  // Runtime validation — TypeScript types are erased at runtime
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
    input.estimatedTotal <= 0
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
    // 1. Store the raw spend report
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

    // 2. THE FLYWHEEL: inject corrective evidence when variance is significant
    // Only fires when we have a spotId to anchor the evidence to a venue
    if (input.spotId) {
      const variance = Math.abs(
        (input.actualTotal - input.estimatedTotal) / input.estimatedTotal
      ) * 100;

      if (variance >= FLYWHEEL_VARIANCE_THRESHOLD_PCT) {
        // Derive a per-person cost estimate from the actual squad spend
        const perPersonActual = Math.round(
          input.actualTotal / DEFAULT_SQUAD_SIZE_ESTIMATE / 100
        ) * 100;

        // Inject as historical_estimate — auto-approved, no admin review needed.
        // This is the least opinionated evidence type: it's a real-world observation
        // but we can't guarantee which specific item it maps to.
        // We use the canonical "Typical Spend Item" name so normalizationLayer
        // upserts against an existing menu item if one was seeded by migrate-phase2-data.js
        const evidenceResult = await processRawEvidence({
          venue_id: input.spotId,
          menu_item_name: 'Typical Spend Item',
          category: 'main',
          price: perPersonActual,
          source_type: 'historical_estimate',
          submitted_by: 'actual_spend_flywheel',
        });

        if (!evidenceResult.success) {
          // Non-fatal: the spend report was already saved. Log and continue.
          console.error(
            `Flywheel evidence injection failed for venue ${input.spotId}:`,
            evidenceResult.error
          );
        }
      }
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'Unexpected error recording spend.' };
  }
}


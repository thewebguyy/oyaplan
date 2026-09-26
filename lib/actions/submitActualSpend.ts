'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { VarianceEngine, VarianceAnalysis } from '../trust/varianceEngine';

export interface ActualSpendInput {
  sharedPlanId?: string | null;
  spotId?: string | null;
  estimatedTotal: number;
  actualTotal?: number | null;
  actualSquadSize?: number | null;
  plannedSquadSize?: number | null;
  didGo?: boolean;
  didNotGoReason?: string | null;
  pricesMatched?: 'yes' | 'mostly' | 'no' | 'not_sure' | null;
  operationalIssue?: 'none' | 'closed' | 'extra_fee' | 'wrong_hours' | 'wrong_price' | 'reservation_required' | 'other' | null;
  notes?: string | null;
}

export interface ActualSpendResult {
  success: boolean;
  error?: string;
  variance?: VarianceAnalysis;
  didGo?: boolean;
}

/**
 * submitActualSpend — Server Action
 *
 * Records what a squad actually spent after an outing and captures structured accuracy signals.
 * As per strategic constraints:
 * - A single user report NEVER automatically mutates canonical venue pricing.
 * - If user did not go, we capture the reason without distorting spend tables with ₦0.
 * - Significant variances (>15% or >30%) or operational issues queue appropriate reviews.
 * - Anonymous-first principle: no authentication required.
 */
export async function submitActualSpend(
  input: ActualSpendInput
): Promise<ActualSpendResult> {
  const didGo = input.didGo !== false; // Default true if unspecified (for legacy callers)

  // 1. Handle "Did Not Go" scenario
  if (!didGo) {
    // If user didn't go because venue was closed or had an issue, route to change requests
    if (input.spotId && input.operationalIssue && input.operationalIssue !== 'none') {
      try {
        const issueCategory = input.operationalIssue === 'closed' 
          ? 'closed_temporarily' 
          : input.operationalIssue === 'wrong_hours' 
            ? 'wrong_hours' 
            : 'other';

        await supabase.from('venue_change_requests').insert({
          venue_id: input.spotId,
          category: issueCategory,
          details: `Outing canceled: ${input.didNotGoReason || input.notes || 'Reported closed during planned outing'}.`,
          status: 'pending',
        });
      } catch (e) {
        captureServerException(e);
      }
    }

    return { success: true, didGo: false };
  }

  // 2. Validate Actual Total Spend
  const actualTotal = input.actualTotal;
  if (
    typeof actualTotal !== 'number' ||
    !Number.isInteger(actualTotal) ||
    actualTotal <= 0 ||
    actualTotal > 10_000_000
  ) {
    return { success: false, error: 'Enter a valid total spend amount in Naira (≤ ₦10,000,000).' };
  }

  if (
    typeof input.estimatedTotal !== 'number' ||
    !Number.isInteger(input.estimatedTotal) ||
    input.estimatedTotal < 0
  ) {
    return { success: false, error: 'Estimated total must be a valid positive integer.' };
  }

  if (input.notes !== null && input.notes !== undefined) {
    if (typeof input.notes !== 'string' || input.notes.length > 500) {
      return { success: false, error: 'Notes must be ≤ 500 characters.' };
    }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (input.sharedPlanId && !uuidRegex.test(input.sharedPlanId)) {
    return { success: false, error: 'Invalid shared plan ID.' };
  }
  if (input.spotId && !uuidRegex.test(input.spotId)) {
    return { success: false, error: 'Invalid spot/venue ID.' };
  }

  // 3. Analyze Variance using the deterministic VarianceEngine
  const varianceAnalysis = VarianceEngine.analyzeVariance({
    estimatedTotal: input.estimatedTotal,
    actualTotal,
    plannedSquadSize: input.plannedSquadSize || undefined,
    actualSquadSize: input.actualSquadSize || undefined,
    userNotes: input.notes,
    pricesMatchedAnswer: input.pricesMatched,
  });

  try {
    // 4. Store Observation in actual_spend_reports
    const { error: spendError } = await supabase.from('actual_spend_reports').insert({
      shared_plan_id: input.sharedPlanId || null,
      spot_id: input.spotId || null,
      estimated_total: input.estimatedTotal,
      actual_total: actualTotal,
      notes: input.notes?.trim() || (input.pricesMatched ? `Prices matched: ${input.pricesMatched}` : null),
    });

    if (spendError) {
      captureServerException(new Error(`submitActualSpend error: ${spendError.message}`));
      return { success: false, error: 'Failed to record spend. Please try again.' };
    }

    // 5. If pricing did not match or operational issue flagged, create venue_change_request for ops review
    if (
      input.spotId &&
      (input.pricesMatched === 'no' || (input.operationalIssue && input.operationalIssue !== 'none'))
    ) {
      const issueCategory = 
        input.operationalIssue === 'closed' ? 'closed_temporarily' :
        input.operationalIssue === 'wrong_hours' ? 'wrong_hours' :
        input.operationalIssue === 'extra_fee' ? 'wrong_price' :
        input.pricesMatched === 'no' ? 'wrong_price' : 'other';

      const details = [
        input.pricesMatched === 'no' ? 'User reported menu prices differed from venue.' : null,
        input.operationalIssue ? `Issue: ${input.operationalIssue}` : null,
        input.notes ? `Context: ${input.notes}` : null,
        `Reported actual spend: ₦${actualTotal.toLocaleString('en-NG')} (estimated ₦${input.estimatedTotal.toLocaleString('en-NG')})`,
      ].filter(Boolean).join(' • ');

      try {
        await supabase.from('venue_change_requests').insert({
          venue_id: input.spotId,
          category: issueCategory,
          details,
          status: 'pending',
        });
      } catch (err) {
        // Non-blocking catch for change request
        captureServerException(err);
      }
    }

    return { 
      success: true, 
      didGo: true,
      variance: varianceAnalysis,
    };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'Unexpected error recording spend.' };
  }
}

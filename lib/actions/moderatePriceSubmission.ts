'use server';

import { supabase } from '@/lib/supabase';
import { invalidatePriceCache } from '@/lib/queries/priceAggregation';

export class ModerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModerationError';
  }
}

export async function approvePriceSubmission(
  submissionId: string,
  adminId: string
): Promise<{ id: string; status: string; spotId: string }> {
  if (!submissionId || typeof submissionId !== 'string') {
    throw new ModerationError('submissionId is required');
  }
  if (!adminId || typeof adminId !== 'string') {
    throw new ModerationError('adminId is required');
  }

  // Get the submission to find the spot
  const { data: submission, error: fetchError } = await supabase
    .from('price_submissions')
    .select('id, spot_id, status')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    throw new ModerationError(`Submission not found: ${fetchError?.message}`);
  }

  // Update status to approved
  const { error: updateError } = await supabase
    .from('price_submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('id', submissionId);

  if (updateError) {
    throw new ModerationError(`Failed to approve: ${updateError.message}`);
  }

  // Invalidate cache
  await invalidatePriceCache(submission.spot_id);

  return {
    id: submissionId,
    status: 'approved',
    spotId: submission.spot_id,
  };
}

export async function rejectPriceSubmission(
  submissionId: string,
  adminId: string,
  rejectionReason: string
): Promise<{ id: string; status: string; spotId: string }> {
  if (!submissionId || typeof submissionId !== 'string') {
    throw new ModerationError('submissionId is required');
  }
  if (!adminId || typeof adminId !== 'string') {
    throw new ModerationError('adminId is required');
  }
  if (!rejectionReason || typeof rejectionReason !== 'string') {
    throw new ModerationError('rejectionReason is required');
  }
  if (rejectionReason.length > 500) {
    throw new ModerationError('rejectionReason must be 500 characters or less');
  }

  // Get the submission to find the spot
  const { data: submission, error: fetchError } = await supabase
    .from('price_submissions')
    .select('id, spot_id, status')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    throw new ModerationError(`Submission not found: ${fetchError?.message}`);
  }

  // Update status to rejected
  const { error: updateError } = await supabase
    .from('price_submissions')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('id', submissionId);

  if (updateError) {
    throw new ModerationError(`Failed to reject: ${updateError.message}`);
  }

  // Invalidate cache
  await invalidatePriceCache(submission.spot_id);

  return {
    id: submissionId,
    status: 'rejected',
    spotId: submission.spot_id,
  };
}

'use server';

import { createServerClient } from '@/lib/supabase-server';
import { invalidatePriceCache } from '@/lib/queries/priceAggregation';

export class ModerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModerationError';
  }
}

export async function approvePriceSubmission(
  submissionId: string
): Promise<{ id: string; status: string; spotId: string }> {
  if (!submissionId || typeof submissionId !== 'string') {
    throw new ModerationError('submissionId is required');
  }

  const serverClient = await createServerClient();
  const { data: { user }, error: authError } = await serverClient.auth.getUser();

  if (authError || !user) {
    throw new ModerationError('Unauthorized: not authenticated');
  }

  // Get the submission to find the spot
  const { data: submission, error: fetchError } = await serverClient
    .from('price_submissions')
    .select('id, spot_id, status')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    throw new ModerationError(`Submission not found: ${fetchError?.message}`);
  }

  // Only allow update if status is 'pending' (idempotency)
  const { data: updated, error: updateError } = await serverClient
    .from('price_submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', submissionId)
    .eq('status', 'pending')
    .select('status')
    .single();

  if (updateError) {
    throw new ModerationError(`Failed to approve: ${updateError.message}`);
  }

  if (!updated) {
    throw new ModerationError('Submission already reviewed or not found');
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
  rejectionReason: string
): Promise<{ id: string; status: string; spotId: string }> {
  if (!submissionId || typeof submissionId !== 'string') {
    throw new ModerationError('submissionId is required');
  }
  if (!rejectionReason || typeof rejectionReason !== 'string') {
    throw new ModerationError('rejectionReason is required');
  }
  if (rejectionReason.length > 500) {
    throw new ModerationError('rejectionReason must be 500 characters or less');
  }

  const serverClient = await createServerClient();
  const { data: { user }, error: authError } = await serverClient.auth.getUser();

  if (authError || !user) {
    throw new ModerationError('Unauthorized: not authenticated');
  }

  // Get the submission to find the spot
  const { data: submission, error: fetchError } = await serverClient
    .from('price_submissions')
    .select('id, spot_id, status')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    throw new ModerationError(`Submission not found: ${fetchError?.message}`);
  }

  // Only allow update if status is 'pending' (idempotency)
  const { data: updated, error: updateError } = await serverClient
    .from('price_submissions')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', submissionId)
    .eq('status', 'pending')
    .select('status')
    .single();

  if (updateError) {
    throw new ModerationError(`Failed to reject: ${updateError.message}`);
  }

  if (!updated) {
    throw new ModerationError('Submission already reviewed or not found');
  }

  // Invalidate cache
  await invalidatePriceCache(submission.spot_id);

  return {
    id: submissionId,
    status: 'rejected',
    spotId: submission.spot_id,
  };
}

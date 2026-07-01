'use server';

import { supabase } from '@/lib/supabase';
import type { CreatePriceSubmissionInput } from '@/lib/types/priceSubmission';

export class PriceSubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PriceSubmissionValidationError';
  }
}

export class DuplicateSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateSubmissionError';
  }
}

export async function submitPriceEvidence(
  input: Partial<CreatePriceSubmissionInput>
): Promise<{ id: string; status: string }> {
  // Validate required fields
  if (!input.spotId || typeof input.spotId !== 'string') {
    throw new PriceSubmissionValidationError('spotId is required');
  }
  if (input.totalPerPerson === undefined || input.totalPerPerson === null) {
    throw new PriceSubmissionValidationError('totalPerPerson is required');
  }
  if (typeof input.totalPerPerson !== 'number') {
    throw new PriceSubmissionValidationError('totalPerPerson must be a number');
  }

  // Validate price range (10k - 500k Naira reasonable for Lagos venues)
  if (input.totalPerPerson < 1000 || input.totalPerPerson > 500000) {
    throw new PriceSubmissionValidationError(
      'Price must be between ₦1,000 and ₦500,000'
    );
  }

  // Validate date
  if (input.dateOfSpend && new Date(input.dateOfSpend) > new Date()) {
    throw new PriceSubmissionValidationError('Date of spend cannot be in the future');
  }

  // Validate session ID
  if (!input.sessionId || typeof input.sessionId !== 'string') {
    throw new PriceSubmissionValidationError('sessionId is required');
  }

  // Duplicate submission check (once per 7 days per spot)
  const { data: recent, error: checkError } = await supabase
    .from('price_submissions')
    .select('created_at', { count: 'exact' })
    .eq('spot_id', input.spotId)
    .eq('user_session_id', input.sessionId)
    .in('status', ['pending', 'approved'])
    .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (checkError) {
    throw new Error(`Duplicate check failed: ${checkError.message}`);
  }

  if (recent && recent.length > 0) {
    throw new DuplicateSubmissionError(
      'You already submitted a price for this spot in the last 7 days'
    );
  }

  // Insert submission with pending status
  const { data, error } = await supabase
    .from('price_submissions')
    .insert({
      spot_id: input.spotId,
      user_session_id: input.sessionId,
      total_per_person: input.totalPerPerson,
      date_of_spend: input.dateOfSpend || new Date().toISOString().split('T')[0],
      food_cost: input.foodCost || null,
      drink_cost: input.drinkCost || null,
      transport_cost: input.transportCost || null,
      squad_size: input.squadSize || null,
      source: 'user',
      source_id: input.sessionId,
      status: 'pending',
    })
    .select('id, status')
    .single();

  if (error || !data) {
    throw new Error(`Failed to submit price: ${error?.message}`);
  }

  return { id: data.id, status: data.status };
}

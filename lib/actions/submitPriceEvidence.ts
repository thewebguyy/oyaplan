'use server';

import { supabase } from '@/lib/supabase';
import { captureServerException } from '@/lib/sentry';
import type { CreatePriceSubmissionInput } from '@/lib/types/priceSubmission';
import { PriceSubmissionValidationError, DuplicateSubmissionError } from '@/lib/types/priceSubmission';
import { headers } from 'next/headers';
import crypto from 'crypto';

async function generateServerSessionId(): Promise<string> {
  // Generate server-side session ID from IP + user-agent hash
  // This prevents client-side sessionId spoofing
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  const timestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000)); // Daily key rotation

  const hash = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${timestamp}`)
    .digest('hex');

  return hash.substring(0, 32);
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

  // Validate date (compare ISO date strings, not Date objects, to avoid timezone issues)
  if (input.dateOfSpend) {
    const today = new Date().toISOString().split('T')[0];
    if (input.dateOfSpend > today) {
      throw new PriceSubmissionValidationError('Date of spend cannot be in the future');
    }
  }

  // Validate cost breakdowns
  if (input.foodCost !== undefined && input.foodCost !== null) {
    if (input.foodCost < 0 || input.foodCost > input.totalPerPerson) {
      throw new PriceSubmissionValidationError('Food cost cannot exceed total price');
    }
  }

  if (input.drinkCost !== undefined && input.drinkCost !== null) {
    if (input.drinkCost < 0 || input.drinkCost > input.totalPerPerson) {
      throw new PriceSubmissionValidationError('Drink cost cannot exceed total price');
    }
  }

  if (input.transportCost !== undefined && input.transportCost !== null) {
    if (input.transportCost < 0 || input.transportCost > input.totalPerPerson * 0.5) {
      throw new PriceSubmissionValidationError('Transport cost is unreasonable');
    }
  }

  const breakdown = (input.foodCost || 0) + (input.drinkCost || 0);
  if (breakdown > input.totalPerPerson * 1.1) {
    throw new PriceSubmissionValidationError('Food + drink breakdown exceeds total price');
  }

  // Generate server-side session ID (prevents spoofing)
  const serverSessionId = await generateServerSessionId();

  // Duplicate submission check (once per 7 days per spot)
  // Uses database constraint as backup
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: checkError } = await supabase
    .from('price_submissions')
    .select('created_at')
    .eq('spot_id', input.spotId)
    .eq('user_session_id', serverSessionId)
    .in('status', ['pending', 'approved'])
    .gt('created_at', sevenDaysAgo)
    .limit(1);

  if (checkError) {
    captureServerException(new Error(`Duplicate check failed: ${checkError.message}`));
    throw new Error('Could not verify submission eligibility');
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
      user_session_id: serverSessionId,
      total_per_person: input.totalPerPerson,
      date_of_spend: input.dateOfSpend || new Date().toISOString().split('T')[0],
      food_cost: input.foodCost || null,
      drink_cost: input.drinkCost || null,
      transport_cost: input.transportCost || null,
      squad_size: input.squadSize || null,
      source: 'user',
      source_id: null,
      status: 'pending',
    })
    .select('id, status')
    .single();

  if (error || !data) {
    captureServerException(new Error(`Failed to submit price: ${error?.message}`));
    throw new Error(`Failed to submit price`);
  }

  return { id: data.id, status: data.status };
}

'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { z } from 'zod';

const submitSpotSuggestionSchema = z.object({
  spotName: z.string().trim().min(1).max(100),
  areaName: z.string().trim().min(1).max(100),
  vibeDescription: z.string().trim().max(500).optional(),
  roughPricePerPerson: z.number().nullable().optional(),
  // Plausible international or local phone number format (starts with optional +, then digits, min 7, max 15)
  suggesterWhatsapp: z.string().trim().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number format').nullable().optional(),
});

export async function submitSpotSuggestion(input: {
  spotName: string;
  areaName: string;
  vibeDescription?: string;
  roughPricePerPerson?: number | null;
  suggesterWhatsapp?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  
  const parseResult = submitSpotSuggestionSchema.safeParse(input);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid input data' };
  }

  const { spotName, areaName, vibeDescription, roughPricePerPerson, suggesterWhatsapp } = parseResult.data;

  try {
    const { error } = await supabase.from('spot_suggestions').insert({
      spot_name: spotName,
      area_name: areaName,
      vibe_description: vibeDescription || null,
      rough_price_per_person: roughPricePerPerson ?? null,
      suggester_whatsapp: suggesterWhatsapp || null,
    });

    if (error) {
      captureServerException(new Error(`submitSpotSuggestion error: ${error.message}`));
      return { success: false, error: 'Failed to submit suggestion' };
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

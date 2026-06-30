'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';

export async function submitSpotSuggestion(input: {
  spotName: string;
  areaName: string;
  vibeDescription?: string;
  roughPricePerPerson?: number | null;
  suggesterWhatsapp?: string | null;
}): Promise<{ success: boolean }> {
  const { spotName, areaName, vibeDescription, roughPricePerPerson, suggesterWhatsapp } = input;

  if (typeof spotName !== 'string' || spotName.trim().length === 0) {
    return { success: false };
  }
  if (spotName.trim().length > 100) return { success: false };
  if (typeof areaName !== 'string' || areaName.trim().length === 0) {
    return { success: false };
  }
  if (areaName.trim().length > 100) return { success: false };

  try {
    const { error } = await supabase.from('spot_suggestions').insert({
      spot_name: spotName.trim(),
      area_name: areaName.trim(),
      vibe_description: vibeDescription?.trim() || null,
      rough_price_per_person: roughPricePerPerson ?? null,
      suggester_whatsapp: suggesterWhatsapp?.trim() || null,
    });

    if (error) {
      captureServerException(new Error(`submitSpotSuggestion error: ${error.message}`));
      return { success: false };
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false };
  }
}

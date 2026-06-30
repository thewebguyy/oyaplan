'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';

export async function submitPriceFlag(
  spotId: string,
  flagType: 'up' | 'down'
): Promise<{ success: boolean }> {
  if (!spotId || typeof spotId !== 'string' || spotId.trim().length === 0) {
    return { success: false };
  }
  if (flagType !== 'up' && flagType !== 'down') {
    return { success: false };
  }

  try {
    const { error } = await supabase.from('price_flags').insert({
      spot_id: spotId,
      flag_type: flagType,
    });

    if (error) {
      captureServerException(new Error(`submitPriceFlag error: ${error.message}`));
      return { success: false };
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false };
  }
}

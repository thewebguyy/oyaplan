'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { submitSpotSuggestion } from './submitSpotSuggestion';

export async function submitFeedback(input: {
  testerName: string;
  device: string;
  whatTried: string;
  whatFrustrated?: string;
  whatWished?: string;
  spotName?: string;
  spotArea?: string;
  spotPrice?: string;
  whatsapp?: string;
}): Promise<{ success: boolean }> {
  const { testerName, device, whatTried, whatFrustrated, whatWished, spotName, spotArea, spotPrice, whatsapp } = input;

  if (typeof testerName !== 'string' || testerName.trim().length === 0) return { success: false };
  if (testerName.trim().length > 80) return { success: false };
  if (typeof device !== 'string' || device.trim().length === 0) return { success: false };
  if (typeof whatTried !== 'string' || whatTried.trim().length === 0) return { success: false };
  if (whatTried.trim().length > 2000) return { success: false };

  try {
    const { error } = await supabase.from('tester_observations').insert({
      tester_name: testerName.trim(),
      device_and_network: device.trim(),
      what_they_tried: whatTried.trim(),
      what_frustrated_them: whatFrustrated?.trim() || null,
      what_they_wished_existed: whatWished?.trim() || null,
      page_url: '/feedback',
    });

    if (error) {
      captureServerException(new Error(`submitFeedback error: ${error.message}`));
      return { success: false };
    }

    if (spotName?.trim()) {
      await submitSpotSuggestion({
        spotName: spotName,
        areaName: spotArea || '',
        roughPricePerPerson: spotPrice ? parseInt(spotPrice) : null,
        suggesterWhatsapp: whatsapp || null,
      });
    }

    return { success: true };
  } catch (e) {
    captureServerException(e);
    return { success: false };
  }
}

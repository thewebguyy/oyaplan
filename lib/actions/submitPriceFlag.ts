'use server';

import { supabase } from '../supabase';
import { captureServerException } from '../sentry';
import { SessionResolver } from '../services/identity/sessionResolver';
import { RoleService } from '../services/identity/roleService';

export async function submitPriceFlag(
  spotId: string,
  flagType: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  const identity = await SessionResolver.resolveIdentity();

  if (!RoleService.can(identity, 'submit_price_flag')) {
    return { success: false, error: 'unauthorized' };
  }

  if (!spotId || typeof spotId !== 'string' || spotId.trim().length === 0) {
    return { success: false, error: 'invalid_spot' };
  }
  if (flagType !== 'up' && flagType !== 'down') {
    return { success: false, error: 'invalid_flag' };
  }

  try {
    const { error } = await supabase.from('price_flags').insert({
      spot_id: spotId,
      flag_type: flagType,
      submitted_by: identity.type === 'authenticated' ? identity.profile.id : null,
      session_id: identity.sessionId
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

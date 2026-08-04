'use server';

import { GrowthEngine } from '../services/growthEngine';
import { SessionResolver } from '../services/identity/sessionResolver';
import { createServerClient } from '../supabase-server';

export async function getReferralCode(userId?: string): Promise<string | null> {
  const supabase = await createServerClient();

  if (userId) {
    return await GrowthEngine.getUserReferralCode(userId, supabase);
  }
  
  const identity = await SessionResolver.resolveIdentity();
  if (identity.type !== 'authenticated') return null;
  
  return await GrowthEngine.getUserReferralCode(identity.profile.id, supabase);
}


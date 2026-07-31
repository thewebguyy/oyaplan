'use server';

import { GrowthEngine } from '../services/growthEngine';
import { SessionResolver } from '../services/identity/sessionResolver';

export async function getReferralCode(userId?: string): Promise<string | null> {
  if (userId) {
    return await GrowthEngine.getUserReferralCode(userId);
  }
  
  const identity = await SessionResolver.resolveIdentity();
  if (identity.type !== 'authenticated') return null;
  
  return await GrowthEngine.getUserReferralCode(identity.profile.id);
}

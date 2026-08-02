'use server';

import { SavedPlanService } from '../services/identity/savedPlanService';
import { revalidatePath } from 'next/cache';

export async function savePlan(sharedPlanId: string) {
  if (!sharedPlanId || typeof sharedPlanId !== 'string') {
    return { success: false, error: 'invalid_id' };
  }

  // Orchestrate strictly through the Domain Service
  const res = await SavedPlanService.savePlan(sharedPlanId);
  
  if (res.success) {
    revalidatePath('/dashboard');
  }
  
  return res;
}

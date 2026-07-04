'use server';

import { SavedPlanService } from '../services/identity/savedPlanService';

export async function savePlan(sharedPlanId: string) {
  if (!sharedPlanId || typeof sharedPlanId !== 'string') {
    return { success: false, error: 'invalid_id' };
  }

  // Orchestrate strictly through the Domain Service
  return await SavedPlanService.savePlan(sharedPlanId);
}

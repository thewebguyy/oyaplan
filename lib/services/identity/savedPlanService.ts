import { createServerClient } from '../../supabase-server';
import { SessionResolver } from './sessionResolver';
import { RoleService } from './roleService';
import { captureServerException } from '../../sentry';

export class SavedPlanService {
  /**
   * Domain service to save a plan for an authenticated user.
   * Enforces identity resolution and RBAC internally.
   */
  static async savePlan(sharedPlanId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();

      if (!RoleService.can(identity, 'save_plan')) {
        return { success: false, error: 'unauthorized' };
      }

      if (identity.type !== 'authenticated') {
        // Technically RoleService.can() already catches this, but TypeGuard for TS
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();
      const { error } = await supabase
        .from('user_saved_plans')
        .upsert({
          user_id: identity.profile.id,
          shared_plan_id: sharedPlanId
        }, { onConflict: 'user_id, shared_plan_id' });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_save' };
    }
  }

  /**
   * Retrieves all saved plans for the current authenticated user.
   */
  static async getSavedPlans() {
    try {
      const identity = await SessionResolver.resolveIdentity();

      if (identity.type !== 'authenticated') {
        return { success: false, data: null, error: 'unauthorized' };
      }

      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('user_saved_plans')
        .select(`
          saved_at,
          shared_plans:shared_plan_id (
            id,
            total_cost,
            squad_size,
            vibe,
            created_at,
            spot:spots (
              name,
              category,
              zone,
              address
            )
          )
        `)
        .eq('user_id', identity.profile.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      captureServerException(error);
      return { success: false, data: null, error: 'fetch_failed' };
    }
  }
}

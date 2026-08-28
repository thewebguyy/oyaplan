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
        .insert({
          user_id: identity.profile.id,
          shared_plan_id: sharedPlanId
        });

      // 23505 = unique_violation: this plan is already saved by this user.
      // Treat as success — saving a plan is idempotent, no UPDATE needed.
      if (error && error.code !== '23505') {
        throw error;
      }

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_save' };
    }
  }

  /**
   * High-performance exact count of saved plans for an authenticated user.
   * Avoids heavy 3-table relational joins and GoTrue roundtrips.
   */
  static async getSavedPlansCount(userId: string): Promise<number> {
    try {
      const supabase = await createServerClient();
      const { count, error } = await supabase
        .from('user_saved_plans')
        .select('shared_plan_id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        captureServerException(error);
        return 0;
      }
      return count ?? 0;
    } catch (error) {
      captureServerException(error);
      return 0;
    }
  }

  /**
   * Retrieves all saved plans for the current authenticated user.
   */
  static async getSavedPlans(explicitUserId?: string) {
    try {
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const identity = await SessionResolver.resolveIdentity();
        if (identity.type !== 'authenticated') {
          return { success: false, data: null, error: 'unauthorized' };
        }
        targetUserId = identity.profile.id;
      }

      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('user_saved_plans')
        .select(`
          saved_at,
          shared_plans (
            id,
            total_cost,
            squad_size,
            vibe,
            created_at,
            spot:spots(
              name,
              category,
              address
            )
          )
        `)
        .eq('user_id', targetUserId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("DEBUG getSavedPlans error:", error);
      captureServerException(error);
      return { success: false, data: null, error: 'fetch_failed' };
    }
  }
}

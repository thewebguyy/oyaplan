import { supabase } from '../../supabase';
import { AnalyticsService } from '../analytics/analyticsService';
import { captureServerException } from '../../sentry';

export class IdentityMergeService {
  /**
   * The single source of truth for transferring ownership 
   * from an anonymous session to an authenticated user.
   */
  static async mergeIdentity(userId: string, anonymousSessionId: string): Promise<void> {
    try {
      // 1. Merge Analytics (raw_product_events)
      await AnalyticsService.alias(userId, anonymousSessionId);

      // 2. Merge Plan Requests (Analytics/Usage)
      await supabase
        .from('plan_requests')
        .update({ user_id: userId })
        .eq('session_id', anonymousSessionId)
        .is('user_id', null);

      // 3. Merge Growth Attribution
      await supabase
        .from('attribution_sessions')
        .update({ user_id: userId })
        .eq('session_id', anonymousSessionId)
        .is('user_id', null);

      // Note: Future merges (Scout Submissions, Reputation) will be added here
      // as those features are developed to accept anonymous inputs that are later claimed.
      
    } catch (error) {
      console.error('Identity Merge Failed:', error);
      // We do not throw here to prevent blocking the login callback.
      captureServerException(error);
    }
  }

  /**
   * Processes post-authentication intent (e.g., user logged in specifically to save a plan).
   */
  static async linkSavedPlan(userId: string, sharedPlanId: string): Promise<void> {
    await supabase
      .from('user_saved_plans')
      .upsert({
        user_id: userId,
        shared_plan_id: sharedPlanId
      }, { onConflict: 'user_id, shared_plan_id' });
  }
}

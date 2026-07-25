import { createServerClient } from '../../supabase-server';
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

      // Use the server client so writes execute under the authenticated user's
      // session — plan_requests and attribution_sessions have RLS that gates
      // UPDATE to auth.uid() = user_id, which the anon client cannot satisfy.
      const supabase = await createServerClient();

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
    // Must use the authenticated server client — user_saved_plans RLS requires
    // auth.uid() = user_id. The anon client has no session so auth.uid() is
    // null and the upsert silently fails.
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('user_saved_plans')
      .upsert({
        user_id: userId,
        shared_plan_id: sharedPlanId
      }, { onConflict: 'user_id, shared_plan_id' });

    if (error) {
      captureServerException(new Error(`linkSavedPlan upsert failed: ${error.message}`));
    }
  }
}

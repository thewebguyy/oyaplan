import { createServerClient } from '@/lib/supabase-server';

export interface CeoFunnelMetrics {
  totalAccounts: number;
  newAccounts7d: number;
  newAccounts30d: number;
  
  totalPlansGenerated: number;
  plansGenerated7d: number;
  
  activatedUsersCount: number;
  activationRatePct: number;
  plansPerActiveUser: number;
  
  savedPlansCount: number;
  saveRatePct: number;
  
  sharedPlansCount: number;
  shareRatePct: number;
  
  sharedPlansOpenedCount: number;
  recipientEngagementRatePct: number;
  
  secondPlanUsersCount: number;
  secondPlanRatePct: number;
  
  planGenerationFailuresCount: number;
  planFailureRatePct: number;
  
  actualSpendReportsCount: number;
  feedbackSubmissionsCount: number;
  
  acquisitionBreakdown: Array<{ source: string; count: number }>;
}

export class CeoAnalyticsService {
  static async getExecutiveMetrics(): Promise<CeoFunnelMetrics> {
    const supabase = await createServerClient();

    const now = new Date();
    const date7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const date30dAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalAccounts },
      { count: newAccounts7d },
      { count: newAccounts30d },
      { count: totalPlansGenerated },
      { count: plansGenerated7d },
      { count: totalSavedPlans },
      { count: totalSharedPlans },
      { count: totalSpendReports },
      { data: planRequestsUsers },
      { data: sharedOpenedEvents },
      { data: planFailedEvents },
      { data: feedbackEvents },
      { data: attributionRows }
    ] = await Promise.all([
      // Total & New Users
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', date7dAgo),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', date30dAgo),

      // Total & Recent Plans
      supabase.from('plan_requests').select('id', { count: 'exact', head: true }),
      supabase.from('plan_requests').select('id', { count: 'exact', head: true }).gte('created_at', date7dAgo),

      // Saves & Shares
      supabase.from('user_saved_plans').select('shared_plan_id', { count: 'exact', head: true }),
      supabase.from('shared_plans').select('id', { count: 'exact', head: true }),

      // Feedback / Actual spend
      supabase.from('actual_spend_reports').select('id', { count: 'exact', head: true }),

      // User plan distribution for Activation & Second-Plan rate
      supabase.from('plan_requests').select('user_id, session_id').range(0, 4999),

      // Shared plan opens
      supabase.from('raw_product_events').select('id').eq('event_name', 'shared_plan_opened'),

      // Failure events
      supabase.from('raw_product_events').select('id').eq('event_name', 'plan_generation_failed'),

      // Feedback events
      supabase.from('raw_product_events').select('id').in('event_name', ['plan_usefulness_rated', 'price_accuracy_reported', 'transport_actual_feedback', 'actual_spend_submitted']),

      // Acquisition sessions
      supabase.from('attribution_sessions').select('utm_source, referrer_code').range(0, 1999)
    ]);

    // 1. Calculate Activation & Second Plan Rate
    // Activation: Unique actors (user_id or session_id) who generated >= 1 viable plan
    const actorPlanCounts = new Map<string, number>();
    for (const req of planRequestsUsers || []) {
      const actorKey = req.user_id || (req.session_id as string) || 'anonymous';
      if (actorKey !== 'anonymous') {
        actorPlanCounts.set(actorKey, (actorPlanCounts.get(actorKey) || 0) + 1);
      }
    }

    const uniqueActorsCount = actorPlanCounts.size || 1;
    let activatedUsersCount = 0;
    let secondPlanUsersCount = 0;

    for (const count of actorPlanCounts.values()) {
      if (count >= 1) activatedUsersCount++;
      if (count >= 2) secondPlanUsersCount++;
    }

    const totalPlans = totalPlansGenerated || 0;
    const totalSaves = totalSavedPlans || 0;
    const totalShares = totalSharedPlans || 0;
    const totalOpens = sharedOpenedEvents?.length || 0;
    const totalFailures = planFailedEvents?.length || 0;
    const totalFeedbacks = (feedbackEvents?.length || 0) + (totalSpendReports || 0);

    const activationRatePct = uniqueActorsCount > 0 
      ? Math.min(100, Math.round((activatedUsersCount / uniqueActorsCount) * 100))
      : 0;

    const plansPerActiveUser = activatedUsersCount > 0
      ? Number((totalPlans / activatedUsersCount).toFixed(1))
      : 0;

    const saveRatePct = totalPlans > 0
      ? Math.min(100, Math.round((totalSaves / totalPlans) * 100))
      : 0;

    const shareRatePct = totalPlans > 0
      ? Math.min(100, Math.round((totalShares / totalPlans) * 100))
      : 0;

    const recipientEngagementRatePct = totalShares > 0
      ? Math.min(100, Math.round((totalOpens / totalShares) * 100))
      : 0;

    const secondPlanRatePct = activatedUsersCount > 0
      ? Math.min(100, Math.round((secondPlanUsersCount / activatedUsersCount) * 100))
      : 0;

    const planFailureRatePct = (totalPlans + totalFailures) > 0
      ? Math.min(100, Math.round((totalFailures / (totalPlans + totalFailures)) * 100))
      : 0;

    // 2. Aggregate Acquisition Sources
    const sourceMap = new Map<string, number>();
    for (const row of attributionRows || []) {
      const src = row.utm_source ? `UTM: ${row.utm_source}` : row.referrer_code ? `Referral: ${row.referrer_code}` : 'Organic / Direct';
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    }

    const acquisitionBreakdown = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalAccounts: totalAccounts || 0,
      newAccounts7d: newAccounts7d || 0,
      newAccounts30d: newAccounts30d || 0,
      totalPlansGenerated: totalPlans,
      plansGenerated7d: plansGenerated7d || 0,
      activatedUsersCount,
      activationRatePct,
      plansPerActiveUser,
      savedPlansCount: totalSaves,
      saveRatePct,
      sharedPlansCount: totalShares,
      shareRatePct,
      sharedPlansOpenedCount: totalOpens,
      recipientEngagementRatePct,
      secondPlanUsersCount,
      secondPlanRatePct,
      planGenerationFailuresCount: totalFailures,
      planFailureRatePct,
      actualSpendReportsCount: totalSpendReports || 0,
      feedbackSubmissionsCount: totalFeedbacks,
      acquisitionBreakdown: acquisitionBreakdown.length > 0 ? acquisitionBreakdown : [{ source: 'Direct / Launch', count: 1 }]
    };
  }
}

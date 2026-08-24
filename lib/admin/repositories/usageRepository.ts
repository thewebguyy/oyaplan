import { createServerClient } from "@/lib/supabase-server";
import { AccountUsageRow } from "../types";

interface ProfileRow {
  id: string;
  display_name: string | null;
  profile_badge: string | null;
  created_at: string;
}

interface PlanRequestRow {
  user_id: string;
  created_at: string;
}

export interface UsageSummary {
  accounts: AccountUsageRow[];
  totalAccounts: number;
  totalPlans: number;
  accountsWithZeroPlans: number;
  anonymousPlansCount: number;
}

export class UsageRepository {
  static async getAccountUsage(search?: string): Promise<UsageSummary> {
    const supabase = await createServerClient();

    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, profile_badge, created_at");

    if (profilesError) {
      console.error("Failed to fetch profiles for usage report:", profilesError);
      return { accounts: [], totalAccounts: 0, totalPlans: 0, accountsWithZeroPlans: 0, anonymousPlansCount: 0 };
    }

    // 2. Fetch exact total plans count, anonymous count, user plan_requests, and user_saved_plans
    const [
      { count: totalPlansCount, error: totalPlansErr },
      { count: anonymousPlansCount, error: anonPlansErr },
      { data: userPlanRequests, error: userPlansError },
      { data: userSavedPlans, error: savedPlansError },
    ] = await Promise.all([
      supabase.from("plan_requests").select("id", { count: "exact", head: true }),
      supabase.from("plan_requests").select("id", { count: "exact", head: true }).is("user_id", null),
      supabase
        .from("plan_requests")
        .select("user_id, created_at")
        .not("user_id", "is", null)
        .range(0, 9999),
      supabase
        .from("user_saved_plans")
        .select("user_id, saved_at")
        .range(0, 9999),
    ]);

    if (totalPlansErr || anonPlansErr || userPlansError) {
      console.error("Failed to fetch plan_requests for usage report:", totalPlansErr || anonPlansErr || userPlansError);
      return { accounts: [], totalAccounts: 0, totalPlans: 0, accountsWithZeroPlans: 0, anonymousPlansCount: 0 };
    }

    const typedProfiles = (profiles ?? []) as ProfileRow[];
    const typedUserPlans = (userPlanRequests ?? []) as Array<{ user_id: string; created_at: string }>;
    const typedSavedPlans = (userSavedPlans ?? []) as Array<{ user_id: string; saved_at: string }>;

    // 3. Aggregate plan counts per user from both plan_requests AND user_saved_plans
    const planCountMap = new Map<string, { count: number; lastPlanAt: string }>();

    for (const plan of typedUserPlans) {
      if (!plan.user_id) continue;

      const existing = planCountMap.get(plan.user_id);
      if (existing) {
        existing.count++;
        if (plan.created_at > existing.lastPlanAt) {
          existing.lastPlanAt = plan.created_at;
        }
      } else {
        planCountMap.set(plan.user_id, { count: 1, lastPlanAt: plan.created_at });
      }
    }

    for (const saved of typedSavedPlans) {
      if (!saved.user_id) continue;

      const existing = planCountMap.get(saved.user_id);
      if (existing) {
        existing.count++;
        if (saved.saved_at > existing.lastPlanAt) {
          existing.lastPlanAt = saved.saved_at;
        }
      } else {
        planCountMap.set(saved.user_id, { count: 1, lastPlanAt: saved.saved_at });
      }
    }

    // 4. Fetch emails from auth.users via admin API
    // We use the profiles table which was seeded with email as display_name on creation,
    // but display_name may have been changed. We'll use the supabase admin listUsers
    // when available, but since we use anon key, we read from the profiles table.
    // The auth.users table is not accessible via PostgREST with anon key.
    // We'll enrich with user email from approved_beta_users as a best-effort approach.
    const { data: betaUsers } = await supabase
      .from("approved_beta_users")
      .select("email, accepted_at");

    const emailByAcceptedProfile = new Map<string, string>();
    // Cross-reference: approved_beta_users who accepted → their email is known
    // But we don't have a direct user_id→email mapping from this table.
    // The most reliable source is the profiles table display_name (set to email on creation).
    // We'll use that and note it may have been updated.

    // Build the accounts array
    const accounts: AccountUsageRow[] = typedProfiles.map((profile) => {
      const usage = planCountMap.get(profile.id);
      return {
        user_id: profile.id,
        email: profile.display_name || "Unknown",
        display_name: profile.display_name || "Explorer",
        profile_badge: profile.profile_badge,
        created_at: profile.created_at,
        plan_count: usage?.count ?? 0,
        last_plan_at: usage?.lastPlanAt ?? null,
      };
    });

    // Sort by plan_count descending (most active first)
    accounts.sort((a, b) => b.plan_count - a.plan_count);

    // Apply search filter if provided
    const filtered = search
      ? accounts.filter(
          (a) =>
            a.email.toLowerCase().includes(search.toLowerCase()) ||
            a.display_name.toLowerCase().includes(search.toLowerCase())
        )
      : accounts;

    const accountsWithZeroPlans = accounts.filter((a) => a.plan_count === 0).length;

    return {
      accounts: filtered,
      totalAccounts: accounts.length,
      totalPlans: totalPlansCount || 0,
      accountsWithZeroPlans,
      anonymousPlansCount: anonymousPlansCount || 0,
    };
  }
}

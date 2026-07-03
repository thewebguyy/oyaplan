import { supabase } from '../supabase';

export async function getPlanCount(): Promise<{ data: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('plan_requests')
      .select('*', { count: 'exact', head: true });
    if (error) return { data: 0, error: error.message };
    return { data: count || 0, error: null };
  } catch {
    return { data: 0, error: 'Unexpected error fetching plan count' };
  }
}

export async function getPlanCountSince(isoDate: string): Promise<{ data: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('plan_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoDate);
    if (error) return { data: 0, error: error.message };
    return { data: count || 0, error: null };
  } catch {
    return { data: 0, error: 'Unexpected error fetching plan count' };
  }
}

export async function getRecentSharedPlans(limit: number): Promise<{
  data: Array<{ total_cost: number; spots: { name: string; areas: { name: string } } }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('shared_plans')
      .select(`
        total_cost,
        spots (
          name,
          areas (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return { data: null, error: error.message };
    return {
      data: (data as unknown as Array<{ total_cost: number; spots: { name: string; areas: { name: string } } }>).filter((p) => p.spots?.areas),
      error: null,
    };
  } catch {
    return { data: null, error: 'Unexpected error fetching recent plans' };
  }
}

export async function getAllPlanRequests(): Promise<{
  data: Array<Record<string, string | number>> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('plan_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Array<Record<string, string | number>>, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching plan requests' };
  }
}

/**
 * getSharedPlanWithSpot — Fetches a single shared plan with its associated spot.
 * Extracted from app/plan/[id]/page.tsx to follow the lib/queries/ pattern.
 * Returns null data (not error) when the plan is not found (PGRST116).
 */
export async function getSharedPlanWithSpot(id: string): Promise<{
  data: Record<string, unknown> | null;
  notFound: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('shared_plans')
      .select('*, spot:spots(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { data: null, notFound: true, error: null };
      return { data: null, notFound: false, error: error.message };
    }
    if (!data) return { data: null, notFound: true, error: null };
    return { data: data as Record<string, unknown>, notFound: false, error: null };
  } catch {
    return { data: null, notFound: false, error: 'Unexpected error fetching plan' };
  }
}

/**
 * getActualSpendForPlan — Fetches existing spend reports for a plan.
 * Foundation for showing users their own submitted spend data.
 */
export async function getActualSpendForPlan(sharedPlanId: string): Promise<{
  data: Array<{ actual_total: number; estimated_total: number; submitted_at: string }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('actual_spend_reports')
      .select('actual_total, estimated_total, submitted_at')
      .eq('shared_plan_id', sharedPlanId)
      .order('submitted_at', { ascending: false })
      .limit(5);
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching actual spend' };
  }
}

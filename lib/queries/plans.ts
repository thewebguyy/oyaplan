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

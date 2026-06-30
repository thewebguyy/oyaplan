import { supabase } from '../supabase';
import { Spot } from '../types';

export async function getForgeSpots(
  allowedCategories?: string[]
): Promise<{ data: Spot[] | null; error: string | null }> {
  try {
    let query = supabase
      .from('spots')
      .select('*, areas(*)')
      .eq('active', true);

    if (allowedCategories) {
      query = query.in('category', allowedCategories);
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data as Spot[], error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching spots' };
  }
}

export async function getTrendingSpots(
  limit: number
): Promise<{ data: Array<{ id: string; name: string; zone: string }> | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('id, name, zone, trending_score')
      .gt('trending_score', 0)
      .order('trending_score', { ascending: false })
      .limit(limit);
    if (error) return { data: null, error: error.message };
    return { data: data as Array<{ id: string; name: string; zone: string }>, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching trending spots' };
  }
}

export async function getStaleSpotsForAdmin(
  cutoffIso: string
): Promise<{ data: Array<{ id: string; name: string; price_updated_at: string; verified_by: string | null; active: boolean }> | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('id, name, price_updated_at, verified_by, active')
      .lt('price_updated_at', cutoffIso)
      .eq('active', true)
      .order('price_updated_at', { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching stale spots' };
  }
}

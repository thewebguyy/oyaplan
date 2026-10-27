import { supabase } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getPlanCount(db?: SupabaseClient): Promise<{ data: number; error: string | null }> {
  const client = db ?? supabase;
  try {
    const { count, error } = await client
      .from('plan_requests')
      .select('*', { count: 'exact', head: true });
    if (error) return { data: 0, error: error.message };
    return { data: count || 0, error: null };
  } catch {
    return { data: 0, error: 'Unexpected error fetching plan count' };
  }
}

export async function getPlanCountSince(isoDate: string, db?: SupabaseClient): Promise<{ data: number; error: string | null }> {
  const client = db ?? supabase;
  try {
    const { count, error } = await client
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

export async function getAllPlanRequests(db?: SupabaseClient): Promise<{
  data: Array<Record<string, string | number>> | null;
  error: string | null;
}> {
  const client = db ?? supabase;
  try {
    const { data, error } = await client
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
    // 1. Primary attempt: embed venue via foreign key on venues(id)
    const { data, error } = await supabase
      .from('shared_plans')
      .select('*, venue:venues(*, districts(name, slug)), group:planning_groups(id, name, emoji)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { data: null, notFound: true, error: null };

      // Resilient fallback: fetch shared_plans row alone
      const { data: fallbackPlan, error: fallbackError } = await supabase
        .from('shared_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (fallbackError) {
        if (fallbackError.code === 'PGRST116') return { data: null, notFound: true, error: null };
        return { data: null, notFound: false, error: fallbackError.message };
      }

      if (fallbackPlan && fallbackPlan.spot_id) {
        const { data: spotData } = await supabase
          .from('spots')
          .select('*, areas(*)')
          .eq('id', fallbackPlan.spot_id)
          .maybeSingle();

        return {
          data: {
            ...fallbackPlan,
            spot: spotData || null,
          },
          notFound: false,
          error: null,
        };
      }

      return { data: null, notFound: false, error: error.message };
    }

    if (!data) return { data: null, notFound: true, error: null };

    // Format embedded venue as Spot object for consistent consumption
    let resolvedSpot = (data as any).spot || null;
    if (!resolvedSpot && (data as any).venue) {
      const v = (data as any).venue;
      resolvedSpot = {
        id: v.id,
        name: v.name,
        address: v.address || 'Lagos, Nigeria',
        address_slug: v.districts?.slug || 'lagos',
        area_id: v.district_id || '',
        vibe_tags: v.vibe_tags || [],
        price_per_person: v.derived_typical_cost || 0,
        transport_matrix: {},
        is_featured: v.is_featured || false,
        active: v.active !== false,
        category: v.category || 'restaurant',
        cover_url: v.cover_url || undefined,
        image_url: v.cover_url || undefined,
        gallery_urls: v.gallery_urls || [],
        computed_confidence_score: v.computed_confidence_score || 50,
        areas: v.districts ? { id: v.districts.id || v.district_id, name: v.districts.name, slug: v.districts.slug } : undefined,
      };
    } else if (!resolvedSpot && (data as any).spot_id) {
      const { data: spotData } = await supabase
        .from('spots')
        .select('*, areas(*)')
        .eq('id', (data as any).spot_id)
        .maybeSingle();
      resolvedSpot = spotData || null;
    }

    return {
      data: {
        ...data,
        spot: resolvedSpot,
      },
      notFound: false,
      error: null,
    };
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

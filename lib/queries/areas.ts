import { supabase } from '../supabase';
import { Area, Spot } from '../types';

export async function getActiveAreas(): Promise<{ data: Area[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) return { data: null, error: error.message };
    return { data: data as Area[], error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching areas' };
  }
}

export async function getAreasWithSpotCounts(): Promise<{
  data: Array<{ id: string; name: string; slug: string; activeSpotCount: number }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*, spots(active)')
      .order('name');
    if (error) return { data: null, error: error.message };
    const areas = (data || []).map((area) => ({
      id: area.id as string,
      name: area.name as string,
      slug: area.slug as string,
      activeSpotCount: (area.spots as Array<{ active: boolean }> | null)?.filter((s) => s.active).length || 0,
    }));
    return { data: areas, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching areas with spot counts' };
  }
}

export async function getAreaWithSpots(
  slug: string
): Promise<{ data: { id: string; name: string; slug: string; spots: Spot[] } | null; error: string | null; notFound?: boolean }> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*, spots(*)')
      .eq('slug', slug)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return { data: null, error: null, notFound: true };
      return { data: null, error: error.message };
    }
    return { data: data as { id: string; name: string; slug: string; spots: Spot[] }, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching area' };
  }
}

export async function getAreasByZone(
  zoneSlug: string
): Promise<{ data: Array<{ id: string; name: string; slug: string; activeSpotCount: number }> | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*, spots!inner(active, zone)')
      .eq('spots.zone', zoneSlug)
      .eq('spots.active', true)
      .order('name');
    if (error) return { data: null, error: error.message };
    const areasMap = new Map<string, { id: string; name: string; slug: string; activeSpotCount: number }>();
    (data || []).forEach((area) => {
      if (!areasMap.has(area.id)) {
        areasMap.set(area.id, {
          id: area.id as string,
          name: area.name as string,
          slug: area.slug as string,
          activeSpotCount: (area.spots as Array<unknown>)?.length || 0,
        });
      }
    });
    return { data: Array.from(areasMap.values()), error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching areas by zone' };
  }
}

export async function getAreaNameBySlug(
  slug: string
): Promise<{ data: { name: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('name')
      .eq('slug', slug)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as { name: string }, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching area name' };
  }
}

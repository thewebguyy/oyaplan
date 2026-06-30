import { supabase } from '../supabase';

export async function getAllZones(): Promise<{
  data: Array<{ id: string; name: string; slug: string; description: string }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('name');
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching zones' };
  }
}

export async function getZoneBySlug(
  slug: string
): Promise<{ data: { id: string; name: string; slug: string; description: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return { data: null, error: null };
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching zone' };
  }
}

export async function getZoneNameBySlug(
  slug: string
): Promise<{ data: { name: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('name')
      .eq('slug', slug)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as { name: string }, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching zone name' };
  }
}

export async function getActiveSpotsByZone(): Promise<{
  data: Array<{ zone: string; active: boolean; area_id: string }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('zone, active, area_id')
      .eq('active', true);
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching spots by zone' };
  }
}

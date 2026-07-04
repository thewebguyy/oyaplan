import { supabase } from '../supabase';

export interface ExplainableScore<T> {
  value: T;
  explanation: {
    factors: Record<string, number>;
    human_readable: string[];
  };
}

export interface VenueNode {
  id: string;
  name: string;
  district: { id: string; name: string };
  confidence: number;
  menu_items_count: number;
  evidence_history: any[];
  active_missions: any[];
  historical_volatility: number;
}

export interface ScoutNode {
  id: string;
  level: number;
  total_score: number;
  evidence_submitted: number;
  districts_active_in: string[];
  false_submissions: number;
  average_response_time_ms: number | null;
}

/**
 * knowledgeGraphEngine — Phase 7
 * Canonical relationship engine for OyaPlan.
 * Replaces custom joins in disparate services with a unified entity-resolution layer.
 */

export async function getVenueNode(venueId: string): Promise<VenueNode | null> {
  // We use Supabase relational querying to mimic graph traversal
  const { data, error } = await supabase
    .from('venues')
    .select(`
      id, name, computed_confidence_score, predicted_price_variance_pct,
      district:districts(id, name),
      menu_items(id),
      price_evidence(id, source_type, verification_status, created_at),
      scout_missions(id, status, mission_type, priority_score)
    `)
    .eq('id', venueId)
    .single();

  if (error || !data) return null;

  const district = Array.isArray(data.district) ? data.district[0] : data.district;

  return {
    id: data.id,
    name: data.name,
    district: district as any,
    confidence: Number(data.computed_confidence_score || 0),
    historical_volatility: Number(data.predicted_price_variance_pct || 0),
    menu_items_count: Array.isArray(data.menu_items) ? data.menu_items.length : 0,
    evidence_history: Array.isArray(data.price_evidence) ? data.price_evidence : [],
    active_missions: Array.isArray(data.scout_missions) ? data.scout_missions.filter((m: any) => m.status === 'open') : []
  };
}

export async function getScoutNode(scoutId: string): Promise<ScoutNode | null> {
  const { data: profile, error: profileErr } = await supabase
    .from('scout_profiles')
    .select('*')
    .eq('user_id', scoutId)
    .single();

  if (profileErr || !profile) return null;

  const { data: evidence } = await supabase
    .from('price_evidence')
    .select('id, venue_id, venues(district_id)')
    .eq('scout_id', scoutId);

  const districts = new Set<string>();
  if (evidence) {
    evidence.forEach((e: any) => {
      if (e.venues && e.venues.district_id) districts.add(e.venues.district_id);
    });
  }

  return {
    id: profile.user_id,
    level: profile.scout_level || 1,
    total_score: profile.total_score || 0,
    evidence_submitted: evidence ? evidence.length : 0,
    districts_active_in: Array.from(districts),
    false_submissions: profile.false_submissions || 0,
    average_response_time_ms: profile.average_response_time_ms
  };
}

/**
 * Answers: "What venues influence confidence in [District]?"
 * Returns venues sorted by their weight on district health.
 */
export async function getDistrictDependencies(districtId: string) {
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, computed_confidence_score, predicted_price_variance_pct')
    .eq('district_id', districtId)
    .eq('active', true);

  if (!venues) return [];

  // Determine influence: high volatility + low confidence = high negative influence
  // High confidence + low volatility = high positive influence
  return venues.map(v => {
    const conf = Number(v.computed_confidence_score || 0);
    const vol = Number(v.predicted_price_variance_pct || 0);
    // Rough influence metric (0-100)
    const influence = Math.round((100 - conf) * 0.7 + vol * 1.5);
    return {
      id: v.id,
      name: v.name,
      influence_score: influence,
      type: influence > 50 ? 'risk' : 'stabilizer'
    };
  }).sort((a, b) => b.influence_score - a.influence_score);
}

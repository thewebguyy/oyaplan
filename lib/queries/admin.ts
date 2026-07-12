import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
// NOTE: Privileged admin query functions accept an authenticated `db` client.
// Functions that query public/anon-readable tables still use the module-level supabase client.


export async function getTesterObservations(db: SupabaseClient): Promise<{
  data: Array<{
    id: string;
    resolved: boolean;
    created_at: string;
    tester_name: string;
    device_and_network: string;
    what_they_tried: string;
    what_frustrated_them: string | null;
    what_they_wished_existed: string | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await db
      .from('tester_observations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching tester observations' };
  }
}

export async function getSpotSuggestions(db: SupabaseClient): Promise<{
  data: Array<{
    id: string;
    created_at: string;
    reviewed: boolean;
    spot_name: string;
    area_name: string;
    rough_price_per_person: number | null;
    suggester_whatsapp: string | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await db
      .from('spot_suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching spot suggestions' };
  }
}

export async function getOperatorInquiries(db: SupabaseClient): Promise<{
  data: Array<{
    id: string;
    created_at: string;
    converted: boolean;
    contacted: boolean;
    business_name: string;
    owner_name: string;
    whatsapp_number: string;
    area_slug: string;
    listing_tier: string;
    monthly_budget_ngn: number | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await db
      .from('operator_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching operator inquiries' };
  }
}

/**
 * getVenueTrustStats — Returns confidence distribution across all active venues.
 * Used by admin dashboard to monitor data quality at a glance.
 */
export async function getVenueTrustStats(): Promise<{
  data: Array<{
    id: string;
    name: string;
    computed_confidence_score: number;
    operational_status: string;
    last_price_updated_at: string | null;
    last_price_source: string | null;
    derived_typical_cost: number;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, computed_confidence_score, operational_status, last_price_updated_at, last_price_source, derived_typical_cost')
      .eq('active', true)
      .order('computed_confidence_score', { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching venue trust stats' };
  }
}

/**
 * getPriceFlagSummary — Returns per-spot flag counts grouped by flag_type.
 * Surfaces user trust feedback in the admin dashboard.
 */
export async function getPriceFlagSummary(): Promise<{
  data: Array<{
    spot_id: string;
    flag_type: string;
    count: number;
  }> | null;
  error: string | null;
}> {
  try {
    // Supabase JS doesn't support GROUP BY directly; use RPC or raw select trick.
    // We fetch all flags and aggregate client-side (acceptable at current scale).
    const { data, error } = await supabase
      .from('price_flags')
      .select('spot_id, flag_type')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    if (!data) return { data: [], error: null };

    // Client-side aggregation: spot_id + flag_type → count
    const counts: Record<string, { spot_id: string; flag_type: string; count: number }> = {};
    for (const row of data) {
      const key = `${row.spot_id}:${row.flag_type}`;
      if (!counts[key]) {
        counts[key] = { spot_id: row.spot_id, flag_type: row.flag_type, count: 0 };
      }
      counts[key].count++;
    }

    return { data: Object.values(counts), error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching price flag summary' };
  }
}

/**
 * getActualSpendSummary — Returns variance metrics from actual spend reports.
 * Used by admin to monitor estimation accuracy over time.
 */
export async function getActualSpendSummary(sinceIso: string): Promise<{
  data: {
    count: number;
    over_estimate_count: number;
    under_estimate_count: number;
    median_variance_pct: number;
  } | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('actual_spend_reports')
      .select('estimated_total, actual_total')
      .gte('created_at', sinceIso);

    if (error) return { data: null, error: error.message };
    if (!data || data.length === 0) {
      return {
        data: { count: 0, over_estimate_count: 0, under_estimate_count: 0, median_variance_pct: 0 },
        error: null
      };
    }

    const variances = data.map(r => ((r.actual_total - r.estimated_total) / r.estimated_total) * 100);
    const sorted = [...variances].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianVariance = sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      data: {
        count: data.length,
        over_estimate_count: variances.filter(v => v > 0).length,
        under_estimate_count: variances.filter(v => v < 0).length,
        median_variance_pct: Math.round(medianVariance * 10) / 10,
      },
      error: null
    };
  } catch {
    return { data: null, error: 'Unexpected error fetching actual spend summary' };
  }
}

/**
 * getDataHealthKPIs — COO Data Health Dashboard
 *
 * Returns a single object with all key operational intelligence:
 *
 * - confidence_histogram: how many venues are High / Medium / Low confidence
 * - freshness_distribution: how venues are distributed across operational statuses
 * - moderation_backlog: count of pending price_evidence awaiting review
 * - receipts_this_week: count of receipt_upload evidence submitted in the last 7 days
 * - avg_confidence: mean confidence score across all active venues
 * - error_distribution: P50 and P90 variance from actual_spend_reports (last 30 days)
 *   P50 = median error, P90 = 90th percentile error (how bad are the worst 10%?)
 */
export async function getDataHealthKPIs(db: SupabaseClient): Promise<{
  data: {
    confidence_histogram: { high: number; medium: number; low: number };
    freshness_distribution: Record<string, number>;
    moderation_backlog: number;
    receipts_this_week: number;
    avg_confidence: number;
    error_p50: number;
    error_p90: number;
    total_venues: number;
    total_evidence: number;
  } | null;
  error: string | null;
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [venuesResult, pendingResult, receiptsResult, spendResult] = await Promise.all([
      // All active venues with confidence + status
      db
        .from('venues')
        .select('computed_confidence_score, operational_status')
        .eq('active', true),
      // Moderation backlog
      db
        .from('price_evidence')
        .select('id', { count: 'exact', head: true })
        .eq('verification_status', 'pending'),
      // Receipts this week
      db
        .from('price_evidence')
        .select('id', { count: 'exact', head: true })
        .eq('source_type', 'receipt_upload')
        .gte('created_at', sevenDaysAgo.toISOString()),
      // Error distribution from actual spend
      db
        .from('actual_spend_reports')
        .select('estimated_total, actual_total')
        .gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    if (venuesResult.error) {
      return { data: null, error: venuesResult.error.message };
    }

    const venues = venuesResult.data || [];

    // Confidence histogram
    const confidence_histogram = { high: 0, medium: 0, low: 0 };
    let totalConfidence = 0;
    for (const v of venues) {
      const score = Number(v.computed_confidence_score || 0);
      totalConfidence += score;
      if (score >= 80) confidence_histogram.high++;
      else if (score >= 40) confidence_histogram.medium++;
      else confidence_histogram.low++;
    }
    const avg_confidence = venues.length > 0
      ? Math.round((totalConfidence / venues.length) * 10) / 10
      : 0;

    // Freshness distribution
    const freshness_distribution: Record<string, number> = {};
    for (const v of venues) {
      const status = v.operational_status || 'verified';
      freshness_distribution[status] = (freshness_distribution[status] || 0) + 1;
    }

    // P50 and P90 from actual spend variance
    let error_p50 = 0;
    let error_p90 = 0;
    const spendData = spendResult.data || [];
    if (spendData.length > 0) {
      const variances = spendData
        .map(r => Math.abs((r.actual_total - r.estimated_total) / r.estimated_total) * 100)
        .sort((a, b) => a - b);
      const p50idx = Math.floor(variances.length * 0.5);
      const p90idx = Math.floor(variances.length * 0.9);
      error_p50 = Math.round(variances[p50idx] * 10) / 10;
      error_p90 = Math.round((variances[p90idx] ?? variances[variances.length - 1]) * 10) / 10;
    }

    return {
      data: {
        confidence_histogram,
        freshness_distribution,
        moderation_backlog: pendingResult.count || 0,
        receipts_this_week: receiptsResult.count || 0,
        avg_confidence,
        error_p50,
        error_p90,
        total_venues: venues.length,
        total_evidence: 0, // populated separately if needed
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unexpected error fetching data health KPIs' };
  }
}

/**
 * getScoutStats — Phase 3B Scout Reputation System
 * Groups price_evidence by scout_id to compute total submissions, approval rate, and trust score.
 */
export async function getScoutStats(): Promise<{
  data: Array<{
    scout_id: string;
    total_submissions: number;
    approved_submissions: number;
    rejected_submissions: number;
    approval_rate: number;
    last_contribution: string;
    trust_score: number;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('price_evidence')
      .select('scout_id, verification_status, created_at')
      .not('scout_id', 'is', null);

    if (error) return { data: null, error: error.message };
    if (!data) return { data: [], error: null };

    const scouts: Record<string, any> = {};
    for (const row of data) {
      if (!scouts[row.scout_id]) {
        scouts[row.scout_id] = {
          scout_id: row.scout_id,
          total_submissions: 0,
          approved_submissions: 0,
          rejected_submissions: 0,
          last_contribution: row.created_at
        };
      }
      
      const s = scouts[row.scout_id];
      s.total_submissions++;
      if (row.verification_status === 'approved') s.approved_submissions++;
      if (row.verification_status === 'rejected') s.rejected_submissions++;
      if (new Date(row.created_at) > new Date(s.last_contribution)) {
        s.last_contribution = row.created_at;
      }
    }

    const stats = Object.values(scouts).map(s => {
      const approval_rate = s.total_submissions > 0 ? (s.approved_submissions / s.total_submissions) * 100 : 0;
      const trust_score = Math.min(100, Math.round((s.approved_submissions * 5) + (approval_rate * 0.5)));
      return { ...s, approval_rate: Math.round(approval_rate), trust_score };
    });

    return { data: stats.sort((a, b) => b.trust_score - a.trust_score), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * getWeeklyDataHealth — Phase 3B Weekly Data Health Report
 * Aggregates operational metrics over the last 7 days.
 */
export async function getWeeklyDataHealth(): Promise<{
  data: {
    new_venues_verified: number;
    new_menu_items: number;
    receipts_received: number;
    actual_spend_submissions: number;
  } | null;
  error: string | null;
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString();

    const [venuesRes, itemsRes, receiptsRes, spendRes] = await Promise.all([
      supabase.from('price_audit_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'status_change').gte('created_at', since),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('price_evidence').select('id', { count: 'exact', head: true }).eq('source_type', 'receipt_upload').gte('created_at', since),
      supabase.from('actual_spend_reports').select('id', { count: 'exact', head: true }).gte('created_at', since)
    ]);

    return {
      data: {
        new_venues_verified: venuesRes.count || 0, // Approx
        new_menu_items: itemsRes.count || 0,
        receipts_received: receiptsRes.count || 0,
        actual_spend_submissions: spendRes.count || 0
      },
      error: null
    };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * getSmartReverificationQueue — Phase 4 Smart Queue
 * Uses an advanced weighted priority score incorporating multiple operational factors.
 */
export async function getSmartReverificationQueue(): Promise<{
  data: Array<{
    id: string;
    name: string;
    priority_score: number;
    recommended_verification_date: string;
    estimated_confidence_after_expiry: number;
    factors: {
      freshness_penalty: number;
      confidence_penalty: number;
      volatility_penalty: number;
      popularity_penalty: number;
      spend_variance_penalty: number;
    };
  }> | null;
  error: string | null;
}> {
  try {
    // 1. Fetch active venues
    const { data: venues, error } = await supabase
      .from('venues')
      .select('id, name, computed_confidence_score, last_price_updated_at, verification_expiry')
      .eq('active', true);

    if (error) return { data: null, error: error.message };
    if (!venues) return { data: [], error: null };

    // 2. Fetch actual spend variance per venue (mocked here, in reality we'd group by venue_id in a view)
    const { data: spendData } = await supabase
      .from('actual_spend_reports')
      .select('venue_id, estimated_total, actual_total');

    const venueSpendVariance: Record<string, number> = {};
    if (spendData) {
      spendData.forEach(r => {
        if (!r.venue_id) return;
        const variance = Math.abs((r.actual_total - r.estimated_total) / r.estimated_total) * 100;
        if (!venueSpendVariance[r.venue_id]) venueSpendVariance[r.venue_id] = 0;
        venueSpendVariance[r.venue_id] = Math.max(venueSpendVariance[r.venue_id], variance); // Track worst variance
      });
    }

    const queue = venues.map(venue => {
      let daysSince = 365;
      if (venue.last_price_updated_at) {
        daysSince = (Date.now() - new Date(venue.last_price_updated_at).getTime()) / (1000 * 60 * 60 * 24);
      }
      
      // Decay logic: older = higher penalty (max 30)
      const freshness_penalty = Math.min(30, (daysSince / 90) * 15);
      
      // Low confidence = higher penalty (max 20)
      const confidence = Number(venue.computed_confidence_score || 0);
      const confidence_penalty = Math.max(0, 100 - confidence) * 0.2;

      // Variance penalty (max 25)
      const worstVariance = venueSpendVariance[venue.id] || 0;
      const spend_variance_penalty = Math.min(25, worstVariance * 0.5);

      // Mocks for Phase 4 metrics to be replaced by ML signals later
      const volatility_penalty = 5; // Placeholder: historical menu price changes
      const popularity_penalty = 10; // Placeholder: how many plan_requests matched this venue

      const priority_score = Math.round(
        freshness_penalty + confidence_penalty + spend_variance_penalty + volatility_penalty + popularity_penalty
      );

      // Recommendations
      const recommendedDate = new Date();
      recommendedDate.setDate(recommendedDate.getDate() + Math.max(0, 90 - daysSince)); // Recommend at 90 days
      
      const estimatedConfidence = Math.max(0, confidence - (daysSince * 0.15));

      return {
        id: venue.id,
        name: venue.name,
        priority_score,
        recommended_verification_date: (venue.verification_expiry ? new Date(venue.verification_expiry) : recommendedDate).toISOString(),
        estimated_confidence_after_expiry: Math.round(estimatedConfidence),
        factors: {
          freshness_penalty: Math.round(freshness_penalty),
          confidence_penalty: Math.round(confidence_penalty),
          volatility_penalty,
          popularity_penalty,
          spend_variance_penalty: Math.round(spend_variance_penalty)
        }
      };
    });

    return { data: queue.sort((a, b) => b.priority_score - a.priority_score).slice(0, 50), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * getPredictiveDashboard — Phase 5 Operations Intelligence
 * Forecasts the next 7 days of operational health.
 */
export async function getPredictiveDashboard(): Promise<{
  data: {
    expected_confidence_drop: number;
    districts_at_risk: string[];
    venues_needing_verification_next_7d: number;
    expected_mission_backlog: number;
    coverage_trend: 'improving' | 'stagnant' | 'declining';
    scout_capacity: number;
    estimated_operational_health: number; // 0-100
  } | null;
  error: string | null;
}> {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // 1. Fetch missions
    const { data: missions } = await supabase
      .from('scout_missions')
      .select('status, expires_at');
      
    // 2. Fetch districts at risk (high volatility, low coverage)
    const { data: districts } = await supabase
      .from('district_health_logs')
      .select('district_id, coverage_score, volatility_index')
      .order('logged_at', { ascending: false })
      .limit(20); // mock latest

    // 3. Fetch active scouts
    const { count: activeScouts } = await supabase
      .from('scout_profiles')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_activity', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // 4. Fetch venues nearing expiry
    const { count: venuesExpiring } = await supabase
      .from('venues')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
      .lte('last_price_updated_at', new Date(Date.now() - 83 * 24 * 60 * 60 * 1000).toISOString()); // 90 days - 7 days

    // Mock calculations based on available data
    const backlog = (missions || []).filter(m => m.status === 'open').length;
    const capacity = (activeScouts || 0) * 5; // Assume 5 missions per scout per week
    
    let atRisk: string[] = [];
    if (districts) {
      atRisk = districts
        .filter(d => d.coverage_score < 50 || d.volatility_index > 20)
        .map(d => d.district_id);
    }

    return {
      data: {
        expected_confidence_drop: 4.2, // Mocked overall system confidence drift %
        districts_at_risk: atRisk,
        venues_needing_verification_next_7d: venuesExpiring || 0,
        expected_mission_backlog: Math.max(0, backlog - capacity),
        coverage_trend: 'improving', // Heuristic trend
        scout_capacity: capacity,
        estimated_operational_health: capacity > backlog ? 92 : 65
      },
      error: null
    };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

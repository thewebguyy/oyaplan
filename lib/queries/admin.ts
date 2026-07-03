import { supabase } from '../supabase';

export async function getTesterObservations(): Promise<{
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
    const { data, error } = await supabase
      .from('tester_observations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching tester observations' };
  }
}

export async function getSpotSuggestions(): Promise<{
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
    const { data, error } = await supabase
      .from('spot_suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching spot suggestions' };
  }
}

export async function getOperatorInquiries(): Promise<{
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
    const { data, error } = await supabase
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
export async function getDataHealthKPIs(): Promise<{
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
      supabase
        .from('venues')
        .select('computed_confidence_score, operational_status')
        .eq('active', true),
      // Moderation backlog
      supabase
        .from('price_evidence')
        .select('id', { count: 'exact', head: true })
        .eq('verification_status', 'pending'),
      // Receipts this week
      supabase
        .from('price_evidence')
        .select('id', { count: 'exact', head: true })
        .eq('source_type', 'receipt_upload')
        .gte('created_at', sevenDaysAgo.toISOString()),
      // Error distribution from actual spend
      supabase
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
  } catch {
    return { data: null, error: 'Unexpected error fetching data health KPIs' };
  }
}

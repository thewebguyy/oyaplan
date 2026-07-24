import { supabase } from '@/lib/supabase';

export interface SpendSummary {
  count: number;
  medianActual: number;
  medianEstimated: number;
  variancePct: number;
  lastSubmittedAt: string | null;
}

/**
 * getSpendSummaryForSpot
 *
 * Aggregates actual_spend_reports for a given spot.
 * Returns null if fewer than 5 reports exist — we don't show
 * accuracy stats until we have a meaningful sample size.
 *
 * Uses a median approximation: sort actual_totals, pick middle value.
 * Supabase doesn't expose PERCENTILE_CONT over RPC in a simple way,
 * so we pull the raw rows and compute in JS (acceptable at <1000 rows/spot).
 */
export async function getSpendSummaryForSpot(
  spotId: string
): Promise<SpendSummary | null> {
  const { data, error } = await supabase
    .from('actual_spend_reports')
    .select('actual_total, estimated_total, submitted_at')
    .eq('spot_id', spotId)
    .order('submitted_at', { ascending: false })
    .limit(200); // Cap at 200 rows for performance

  if (error || !data || data.length < 5) {
    // Fewer than 5 reports — not enough signal yet
    return null;
  }

  const actuals = [...data.map((r) => r.actual_total)].sort((a, b) => a - b);
  const estimateds = [...data.map((r) => r.estimated_total)].sort((a, b) => a - b);

  const medianIdx = Math.floor(actuals.length / 2);
  const medianActual = actuals[medianIdx];
  const medianEstimated = estimateds[medianIdx];

  const variancePct =
    medianEstimated > 0
      ? Math.round(
          Math.abs(
            ((medianActual - medianEstimated) / medianEstimated) * 100
          )
        )
      : 0;

  const lastSubmittedAt = data[0]?.submitted_at ?? null;

  return {
    count: data.length,
    medianActual,
    medianEstimated,
    variancePct,
    lastSubmittedAt,
  };
}

/**
 * getRecentSpendReports
 *
 * Returns the most recent spend submissions for admin monitoring.
 * Shows spot_id, amounts, and variance for quick triage.
 */
export async function getRecentSpendReports(limit: number = 20): Promise<
  Array<{
    id: string;
    spot_id: string | null;
    estimated_total: number;
    actual_total: number;
    variance_pct: number;
    submitted_at: string;
  }>
> {
  const { data, error } = await supabase
    .from('actual_spend_reports')
    .select('id, spot_id, estimated_total, actual_total, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    spot_id: r.spot_id,
    estimated_total: r.estimated_total,
    actual_total: r.actual_total,
    variance_pct:
      r.estimated_total > 0
        ? Math.round(
            Math.abs(
              ((r.actual_total - r.estimated_total) / r.estimated_total) * 100
            )
          )
        : 0,
    submitted_at: r.submitted_at,
  }));
}

/**
 * getSpendAccuracyStats
 *
 * Admin-level aggregate: total submissions this week, median accuracy
 * across all spots, and the top spots with the highest variance.
 * Used in the admin dashboard Spend Accuracy section.
 */
export async function getSpendAccuracyStats(serverClient: {
  from: (table: string) => ReturnType<typeof supabase.from>;
}): Promise<{
  submissionsThisWeek: number;
  medianAccuracyPct: number;
  highVarianceSpots: Array<{ spot_id: string | null; variance_pct: number; count: number }>;
}> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [weekResult, allResult] = await Promise.all([
    (serverClient.from('actual_spend_reports') as ReturnType<typeof supabase.from>)
      .select('id', { count: 'exact', head: true })
      .gte('submitted_at', sevenDaysAgo.toISOString()),
    (serverClient.from('actual_spend_reports') as ReturnType<typeof supabase.from>)
      .select('spot_id, estimated_total, actual_total')
      .limit(500),
  ]);

  const submissionsThisWeek = weekResult.count ?? 0;

  const allRows = (allResult.data as Array<{ spot_id: string | null; estimated_total: number; actual_total: number }> | null) ?? [];

  if (allRows.length === 0) {
    return { submissionsThisWeek, medianAccuracyPct: 0, highVarianceSpots: [] };
  }

  const variances = allRows
    .filter((r) => r.estimated_total > 0)
    .map((r) =>
      100 - Math.round(Math.abs(((r.actual_total - r.estimated_total) / r.estimated_total) * 100))
    );

  variances.sort((a, b) => a - b);
  const medianAccuracyPct = variances[Math.floor(variances.length / 2)] ?? 0;

  // Group by spot_id and find top variance spots
  const bySpot: Record<string, { total_variance: number; count: number }> = {};
  for (const r of allRows) {
    const key = r.spot_id ?? 'unknown';
    const v =
      r.estimated_total > 0
        ? Math.round(Math.abs(((r.actual_total - r.estimated_total) / r.estimated_total) * 100))
        : 0;
    if (!bySpot[key]) bySpot[key] = { total_variance: 0, count: 0 };
    bySpot[key].total_variance += v;
    bySpot[key].count += 1;
  }

  const highVarianceSpots = Object.entries(bySpot)
    .map(([spot_id, s]) => ({
      spot_id: spot_id === 'unknown' ? null : spot_id,
      variance_pct: Math.round(s.total_variance / s.count),
      count: s.count,
    }))
    .filter((s) => s.variance_pct > 10)
    .sort((a, b) => b.variance_pct - a.variance_pct)
    .slice(0, 10);

  return { submissionsThisWeek, medianAccuracyPct, highVarianceSpots };
}

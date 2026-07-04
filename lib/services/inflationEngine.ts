import { supabase } from '../supabase';

export interface InflationMetrics {
  average_monthly_increase_pct: number;
  volatility_score: number; // 0-100 scale based on frequency and size of jumps
  predicted_variance_pct: number; // What we expect the difference to be today
}

/**
 * Inflation Engine — Phase 5
 * Analyzes historical price_audit_logs to determine venue-specific inflation patterns.
 */
export async function calculateVenueInflation(venueId: string): Promise<InflationMetrics> {
  // 1. Fetch historical price changes for this venue's menu items
  const { data: logs, error } = await supabase
    .from('price_audit_logs')
    .select('previous_price, new_price, created_at, menu_items!inner(venue_id)')
    .eq('menu_items.venue_id', venueId)
    .eq('action_type', 'update')
    .not('previous_price', 'is', null)
    .not('new_price', 'is', null)
    .order('created_at', { ascending: true });

  if (error || !logs || logs.length === 0) {
    return { average_monthly_increase_pct: 0, volatility_score: 0, predicted_variance_pct: 0 };
  }

  let totalPctIncrease = 0;
  let maxJumpPct = 0;
  const changes = logs as Array<{ previous_price: number, new_price: number, created_at: string }>;

  changes.forEach(log => {
    if (log.previous_price > 0 && log.new_price > log.previous_price) {
      const pct = ((log.new_price - log.previous_price) / log.previous_price) * 100;
      totalPctIncrease += pct;
      if (pct > maxJumpPct) maxJumpPct = pct;
    }
  });

  const avgIncrease = totalPctIncrease / changes.length;
  
  // Time span
  const firstDate = new Date(changes[0].created_at).getTime();
  const lastDate = new Date(changes[changes.length - 1].created_at).getTime();
  const monthsDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 30));

  const average_monthly_increase_pct = avgIncrease / monthsDiff;
  
  // Volatility: Frequency of changes + size of max jump
  const frequencyScore = Math.min(50, (changes.length / monthsDiff) * 10);
  const jumpScore = Math.min(50, maxJumpPct);
  const volatility_score = Math.round(frequencyScore + jumpScore);

  // Predict variance: if the last check was 3 months ago, variance is 3 * avg_monthly
  // For simplicity, we return a general predicted variance based on a standard 3-month gap
  const predicted_variance_pct = average_monthly_increase_pct * 3;

  return {
    average_monthly_increase_pct: Math.round(average_monthly_increase_pct * 100) / 100,
    volatility_score,
    predicted_variance_pct: Math.round(predicted_variance_pct * 100) / 100
  };
}

/**
 * Predict future price for internal alerting. (Not exposed to users).
 */
export function predictFuturePrice(currentPrice: number, monthlyInflationPct: number, monthsElapsed: number): number {
  if (monthsElapsed <= 0) return currentPrice;
  // Compounded
  const rate = 1 + (monthlyInflationPct / 100);
  const prediction = currentPrice * Math.pow(rate, monthsElapsed);
  return Math.round(prediction);
}

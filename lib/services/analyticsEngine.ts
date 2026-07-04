import { supabase } from '../supabase';

export interface BusinessKPIs {
  average_confidence: number;
  average_estimation_error_pct: number;
  submission_approval_rate: number;
  scout_productivity: number;
  stale_venue_pct: number;
  data_completeness_pct: number;
}

export interface AnalyticsEngine {
  getSystemKPIs(): Promise<BusinessKPIs>;
  getDistrictCoverage(): Promise<Record<string, number>>;
  getCategoryCoverage(): Promise<Record<string, number>>;
  getVenueFreshness(): Promise<{ fresh: number, stale: number, critical: number }>;
}

/**
 * Service to aggregate business intelligence metrics.
 * Designed to be reusable by admin dashboards and future public-facing reports.
 */
export async function getSystemKPIs(): Promise<BusinessKPIs> {
  // 1. Average confidence & Freshness
  const { data: venues } = await supabase
    .from('venues')
    .select('computed_confidence_score, last_price_updated_at')
    .eq('active', true);
    
  let avgConfidence = 0;
  let staleCount = 0;
  
  if (venues && venues.length > 0) {
    const totalConf = venues.reduce((sum, v) => sum + Number(v.computed_confidence_score || 0), 0);
    avgConfidence = totalConf / venues.length;
    
    staleCount = venues.filter(v => {
      if (!v.last_price_updated_at) return true;
      const daysSince = (Date.now() - new Date(v.last_price_updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 90; // Over 3 months is stale
    }).length;
  }
  
  // 2. Average estimation error (Actual Spend Variance)
  const { data: spend } = await supabase
    .from('actual_spend_reports')
    .select('estimated_total, actual_total');
    
  let avgError = 0;
  if (spend && spend.length > 0) {
    const totalVariance = spend.reduce((sum, r) => {
      return sum + Math.abs((r.actual_total - r.estimated_total) / r.estimated_total);
    }, 0);
    avgError = (totalVariance / spend.length) * 100;
  }

  // 3. Approval Rate & Scout Productivity
  const { data: evidence } = await supabase
    .from('price_evidence')
    .select('verification_status, scout_id');
    
  let approvalRate = 0;
  let productivity = 0;
  
  if (evidence && evidence.length > 0) {
    const approved = evidence.filter(e => e.verification_status === 'approved').length;
    approvalRate = (approved / evidence.length) * 100;
    
    const uniqueScouts = new Set(evidence.filter(e => e.scout_id).map(e => e.scout_id)).size;
    productivity = uniqueScouts > 0 ? evidence.length / uniqueScouts : 0;
  }

  return {
    average_confidence: Math.round(avgConfidence),
    average_estimation_error_pct: Math.round(avgError),
    submission_approval_rate: Math.round(approvalRate),
    scout_productivity: Math.round(productivity),
    stale_venue_pct: venues && venues.length > 0 ? Math.round((staleCount / venues.length) * 100) : 0,
    data_completeness_pct: 100 // Placeholder for completeness heuristic
  };
}

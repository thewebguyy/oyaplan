import { supabase } from '../supabase';

export interface CoverageMetrics {
  total_venues: number;
  overall_coverage_pct: number; // Percentage of venues with completed minimum fields
  category_coverage: Record<string, number>;
  parking_coverage_pct: number;
  menu_coverage_pct: number;
}

/**
 * Coverage Engine — Phase 5
 * Calculates Data Flywheel gap completion metrics.
 */
export async function getDistrictCoverage(districtId?: string): Promise<CoverageMetrics> {
  let query = supabase
    .from('venues')
    .select('id, category, has_parking, menu_completeness_score')
    .eq('active', true);

  if (districtId) query = query.eq('district_id', districtId);

  const { data: venues, error } = await query;
  
  if (error || !venues || venues.length === 0) {
    return {
      total_venues: 0,
      overall_coverage_pct: 0,
      category_coverage: {},
      parking_coverage_pct: 0,
      menu_coverage_pct: 0
    };
  }

  let parkingKnown = 0;
  let menusComplete = 0;
  let completelyHealthy = 0;

  const categoryTotals: Record<string, number> = {};
  const categoryHealthy: Record<string, number> = {};

  venues.forEach(v => {
    categoryTotals[v.category] = (categoryTotals[v.category] || 0) + 1;
    
    let isHealthy = true;
    
    if (v.has_parking !== null) parkingKnown++;
    else isHealthy = false;

    if (v.menu_completeness_score >= 80) menusComplete++;
    else isHealthy = false;
    
    if (isHealthy) {
      completelyHealthy++;
      categoryHealthy[v.category] = (categoryHealthy[v.category] || 0) + 1;
    }
  });

  const category_coverage: Record<string, number> = {};
  for (const cat in categoryTotals) {
    category_coverage[cat] = Math.round(((categoryHealthy[cat] || 0) / categoryTotals[cat]) * 100);
  }

  return {
    total_venues: venues.length,
    overall_coverage_pct: Math.round((completelyHealthy / venues.length) * 100),
    category_coverage,
    parking_coverage_pct: Math.round((parkingKnown / venues.length) * 100),
    menu_coverage_pct: Math.round((menusComplete / venues.length) * 100)
  };
}

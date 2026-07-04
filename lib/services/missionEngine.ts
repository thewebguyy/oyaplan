import { supabase } from '../supabase';
import { calculateVenueInflation } from './inflationEngine';

export interface MissionGenerationResult {
  venuesScanned: number;
  missionsCreated: number;
}

const DIFFICULTY_XP = {
  easy: 5,
  medium: 20,
  hard: 60,
  critical: 120
};

/**
 * Calculates priority score and difficulty for a mission.
 */
function calculateMissionPriority(
  venue: any,
  variancePct: number
): { score: number; difficulty: 'easy' | 'medium' | 'hard' | 'critical' } {
  let score = 0;
  
  // Popularity mock (0-30)
  const popularity = 15; // Assume static for now
  score += popularity;
  
  // Confidence Decay (0-30)
  const confidence = Number(venue.computed_confidence_score || 0);
  const decay = Math.max(0, 100 - confidence) * 0.3;
  score += decay;
  
  // Prediction Variance (0-40)
  score += Math.min(40, variancePct);
  
  // Missing Data (0-20)
  if (venue.has_parking === null) score += 10;
  if (venue.menu_completeness_score < 50) score += 10;

  // Freshness (0-20)
  let daysSince = 365;
  if (venue.last_price_updated_at) {
    daysSince = (Date.now() - new Date(venue.last_price_updated_at).getTime()) / (1000 * 60 * 60 * 24);
  }
  score += Math.min(20, (daysSince / 90) * 10);
  
  // Difficulty mapping
  let difficulty: 'easy' | 'medium' | 'hard' | 'critical' = 'medium';
  if (score >= 90 || variancePct > 30) difficulty = 'critical';
  else if (score >= 60 || venue.menu_completeness_score < 30) difficulty = 'hard';
  else if (score < 30) difficulty = 'easy';

  return { score: Math.round(score), difficulty };
}

/**
 * Scans venues and generates predictive missions for missing or stale data.
 */
export async function generateMissions(): Promise<MissionGenerationResult> {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name, computed_confidence_score, last_price_updated_at, has_parking, menu_completeness_score')
    .eq('active', true);

  if (error || !venues) throw new Error(error?.message || 'Failed to fetch venues');

  let missionsCreated = 0;

  for (const venue of venues) {
    // 1. Calculate inflation variance
    const inflation = await calculateVenueInflation(venue.id);
    const variance = inflation.predicted_variance_pct;

    const { score, difficulty } = calculateMissionPriority(venue, variance);
    const reward = DIFFICULTY_XP[difficulty];

    // Determine mission type based on highest priority gap
    let missionType = 'verify_price';
    let title = `Verify prices at ${venue.name}`;

    if (variance > 25) {
      missionType = 'verify_price';
      title = `URGENT: Verify pricing variance at ${venue.name}`;
    } else if (venue.has_parking === null) {
      missionType = 'detect_parking';
      title = `Verify parking availability at ${venue.name}`;
    } else if (venue.menu_completeness_score < 50) {
      missionType = 'upload_menu';
      title = `Digitize full menu for ${venue.name}`;
    }

    // Only create mission if score is above threshold
    if (score >= 40) {
      // Check if open mission exists
      const { count } = await supabase
        .from('scout_missions')
        .select('id', { count: 'exact', head: true })
        .eq('venue_id', venue.id)
        .eq('status', 'open');

      if (count === 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await supabase.from('scout_missions').insert({
          venue_id: venue.id,
          title,
          mission_type: missionType,
          difficulty,
          priority_score: score,
          base_reward_xp: reward,
          factor_prediction_variance: Math.round(variance),
          expires_at: expiresAt.toISOString()
        });
        missionsCreated++;
      }
    }
  }

  return { venuesScanned: venues.length, missionsCreated };
}

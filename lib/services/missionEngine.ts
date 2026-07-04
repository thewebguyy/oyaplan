import { supabase } from '../supabase';
import { getVenueNode } from './knowledgeGraphEngine';
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
 * Calculates priority score deterministically based on Knowledge Graph node.
 */
function calculateMissionPriority(venueNode: any, variancePct: number) {
  let score = 0;
  
  const confidence = venueNode.confidence;
  const decay = Math.max(0, 100 - confidence) * 0.3;
  score += decay;
  
  score += Math.min(40, variancePct);
  
  let difficulty: 'easy' | 'medium' | 'hard' | 'critical' = 'medium';
  if (score >= 90 || variancePct > 30) difficulty = 'critical';
  else if (score >= 60 || venueNode.menu_items_count === 0) difficulty = 'hard';
  else if (score < 30) difficulty = 'easy';

  return { score: Math.round(score), difficulty };
}

/**
 * Autonomous Mission Scheduler — Phase 7
 * Scans venues via Knowledge Graph and generates proactive missions before data goes stale.
 */
export async function scheduleAutonomousMissions(): Promise<MissionGenerationResult> {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name')
    .eq('active', true);

  if (error || !venues) throw new Error(error?.message || 'Failed to fetch venues');

  let missionsCreated = 0;

  for (const v of venues) {
    // 1. Fetch deep context via Knowledge Graph
    const node = await getVenueNode(v.id);
    if (!node) continue;

    // Skip if mission already active
    if (node.active_missions.length > 0) continue;

    // 2. Fetch predicted volatility
    const variance = node.historical_volatility;

    // 3. Score mathematically
    const { score, difficulty } = calculateMissionPriority(node, variance);
    const reward = DIFFICULTY_XP[difficulty];

    let missionType = 'verify_price';
    let title = `Verify prices at ${node.name}`;

    if (variance > 25) {
      missionType = 'verify_price';
      title = `URGENT: Verify pricing variance at ${node.name}`;
    } else if (node.menu_items_count < 3) {
      missionType = 'upload_menu';
      title = `Digitize full menu for ${node.name}`;
    }

    // Proactive trigger threshold (Phase 7: lower threshold to be proactive)
    if (score >= 35) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await supabase.from('scout_missions').insert({
        venue_id: node.id,
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

  return { venuesScanned: venues.length, missionsCreated };
}

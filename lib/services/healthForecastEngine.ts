import { supabase } from '../supabase';
import { ExplainableScore } from './knowledgeGraphEngine';

/**
 * healthForecastEngine — Phase 7
 * Predicts data staleness, confidence collapse, and moderation queues.
 * Used for autonomous mission scheduling.
 */

export async function forecastDistrictConfidence(districtId: string, daysForward: 7 | 30): Promise<ExplainableScore<number>> {
  const { data: venues } = await supabase
    .from('venues')
    .select('computed_confidence_score, predicted_price_variance_pct')
    .eq('district_id', districtId)
    .eq('active', true);

  if (!venues || venues.length === 0) {
    return {
      value: 0,
      explanation: { factors: {}, human_readable: ['No active venues in district'] }
    };
  }

  let totalCurrentConfidence = 0;
  let totalPredictedConfidence = 0;
  
  venues.forEach(v => {
    const current = Number(v.computed_confidence_score || 0);
    const variance = Number(v.predicted_price_variance_pct || 0);
    
    totalCurrentConfidence += current;
    
    // Decay formula: drops by (variance * 0.5) per week.
    const weeksForward = daysForward / 7;
    const drop = variance * 0.5 * weeksForward;
    const predicted = Math.max(0, current - drop);
    
    totalPredictedConfidence += predicted;
  });

  const avgCurrent = totalCurrentConfidence / venues.length;
  const avgPredicted = totalPredictedConfidence / venues.length;
  
  return {
    value: Math.round(avgPredicted),
    explanation: {
      factors: {
        current_average_confidence: Math.round(avgCurrent),
        days_forward: daysForward,
        venue_count: venues.length
      },
      human_readable: [
        `Currently at ${Math.round(avgCurrent)}% confidence.`,
        `Expected to drop to ${Math.round(avgPredicted)}% in ${daysForward} days due to price volatility.`
      ]
    }
  };
}

export async function predictModerationBacklog(): Promise<ExplainableScore<number>> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { count: incoming } = await supabase
    .from('price_evidence')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  const { count: processed } = await supabase
    .from('price_audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action_type', 'update')
    .eq('changed_by', 'admin_moderator')
    .gte('created_at', sevenDaysAgo);
    
  const { count: currentBacklog } = await supabase
    .from('price_evidence')
    .select('id', { count: 'exact', head: true })
    .eq('verification_status', 'pending');

  const incomingCount = incoming || 0;
  const processedCount = processed || 0;
  const backlog = currentBacklog || 0;

  // Forecast next 7 days backlog
  const netChange = incomingCount - processedCount;
  const expectedBacklog = Math.max(0, backlog + netChange);

  return {
    value: expectedBacklog,
    explanation: {
      factors: {
        incoming_last_7d: incomingCount,
        processed_last_7d: processedCount,
        current_backlog: backlog,
        net_change: netChange
      },
      human_readable: [
        `Processing ${processedCount} items/week against ${incomingCount} new submissions.`,
        netChange > 0 
          ? `Backlog is growing by ${netChange}/week.` 
          : `Queue is healthy and shrinking.`
      ]
    }
  };
}

import { supabase } from '../supabase';
import { predictModerationBacklog, forecastDistrictConfidence } from './healthForecastEngine';

/**
 * alertEngine — Phase 7
 * Scans health forecasts and generates deterministic alerts for ops.
 */

export async function scanSystemHealth() {
  const alerts = [];
  
  // 1. Check Moderation Backlog
  const backlogPrediction = await predictModerationBacklog();
  if (backlogPrediction.value > 100 && backlogPrediction.explanation.factors.net_change > 0) {
    alerts.push({
      severity: 'high',
      alert_type: 'mission_backlog',
      entity_type: 'system',
      message: `Moderation queue is swelling. Expected backlog: ${backlogPrediction.value}. ${backlogPrediction.explanation.human_readable.join(' ')}`
    });
  }

  // 2. Check District Health
  const { data: districts } = await supabase.from('districts').select('id, name');
  if (districts) {
    for (const district of districts) {
      const forecast = await forecastDistrictConfidence(district.id, 7);
      if (forecast.value < 40) {
        alerts.push({
          severity: 'critical',
          alert_type: 'confidence_drop',
          entity_type: 'district',
          entity_id: district.id,
          message: `${district.name} confidence is critically low (${forecast.value}% predicted). ${forecast.explanation.human_readable.join(' ')}`
        });
      }
    }
  }

  // Insert alerts
  if (alerts.length > 0) {
    await supabase.from('operational_alerts').insert(alerts);
  }

  return alerts.length;
}

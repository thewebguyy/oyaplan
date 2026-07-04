import { supabase } from '../../supabase';
import { EventName } from './types';

/**
 * Phase 8: Product Validation Layer
 * Funnels, Cohorts, and Derived Health Metrics
 */

export class ProductIntelligence {
  /**
   * FUNNEL ENGINE
   * Calculates absolute drop-off between sequential steps.
   * e.g. ['forge_started', 'forge_completed', 'plan_shared']
   */
  static async calculateFunnel(steps: EventName[], daysLookback: number = 30) {
    if (steps.length < 2) throw new Error('Funnel requires at least 2 steps');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    // Get raw counts (a real production analytics system would use ClickHouse or a specialized PG extension, 
    // but for our Supabase fallback, we do a basic aggregation).
    const results: { step: string; count: number; dropoff_from_previous_pct: number; conversion_from_start_pct: number; }[] = [];
    let previousStepCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const { count, error } = await supabase
        .from('raw_product_events')
        .select('session_id', { count: 'exact', head: true })
        .eq('event_name', steps[i])
        .gte('created_at', startDate.toISOString());
        
      const currentCount = count || 0;
      
      results.push({
        step: steps[i],
        count: currentCount,
        dropoff_from_previous_pct: i === 0 ? 0 : 
          (previousStepCount > 0 ? ((previousStepCount - currentCount) / previousStepCount) * 100 : 100),
        conversion_from_start_pct: i === 0 ? 100 : 
          (results[0].count > 0 ? (currentCount / results[0].count) * 100 : 0)
      });
      
      previousStepCount = currentCount;
    }
    
    return results;
  }

  /**
   * DERIVED HEALTH METRICS
   * Calculates specific business questions.
   */
  static async getActivationMetrics(daysLookback: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);
    
    const { data: events } = await supabase
      .from('raw_product_events')
      .select('session_id, event_name, properties')
      .in('event_name', ['forge_started', 'forge_completed'])
      .gte('created_at', startDate.toISOString());
      
    if (!events || events.length === 0) return null;

    const starts = events.filter(e => e.event_name === 'forge_started').length;
    const completions = events.filter(e => e.event_name === 'forge_completed');
    
    const activationRate = starts > 0 ? (completions.length / starts) * 100 : 0;
    
    // Calculate median duration
    const durations = completions
      .map(e => e.properties?.duration_ms)
      .filter((d): d is number => typeof d === 'number')
      .sort((a, b) => a - b);
      
    const medianDurationMs = durations.length > 0 
      ? durations[Math.floor(durations.length / 2)] 
      : 0;

    return {
      activationRate: Math.round(activationRate),
      medianTimeToForgeSeconds: Math.round(medianDurationMs / 1000)
    };
  }

  /**
   * COHORT ENGINE
   * Future implementation point for cohort segmentation.
   */
  static async getActiveCohorts() {
    // Example: Return counts for First-Time vs Returning users in the last 7 days
    return {
      first_time: 150, // Mock
      returning: 45 // Mock
    };
  }
}

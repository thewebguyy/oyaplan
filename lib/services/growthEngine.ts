import { supabase } from '../supabase';
import { AnalyticsService } from './analytics/analyticsService';

export interface AttributionPayload {
  session_id: string;
  referrer_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path: string;
  device_fingerprint?: string; // Optional hardware hash from client
  ip_address?: string;
}

export type FraudScore = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export class GrowthEngine {
  
  /**
   * Evaluates fraud using non-blocking heuristics.
   * Returns a score and flags for Operations review.
   */
  static calculateFraudScore(
    referrerId: string, 
    refereeId: string, 
    clientContext: any
  ): { score: FraudScore; flags: string[] } {
    const flags: string[] = [];
    let severity = 0; // 0 = safe, 100 = critical

    if (referrerId === refereeId) {
      flags.push('self_referral');
      severity += 100;
    }

    // A real implementation would compare the referee's clientContext to the referrer's
    // known context in user_traits or session logs.
    if (clientContext?.ip_match) {
      flags.push('ip_match');
      severity += 50;
    }
    
    if (clientContext?.device_match) {
      flags.push('device_fingerprint_match');
      severity += 80;
    }

    let score: FraudScore = 'safe';
    if (severity >= 100) score = 'critical';
    else if (severity >= 80) score = 'high';
    else if (severity >= 50) score = 'medium';
    else if (severity > 0) score = 'low';

    return { score, flags };
  }

  /**
   * Securely upserts the initial anonymous campaign attribution.
   * Logs to Phase 8 Analytics Layer.
   */
  static async claimAttribution(payload: AttributionPayload, userId?: string) {
    const { session_id, referrer_code, landing_path, device_fingerprint, ip_address, ...utms } = payload;

    const { error } = await supabase
      .from('attribution_sessions')
      .upsert({
        session_id,
        user_id: userId || null,
        referrer_code,
        ...utms,
        landing_path,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    if (error) console.error("Failed to claim attribution session:", error);

    // Track analytics natively
    if (referrer_code) {
      await AnalyticsService.track('invite_opened', {
        session_id,
        properties: { category: 'Growth', referrer_code, version: '1.0' }
      }, userId);
    }

    if (utms.utm_campaign || utms.utm_source) {
      await AnalyticsService.track('utm_captured', {
        session_id,
        properties: { 
          category: 'Acquisition',
          utm_campaign: utms.utm_campaign,
          utm_source: utms.utm_source,
          utm_medium: utms.utm_medium,
          version: '1.0'
        }
      }, userId);
    }
  }

  /**
   * Automatically triggered by existing Webhooks/Server Actions.
   * Advances the referral ledger linearly.
   */
  static async advanceMilestone(refereeId: string, milestone: string) {
    // Find the original attribution
    const { data: session } = await supabase
      .from('attribution_sessions')
      .select('referrer_code')
      .eq('user_id', refereeId)
      .not('referrer_code', 'is', null)
      .single();

    if (!session || !session.referrer_code) return;

    // Resolve referrer ID from code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', session.referrer_code)
      .single();

    if (!codeData) return;

    const referrerId = codeData.user_id;

    // Check fraud asynchronously (non-blocking)
    const { score, flags } = GrowthEngine.calculateFraudScore(referrerId, refereeId, {});

    // Upsert the ledger (updates status if it exists, creates if it doesn't)
    await supabase
      .from('referral_ledger')
      .upsert({
        referrer_id: referrerId,
        referee_id: refereeId,
        milestone,
        fraud_score: score,
        fraud_flags: flags,
        updated_at: new Date().toISOString()
      }, { onConflict: 'referrer_id, referee_id' });

    // Inform Analytics Pipeline that a growth loop completed
    await AnalyticsService.track('referral_milestone_achieved', {
      session_id: crypto.randomUUID(), // System-generated event
      properties: {
        category: 'Growth',
        milestone,
        fraud_score: score,
        version: '1.0'
      }
    }, referrerId);
  }
}

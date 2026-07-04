import { supabase } from '../../supabase';
import { ProductIntelligence } from './productIntelligence';

/**
 * Phase 9: Growth Analytics
 * Mathematical intelligence for the Growth Engine.
 */
export class GrowthAnalytics {
  
  /**
   * Calculates the K-Factor (Virality Coefficient).
   * K = (Total Invites Sent) * (Invite Conversion Rate)
   * If K > 1, the platform is experiencing exponential viral growth.
   */
  static async getKFactor(daysLookback: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    // 1. Total invites sent
    const { count: invitesSentCount } = await supabase
      .from('raw_product_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', 'invite_sent')
      .gte('created_at', startDate.toISOString());

    // 2. Total converted invites (e.g. signup milestone reached)
    const { count: convertedCount } = await supabase
      .from('referral_ledger')
      .select('id', { count: 'exact', head: true })
      .in('milestone', ['signup', 'profile_created', 'first_forge', 'first_share', 'spend_submitted', 'retained_30d'])
      .not('fraud_score', 'in', '("high","critical")') // Ignore highly fraudulent conversions
      .gte('created_at', startDate.toISOString());

    const invites = invitesSentCount || 0;
    const conversions = convertedCount || 0;

    if (invites === 0) return 0;

    const conversionRate = conversions / invites;
    
    // K-Factor = Invitations Sent Per User * Conversion Rate
    // For simplicity of global metric, we use total conversions / total active users
    // But a strict K-factor requires knowing "avg invites per user"
    const { count: activeUsers } = await supabase
      .from('attribution_sessions')
      .select('user_id', { count: 'exact', head: true })
      .not('user_id', 'is', null)
      .gte('created_at', startDate.toISOString());
      
    const users = activeUsers || 1;
    const avgInvitesPerUser = invites / users;

    return avgInvitesPerUser * conversionRate;
  }

  /**
   * Generates the Referral Funnel using the Phase 8 ProductIntelligence engine natively.
   */
  static async getReferralFunnel(daysLookback: number = 30) {
    return ProductIntelligence.calculateFunnel(
      ['invite_sent', 'invite_opened', 'referral_milestone_achieved'], 
      daysLookback
    );
  }
}

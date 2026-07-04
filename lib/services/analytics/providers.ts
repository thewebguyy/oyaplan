import { AnalyticsPayload, EventName } from './types';
import { supabase } from '../../supabase';

export interface AnalyticsProvider {
  track<T extends EventName>(payload: AnalyticsPayload<T>, userId?: string): Promise<void>;
  identify(userId: string, traits: Record<string, any>): Promise<void>;
  alias(userId: string, previousId: string): Promise<void>;
}

/**
 * Supabase Analytics Provider
 * The Source of Truth. Guarantees zero vendor lock-in.
 */
export class SupabaseProvider implements AnalyticsProvider {
  async track<T extends EventName>(payload: AnalyticsPayload<T>, userId?: string): Promise<void> {
    const { session_id, event_name, properties, feature_flags, experiments, client_context } = payload;
    
    // @ts-ignore - The dynamic category is extracted from the Zod payload
    const category = properties.category;
    
    await supabase.from('raw_product_events').insert({
      session_id,
      user_id: userId || null,
      category,
      event_name,
      version: properties.version,
      properties,
      feature_flags: feature_flags || {},
      experiments: experiments || {},
      client_context: client_context || {}
    });
  }

  async identify(userId: string, traits: Record<string, any>): Promise<void> {
    // Upsert user traits into a lightweight user_traits table if needed,
    // or rely on auth.users and user_preferences.
  }

  async alias(userId: string, previousId: string): Promise<void> {
    // Update all historical anonymous events to link to the new authenticated user
    await supabase
      .from('raw_product_events')
      .update({ user_id: userId })
      .eq('session_id', previousId)
      .is('user_id', null);
  }
}

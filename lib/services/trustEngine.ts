import { supabase } from '../supabase';

export interface TimelineEvent {
  event_type: 'confidence_change' | 'status_change' | 'typical_cost_change' | 'menu_price';
  previous_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  reason: string;
  created_at: string;
}

/**
 * getVenueMethodology
 *
 * Explains exactly why a venue has its current confidence score.
 * Returns an array of human-readable data points based on actual database facts.
 */
export async function getVenueMethodology(venueId: string): Promise<string[]> {
  try {
    const [menuItemsResult, evidenceResult] = await Promise.all([
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('venue_id', venueId).eq('is_available', true),
      supabase.from('price_evidence').select('source_type, submitted_by, created_at, verification_status').eq('venue_id', venueId)
    ]);

    const itemsCount = menuItemsResult.count || 0;
    const evidence = evidenceResult.data || [];

    const approvedEvidence = evidence.filter(e => e.verification_status === 'approved');
    const receiptsCount = approvedEvidence.filter(e => e.source_type === 'receipt_upload').length;
    const adminCount = approvedEvidence.filter(e => ['owner_submission', 'manual_verification'].includes(e.source_type)).length;
    
    // Find unique scouts excluding 'seeding_trigger', 'user_feedback', 'actual_spend_flywheel'
    const systemActors = ['seeding_trigger', 'user_feedback_low', 'user_feedback_right', 'user_feedback_high', 'actual_spend_flywheel'];
    const uniqueScouts = new Set(approvedEvidence.map(e => e.submitted_by).filter(s => !systemActors.includes(s)));

    // Find last update
    const timestamps = approvedEvidence.map(e => new Date(e.created_at).getTime());
    const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    const daysSince = maxTime > 0 ? Math.floor((Date.now() - maxTime) / (1000 * 60 * 60 * 24)) : null;

    const methodology: string[] = [];
    methodology.push(`${itemsCount} verified menu items`);
    if (receiptsCount > 0) methodology.push(`${receiptsCount} real receipts`);
    if (adminCount > 0) methodology.push(`Verified directly by venue or admin`);
    if (uniqueScouts.size > 0) methodology.push(`Confirmed by ${uniqueScouts.size} independent users/scouts`);
    if (daysSince !== null) {
      if (daysSince === 0) methodology.push(`Updated today`);
      else methodology.push(`Updated ${daysSince} days ago`);
    }

    return methodology;
  } catch (err) {
    console.error(`Error in getVenueMethodology for venue ${venueId}:`, err);
    return ['Methodology currently unavailable'];
  }
}

/**
 * getVenueHistory
 *
 * Retrieves the historical timeline of trust and pricing changes for a venue.
 */
export async function getVenueHistory(venueId: string): Promise<TimelineEvent[]> {
  try {
    const { data, error } = await supabase
      .from('price_audit_logs')
      .select('event_type, previous_value, new_value, reason, created_at')
      .eq('venue_id', venueId)
      .in('event_type', ['confidence_change', 'status_change', 'typical_cost_change'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error fetching venue history for ${venueId}:`, error.message);
      return [];
    }

    return data as TimelineEvent[];
  } catch (err) {
    console.error(`Exception in getVenueHistory for ${venueId}:`, err);
    return [];
  }
}

export interface EvidencePayload {
  venue_id: string;
  source: 'extraction' | 'external_dataset' | 'manual' | 'receipt_upload';
  evidence_url?: string;
  price_data?: { price: number; type: 'average_spend' | 'entrance_fee' | 'general_menu'; item_name?: string };
  import_batch_id?: string;
}

export class EvidenceFactory {
  /**
   * Routes incoming evidence to the correct downstream tables.
   */
  static async addEvidence(payload: EvidencePayload): Promise<{ success: boolean; error?: string }> {
    try {
      if (payload.price_data) {
        // Route to price_evidence
        const { error } = await supabase.from('price_evidence').insert({
          venue_id: payload.venue_id,
          source_type: payload.source === 'external_dataset' ? 'extraction' : payload.source,
          evidence_url: payload.evidence_url,
          price_naira: payload.price_data.price,
          item_type: payload.price_data.type,
          verification_status: 'approved',
          import_batch_id: payload.import_batch_id
        });
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}


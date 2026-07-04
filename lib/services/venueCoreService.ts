import { supabase } from '../supabase';

export interface CreateVenuePayload {
  name: string;
  district_id: string;
  category: string;
  address?: string;
  vibe_tags?: string[];
  import_batch_id?: string;
  active?: boolean;
}

/**
 * VenueCoreService
 * 
 * Owns the lifecycle of a venue. External importers or tools must call this
 * service to create or modify venues, ensuring domain logic is enforced.
 */
export class VenueCoreService {
  
  static async createVenue(payload: CreateVenuePayload): Promise<{ id: string; error?: string }> {
    const { data, error } = await supabase
      .from('venues')
      .insert({
        name: payload.name,
        district_id: payload.district_id,
        category: payload.category,
        address: payload.address,
        vibe_tags: payload.vibe_tags || [],
        import_batch_id: payload.import_batch_id,
        active: payload.active ?? true,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { id: '', error: error?.message || 'Unknown error' };
    }
    return { id: data.id };
  }

  static async updateVenue(venueId: string, payload: Partial<CreateVenuePayload>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('venues')
      .update(payload)
      .eq('id', venueId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  static async archiveVenue(venueId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('venues')
      .update({ active: false, operational_status: 'archived' })
      .eq('id', venueId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  /**
   * Merges a duplicate venue into a primary venue.
   * Future implementation: re-parent evidence, menu items, and claims, then archive source.
   */
  static async mergeVenue(sourceId: string, targetId: string): Promise<{ success: boolean; error?: string }> {
    // 1. Move price evidence
    await supabase.from('price_evidence').update({ venue_id: targetId }).eq('venue_id', sourceId);
    
    // 2. Move menu items
    await supabase.from('menu_items').update({ venue_id: targetId }).eq('venue_id', sourceId);

    // 3. Archive source
    return this.archiveVenue(sourceId);
  }
}

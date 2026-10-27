import { createServerClient } from '../../supabase-server';
import { SessionResolver } from './sessionResolver';
import { captureServerException } from '../../sentry';
import { Spot } from '@/lib/types';

export class SavedVenueService {
  /**
   * Helper to resolve canonical UUID from venueId (handles UUIDs, slugs, and spot references)
   */
  private static async resolveCanonicalVenueId(venueId: string, supabase: any): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(venueId);
    if (isUuid) return venueId;

    // Look up by name or slug in venues
    try {
      const { data: bySlug } = await supabase
        .from('venues')
        .select('id')
        .eq('slug', venueId)
        .maybeSingle();

      if (bySlug?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bySlug.id)) {
        return bySlug.id;
      }
    } catch {
      // Ignore if slug column not present
    }

    const { data: v } = await supabase
      .from('venues')
      .select('id')
      .ilike('name', `%${venueId.replace(/-/g, ' ')}%`)
      .maybeSingle();

    if (v?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id)) {
      return v.id;
    }

    // Look up in spots
    const { data: s } = await supabase
      .from('spots')
      .select('id')
      .or(`id.eq.${venueId},name.ilike.%${venueId.replace(/-/g, ' ')}%`)
      .maybeSingle();

    if (s?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id)) {
      return s.id;
    }

    return null;
  }

  /**
   * Persists a saved venue for the authenticated user.
   */
  static async saveVenue(venueId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();

      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();
      const canonicalId = await this.resolveCanonicalVenueId(venueId, supabase);
      if (!canonicalId) {
        return { success: false, error: 'invalid_venue_id' };
      }

      const { error } = await supabase
        .from('user_saved_venues')
        .insert({
          user_id: identity.profile.id,
          venue_id: canonicalId,
        });

      // 23505 = unique_violation (already saved) - treat as success
      if (error && error.code !== '23505') {
        throw error;
      }

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_save' };
    }
  }

  /**
   * Removes a saved venue for the authenticated user.
   */
  static async removeVenue(venueId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const identity = await SessionResolver.resolveIdentity();

      if (identity.type !== 'authenticated') {
        return { success: false, error: 'unauthorized' };
      }

      const supabase = await createServerClient();
      const canonicalId = await this.resolveCanonicalVenueId(venueId, supabase) || venueId;

      const { error } = await supabase
        .from('user_saved_venues')
        .delete()
        .eq('user_id', identity.profile.id)
        .eq('venue_id', canonicalId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      captureServerException(error);
      return { success: false, error: 'failed_to_remove' };
    }
  }

  /**
   * Gets the list of saved venue IDs for an authenticated user.
   */
  static async getSavedVenueIds(explicitUserId?: string): Promise<{ success: boolean; data: string[] | null; error?: string }> {
    try {
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const identity = await SessionResolver.resolveIdentity();
        if (identity.type !== 'authenticated') {
          return { success: false, data: null, error: 'unauthorized' };
        }
        targetUserId = identity.profile.id;
      }

      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('user_saved_venues')
        .select('venue_id, saved_at')
        .eq('user_id', targetUserId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const venueIds = (data || []).map((row) => row.venue_id);
      return { success: true, data: venueIds, error: undefined };
    } catch (error) {
      captureServerException(error);
      return { success: false, data: null, error: 'fetch_failed' };
    }
  }

  /**
   * Gets the full list of saved venue Spot objects for an authenticated user,
   * querying venues/spots so saved spots reflect across all devices.
   */
  static async getSavedVenues(explicitUserId?: string): Promise<{ success: boolean; data: Spot[] | null; error?: string }> {
    try {
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const identity = await SessionResolver.resolveIdentity();
        if (identity.type !== 'authenticated') {
          return { success: false, data: null, error: 'unauthorized' };
        }
        targetUserId = identity.profile.id;
      }

      const supabase = await createServerClient();
      const { data: rows, error } = await supabase
        .from('user_saved_venues')
        .select('venue_id, saved_at')
        .eq('user_id', targetUserId)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      if (!rows || rows.length === 0) {
        return { success: true, data: [], error: undefined };
      }

      const venueIds = rows.map((r) => r.venue_id);

      // Fetch from venues table
      const { data: venuesData } = await supabase
        .from('venues')
        .select('*, districts(id, name, slug)')
        .in('id', venueIds);

      // Fetch from spots table for any spots not in venues
      const { data: spotsData } = await supabase
        .from('spots')
        .select('*, areas(*)')
        .in('id', venueIds);

      const spotMap = new Map<string, Spot>();

      if (venuesData) {
        for (const v of venuesData) {
          spotMap.set(v.id, {
            id: v.id,
            name: v.name,
            address: v.address || 'Lagos, Nigeria',
            address_slug: v.districts?.slug || 'lagos',
            area_id: v.district_id || '',
            vibe_tags: v.vibe_tags || ['Chill'],
            price_per_person: v.derived_typical_cost || 0,
            transport_matrix: {},
            is_featured: v.is_featured || false,
            active: v.active !== false,
            category: v.category || 'restaurant',
            cover_url: v.cover_url || undefined,
            image_url: v.cover_url || undefined,
            gallery_urls: v.gallery_urls || [],
            computed_confidence_score: v.computed_confidence_score || 80,
            areas: v.districts ? { id: v.districts.id || v.district_id || '', name: v.districts.name, slug: v.districts.slug } : undefined,
          });
        }
      }

      if (spotsData) {
        for (const s of spotsData) {
          if (!spotMap.has(s.id)) {
            spotMap.set(s.id, s as Spot);
          }
        }
      }

      // Preserve saved_at order
      const result: Spot[] = [];
      for (const id of venueIds) {
        const spot = spotMap.get(id);
        if (spot) {
          result.push(spot);
        }
      }

      return { success: true, data: result, error: undefined };
    } catch (error) {
      captureServerException(error);
      return { success: false, data: null, error: 'fetch_failed' };
    }
  }
}

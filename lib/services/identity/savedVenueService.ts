import { createServerClient } from '../../supabase-server';
import { SessionResolver } from './sessionResolver';
import { captureServerException } from '../../sentry';

export class SavedVenueService {
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
      const { error } = await supabase
        .from('user_saved_venues')
        .insert({
          user_id: identity.profile.id,
          venue_id: venueId,
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
      const { error } = await supabase
        .from('user_saved_venues')
        .delete()
        .eq('user_id', identity.profile.id)
        .eq('venue_id', venueId);

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
}

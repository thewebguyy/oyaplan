import { supabase } from '../supabase';

export interface VenueClaim {
  id: string;
  venue_id: string;
  user_id: string;
  verification_method: 'business_document' | 'email_domain' | 'phone' | 'manual';
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  claimed_at: string;
  approved_at?: string;
}

/**
 * Submit a venue ownership claim for manual admin verification.
 */
export async function submitVenueClaim(
  venueId: string,
  userId: string,
  method: 'business_document' | 'manual',
  documentUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('venue_claims').insert({
      venue_id: venueId,
      user_id: userId,
      verification_method: method,
      document_url: documentUrl,
      status: 'pending'
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update venue operational details.
 * Edits are routed to the venue_edit_requests queue for moderation.
 */
export async function submitVenueEditRequest(
  venueId: string,
  userId: string,
  fieldName: 'opening_hours' | 'contact_number' | 'contact_email' | 'logo_url' | 'cover_url',
  newValue: any,
  oldValue?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Verify user is owner or manager
    const { data: roleData, error: roleError } = await supabase
      .from('venue_roles')
      .select('role')
      .eq('venue_id', venueId)
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: You do not have permission to edit this venue.');
    }

    // 2. Submit edit request to moderation queue
    const { error } = await supabase.from('venue_edit_requests').insert({
      venue_id: venueId,
      user_id: userId,
      field_name: fieldName,
      old_value: oldValue || null,
      new_value: newValue,
      status: 'pending'
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

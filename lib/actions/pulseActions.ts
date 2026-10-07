'use server';

import { createServerClient } from '@/lib/supabase-server';
import { checkVenueAuthorization } from '@/lib/queries/partner';
import { revalidatePath } from 'next/cache';
import { verifyVenueVisitAction } from '@/lib/actions/venueAttributionActions';

export type PulseVenueStatus =
  | 'open'
  | 'tables_tight'
  | 'at_capacity'
  | 'walk_ins_only'
  | 'private_buyout'
  | 'kitchen_closed'
  | 'closed';

/**
 * updateVenueLiveStatusAction
 * Auto-saving live broadcast venue state control for The Pulse.
 * Replaces static profile toggling with instant operational dispatch.
 */
export async function updateVenueLiveStatusAction(
  venueId: string,
  status: PulseVenueStatus,
  customReason?: string
): Promise<{ success: boolean; status: PulseVenueStatus; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, status, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, status, error: 'Unauthorized' };

    const todayStr = new Date().toISOString().split('T')[0];
    let isClosed = false;
    let reason: string | null = null;
    let startDate: string | null = null;

    switch (status) {
      case 'open':
        isClosed = false;
        reason = null;
        startDate = null;
        break;
      case 'tables_tight':
        isClosed = false;
        reason = 'Tables Tight';
        break;
      case 'at_capacity':
        isClosed = true;
        reason = customReason || 'At Capacity';
        startDate = todayStr;
        break;
      case 'walk_ins_only':
        isClosed = false;
        reason = 'Walk-ins Only';
        break;
      case 'private_buyout':
        isClosed = true;
        reason = customReason || 'Private Buyout';
        startDate = todayStr;
        break;
      case 'kitchen_closed':
        isClosed = false;
        reason = 'Kitchen Closed';
        break;
      case 'closed':
        isClosed = true;
        reason = customReason || 'Closed for the night';
        startDate = todayStr;
        break;
    }

    const { error } = await supabase
      .from('venues')
      .update({
        is_temporarily_closed: isClosed,
        temporary_closure_start: startDate,
        temporary_closure_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', venueId);

    if (error) {
      return { success: false, status, error: error.message };
    }

    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/updates`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true, status };
  } catch (err: unknown) {
    return {
      success: false,
      status,
      error: err instanceof Error ? err.message : 'Failed to update venue status'
    };
  }
}

/**
 * toggleMenuItem86Action
 * Hospitality-native "86'd" availability toggle for The Board.
 * Persists immediately and excludes item from customer planning.
 */
export async function toggleMenuItem86Action(
  venueId: string,
  menuItemId: string,
  isAvailable: boolean
): Promise<{ success: boolean; menuItemId: string; isAvailable: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, menuItemId, isAvailable: !isAvailable, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, menuItemId, isAvailable: !isAvailable, error: 'Unauthorized' };

    const { error: updateError } = await supabase
      .from('menu_items')
      .update({
        is_available: isAvailable,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', menuItemId)
      .eq('venue_id', venueId);

    if (updateError) {
      return { success: false, menuItemId, isAvailable: !isAvailable, error: updateError.message };
    }

    // Non-destructive audit log
    await supabase
      .from('price_audit_logs')
      .insert({
        menu_item_id: menuItemId,
        changed_by: user.email || user.id,
        action_type: 'update',
        reason: isAvailable ? 'Marked available on The Board' : "86'd (Marked unavailable) on The Board",
      });

    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/pricing`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true, menuItemId, isAvailable };
  } catch (err: unknown) {
    return {
      success: false,
      menuItemId,
      isAvailable: !isAvailable,
      error: err instanceof Error ? err.message : "Failed to 86 item"
    };
  }
}

/**
 * updateVenueHouseRulesAction
 * Auto-saves oversized House Rules switches (Corkage, Dress Code, Cake Fees, Minimum Spend).
 */
export interface HouseRulesInput {
  corkageFee?: number | null;
  dressCode?: 'casual' | 'smart_casual' | 'formal' | 'nightlife' | null;
  cakeFee?: number | null;
  minimumSpend?: number | null;
  reservationFee?: number | null;
}

export async function updateVenueHouseRulesAction(
  venueId: string,
  rules: HouseRulesInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const payload: Record<string, any> = {
      celebration_rules_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (rules.corkageFee !== undefined) payload.corkage_fee = rules.corkageFee;
    if (rules.dressCode !== undefined) payload.dress_code = rules.dressCode;
    if (rules.cakeFee !== undefined) payload.cake_fee = rules.cakeFee;
    if (rules.minimumSpend !== undefined) payload.minimum_spend = Math.max(0, rules.minimumSpend || 0);
    if (rules.reservationFee !== undefined) payload.reservation_fee = Math.max(0, rules.reservationFee || 0);

    const { error } = await supabase
      .from('venues')
      .update(payload)
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/venue`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update House Rules'
    };
  }
}

/**
 * updateVenueVibeAction
 * Direct inline editing of venue presentation (description, cover, category).
 * Auto-saves on blur/selection without any "Save Profile" button.
 */
export interface VibeUpdateInput {
  description?: string;
  coverUrl?: string;
  vibeTags?: string[];
}

export async function updateVenueVibeAction(
  venueId: string,
  input: VibeUpdateInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.coverUrl !== undefined) payload.cover_url = input.coverUrl.trim();
    if (input.vibeTags !== undefined) payload.vibe_tags = input.vibeTags;

    const { error } = await supabase
      .from('venues')
      .update(payload)
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/venue`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update venue vibe'
    };
  }
}

/**
 * decideSquadAction
 * Approve or decline incoming squads on The Floor.
 */
export async function decideSquadAction(
  venueId: string,
  planCode: string,
  decision: 'approve' | 'decline'
): Promise<{ success: boolean; decision: 'approve' | 'decline'; message: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        decision,
        message: 'Authentication required',
        error: 'Authentication required',
      };
    }

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) {
      return {
        success: false,
        decision,
        message: 'Unauthorized to manage this venue',
        error: 'Unauthorized',
      };
    }

    if (decision === 'approve') {
      const res = await verifyVenueVisitAction(venueId, planCode);
      if (!res.success) {
        return {
          success: false,
          decision,
          message: res.error || 'Failed to approve squad',
          error: res.error,
        };
      }
      return {
        success: true,
        decision,
        message: 'Squad approved! Added to tonight’s guestlist.',
      };
    } else {
      // Decline action: operator declines the request
      revalidatePath(`/business/${venueId}`);
      revalidatePath(`/business/${venueId}/reservations`);
      return {
        success: true,
        decision,
        message: 'Squad request declined.',
      };
    }
  } catch (err: unknown) {
    return {
      success: false,
      decision,
      message: 'Unexpected error during decision',
      error: err instanceof Error ? err.message : 'Error'
    };
  }
}

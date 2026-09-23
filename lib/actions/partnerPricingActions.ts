'use server';

import { createServerClient } from '@/lib/supabase-server';
import { checkVenueAuthorization } from '@/lib/queries/partner';
import { revalidatePath } from 'next/cache';

export interface UpdatePriceInput {
  venueId: string;
  menuItemId: string;
  newPrice: number;
  reason: string;
  notes?: string;
}

export async function updateMenuItemPriceAction(
  input: UpdatePriceInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { venueId, menuItemId, newPrice, reason, notes } = input;

    if (!venueId || !menuItemId) {
      return { success: false, error: 'Venue and Menu Item IDs are required' };
    }
    if (typeof newPrice !== 'number' || isNaN(newPrice) || newPrice <= 0 || newPrice > 10000000) {
      return { success: false, error: 'Please enter a valid price in Naira' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Verify user authorization server-side
    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) {
      return { success: false, error: 'Unauthorized to modify pricing for this venue' };
    }

    // Fetch existing menu item to get previous price
    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .select('id, venue_id, price, name')
      .eq('id', menuItemId)
      .eq('venue_id', venueId)
      .single();

    if (itemError || !item) {
      return { success: false, error: 'Menu item not found for this venue' };
    }

    const previousPrice = item.price;
    const actorIdentifier = user.email || user.id;

    // 1. Update menu item (last_updated_at updated)
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({
        price: newPrice,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', menuItemId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Insert into price_evidence as owner submission (Pending verification by OyaPlan)
    const { data: evidence } = await supabase
      .from('price_evidence')
      .insert({
        venue_id: venueId,
        menu_item_id: menuItemId,
        source_type: 'owner_submission',
        submitted_by: actorIdentifier,
        recorded_price: newPrice,
        verification_status: 'pending',
        confidence_weight: 0.85,
      })
      .select('id')
      .maybeSingle();

    // 3. Write non-destructive audit log
    const auditReason = notes ? `${reason} — ${notes}` : reason;
    await supabase
      .from('price_audit_logs')
      .insert({
        menu_item_id: menuItemId,
        changed_by: actorIdentifier,
        action_type: 'update',
        previous_price: previousPrice,
        new_price: newPrice,
        evidence_id: evidence?.id || null,
        reason: auditReason,
      });

    // 4. Update venue pricing metadata
    await supabase
      .from('venues')
      .update({
        last_price_updated_at: new Date().toISOString(),
        last_price_source: 'owner_submission',
      })
      .eq('id', venueId);

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/pricing`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Price update failed' };
  }
}

export interface AddMenuItemInput {
  venueId: string;
  name: string;
  category: 'starter' | 'main' | 'dessert' | 'cocktail' | 'wine' | 'beer' | 'spirits' | 'soft_drink' | 'activity_fee' | 'other';
  price: number;
}

export async function addMenuItemAction(
  input: AddMenuItemInput
): Promise<{ success: boolean; menuItemId?: string; error?: string }> {
  try {
    const { venueId, name, category, price } = input;

    if (!venueId) return { success: false, error: 'Venue ID is required' };
    if (!name || name.trim().length === 0) return { success: false, error: 'Item name is required' };
    if (typeof price !== 'number' || price <= 0) return { success: false, error: 'Valid price is required' };

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) {
      return { success: false, error: 'Unauthorized to modify pricing for this venue' };
    }

    const actorIdentifier = user.email || user.id;

    const { data: newItem, error } = await supabase
      .from('menu_items')
      .insert({
        venue_id: venueId,
        name: name.trim(),
        category,
        price,
        is_available: true,
        last_updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };

    // Audit log
    await supabase
      .from('price_audit_logs')
      .insert({
        menu_item_id: newItem.id,
        changed_by: actorIdentifier,
        action_type: 'create',
        previous_price: null,
        new_price: price,
        reason: 'New menu item added by partner',
      });

    // Update venue pricing timestamp
    await supabase
      .from('venues')
      .update({
        last_price_updated_at: new Date().toISOString(),
        last_price_source: 'owner_submission',
      })
      .eq('id', venueId);

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/pricing`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true, menuItemId: newItem.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add item' };
  }
}

export async function deleteMenuItemAction(
  venueId: string,
  menuItemId: string,
  reason: string = 'Item removed by partner'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { data: item } = await supabase
      .from('menu_items')
      .select('price')
      .eq('id', menuItemId)
      .eq('venue_id', venueId)
      .single();

    // Audit log before delete
    if (item) {
      await supabase
        .from('price_audit_logs')
        .insert({
          menu_item_id: menuItemId,
          changed_by: user.email || user.id,
          action_type: 'delete',
          previous_price: item.price,
          new_price: null,
          reason,
        });
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId)
      .eq('venue_id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/pricing`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

export interface UpdateChargesInput {
  venueId: string;
  vatPct?: number;
  serviceChargePct?: number;
  minimumSpend?: number;
  corkageFee?: number;
  entranceFee?: number;
  reservationFee?: number;
  weekendPricingNotes?: string;
}

export async function updateStructuredChargesAction(
  input: UpdateChargesInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { venueId } = input;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const payload: Record<string, any> = {};
    if (typeof input.vatPct === 'number') payload.vat_pct = Math.max(0, input.vatPct);
    if (typeof input.serviceChargePct === 'number') payload.service_charge_pct = Math.max(0, input.serviceChargePct);
    if (typeof input.minimumSpend === 'number') payload.minimum_spend = Math.max(0, input.minimumSpend);
    if (typeof input.corkageFee === 'number') payload.corkage_fee = Math.max(0, input.corkageFee);
    if (typeof input.entranceFee === 'number') payload.entrance_fee = Math.max(0, input.entranceFee);
    if (typeof input.reservationFee === 'number') payload.reservation_fee = Math.max(0, input.reservationFee);
    if (typeof input.weekendPricingNotes === 'string') payload.weekend_pricing_notes = input.weekendPricingNotes.trim();

    const { error } = await supabase
      .from('venues')
      .update(payload)
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/pricing`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update charges' };
  }
}

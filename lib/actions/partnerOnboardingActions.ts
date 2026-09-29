'use server';

import { createServerClient } from '@/lib/supabase-server';
import { checkVenueAuthorization } from '@/lib/queries/partner';
import { revalidatePath } from 'next/cache';

export interface SaveOnboardingStepInput {
  venueId: string;
  step: 1 | 2 | 3 | 4 | 5;
  data: Record<string, any>;
}

export async function saveOnboardingStepAction(
  input: SaveOnboardingStepInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { venueId, step, data } = input;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const updatePayload: Record<string, any> = {};

    if (step === 1) {
      // Step 1: Business Information & Operations
      if (data.name) updatePayload.name = data.name.trim();
      if (data.category) updatePayload.category = data.category;
      if (data.description !== undefined) updatePayload.description = data.description.trim();
      if (data.address) updatePayload.address = data.address.trim();
      if (data.contact_number !== undefined) updatePayload.contact_number = data.contact_number.trim();
      if (data.contact_email !== undefined) updatePayload.contact_email = data.contact_email.trim();
      if (data.instagram_handle !== undefined) updatePayload.instagram_handle = data.instagram_handle.trim();
      if (data.opening_hours) updatePayload.opening_hours = data.opening_hours;
      if (data.has_parking !== undefined) updatePayload.has_parking = Boolean(data.has_parking);
      if (data.dress_code) updatePayload.dress_code = data.dress_code;
      if (data.indoor_outdoor) updatePayload.indoor_outdoor = data.indoor_outdoor;
    } else if (step === 2) {
      // Step 2: Charges & Taxing
      if (typeof data.vat_pct === 'number') updatePayload.vat_pct = data.vat_pct;
      if (typeof data.service_charge_pct === 'number') updatePayload.service_charge_pct = data.service_charge_pct;
      if (typeof data.minimum_spend === 'number') updatePayload.minimum_spend = data.minimum_spend;
      if (typeof data.corkage_fee === 'number') updatePayload.corkage_fee = data.corkage_fee;
      if (typeof data.entrance_fee === 'number') updatePayload.entrance_fee = data.entrance_fee;
      if (typeof data.reservation_fee === 'number') updatePayload.reservation_fee = data.reservation_fee;
      if (data.weekend_pricing_notes !== undefined) updatePayload.weekend_pricing_notes = data.weekend_pricing_notes;
    } else if (step === 3) {
      // Step 3: Experience Fit & Suitability
      if (Array.isArray(data.vibe_tags)) updatePayload.vibe_tags = data.vibe_tags;
      if (Array.isArray(data.audience_tags)) updatePayload.audience_tags = data.audience_tags;
      if (Array.isArray(data.activity_tags)) updatePayload.activity_tags = data.activity_tags;
      if (data.group_suitability_min !== undefined) updatePayload.group_suitability_min = data.group_suitability_min ? parseInt(data.group_suitability_min, 10) : null;
      if (data.group_suitability_max !== undefined) updatePayload.group_suitability_max = data.group_suitability_max ? parseInt(data.group_suitability_max, 10) : null;
      if (data.date_suitability !== undefined) updatePayload.date_suitability = Boolean(data.date_suitability);
    } else if (step === 4) {
      // Step 4: Photos
      if (data.cover_url) updatePayload.cover_url = data.cover_url.trim();
      if (Array.isArray(data.gallery_urls)) updatePayload.gallery_urls = data.gallery_urls;
    }

    // Advance to onboarding state if currently claimed
    const { data: currentVenue } = await supabase
      .from('venues')
      .select('partner_state')
      .eq('id', venueId)
      .single();

    if (currentVenue?.partner_state === 'claimed') {
      updatePayload.partner_state = 'onboarding';
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase
        .from('venues')
        .update(updatePayload)
        .eq('id', venueId);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/onboarding`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save step' };
  }
}

export async function submitForVerificationAction(
  venueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('venues')
      .update({
        partner_state: 'verification_pending',
      })
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/onboarding`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Submission failed' };
  }
}

export async function uploadVenuePhotoAction(input: {
  venueId: string;
  url: string;
  photoType: 'cover' | 'interior' | 'food' | 'experience' | 'exterior';
  caption?: string;
}): Promise<{ success: boolean; photoId?: string; error?: string }> {
  try {
    const { venueId, url, photoType, caption } = input;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { data: photo, error } = await supabase
      .from('venue_photos')
      .insert({
        venue_id: venueId,
        url: url.trim(),
        photo_type: photoType,
        caption: caption?.trim() || null,
        status: 'uploaded', // Pending OyaPlan verification
        submitted_by: user.id,
      })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };

    // If cover photo, also set cover_url on venue
    if (photoType === 'cover') {
      await supabase
        .from('venues')
        .update({ cover_url: url.trim() })
        .eq('id', venueId);
    }

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/onboarding`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true, photoId: photo?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Photo upload failed' };
  }
}

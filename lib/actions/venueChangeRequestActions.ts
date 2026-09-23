'use server';

import { createServerClient } from '@/lib/supabase-server';
import { isAuthorizedAdmin } from '@/lib/admin/permissions';
import { ActivityRepository } from '@/lib/admin/repositories/activityRepository';
import { ChangeRequestCategory } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface SubmitChangeRequestInput {
  venueId: string;
  category: ChangeRequestCategory;
  details: string;
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
}

export async function submitChangeRequestAction(
  input: SubmitChangeRequestInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { venueId, category, details, submitterName, submitterEmail, submitterPhone } = input;

    if (!venueId) return { success: false, error: 'Venue ID is required' };
    if (!category) return { success: false, error: 'Category is required' };
    if (!details || details.trim().length < 5) return { success: false, error: 'Please provide helpful details about the correction' };

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('venue_change_requests')
      .insert({
        venue_id: venueId,
        category,
        details: details.trim(),
        submitter_id: user?.id || null,
        submitter_name: submitterName?.trim() || null,
        submitter_email: submitterEmail?.trim().toLowerCase() || user?.email || null,
        submitter_phone: submitterPhone?.trim() || null,
        status: 'pending',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/venue/${venueId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit correction' };
  }
}

export async function resolveChangeRequestAction(input: {
  requestId: string;
  decision: 'resolved' | 'dismissed';
  adminNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await isAuthorizedAdmin();
    if (!auth.authorized || !auth.email) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: req, error: fetchErr } = await supabase
      .from('venue_change_requests')
      .select('*, venues(name)')
      .eq('id', input.requestId)
      .single();

    if (fetchErr || !req) return { success: false, error: 'Record not found' };

    const { error } = await supabase
      .from('venue_change_requests')
      .update({
        status: input.decision,
        admin_notes: input.adminNotes || null,
        resolved_by: user?.id || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', input.requestId);

    if (error) return { success: false, error: error.message };

    await ActivityRepository.logActivity(
      auth.email,
      `ChangeRequest ${input.decision.toUpperCase()}`,
      'VenueChangeRequest',
      input.requestId,
      {
        venueId: req.venue_id,
        category: req.category,
        decision: input.decision,
      }
    );

    revalidatePath(`/venue/${req.venue_id}`);
    revalidatePath('/admin/venues');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Resolution failed' };
  }
}

'use server';

import { createServerClient } from '@/lib/supabase-server';
import { checkVenueAuthorization } from '@/lib/queries/partner';
import { revalidatePath } from 'next/cache';

export interface ReportClosureInput {
  venueId: string;
  startDate: string;
  endDate?: string;
  reason: string;
}

export async function reportTemporaryClosureAction(
  input: ReportClosureInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { venueId, startDate, endDate, reason } = input;
    if (!venueId || !startDate || !reason) {
      return { success: false, error: 'Start date and reason are required' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    const auth = await checkVenueAuthorization(venueId, user.id);
    if (!auth.authorized) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('venues')
      .update({
        is_temporarily_closed: true,
        temporary_closure_start: startDate,
        temporary_closure_end: endDate || null,
        temporary_closure_reason: reason.trim(),
      })
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/closure`);
    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/updates`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Closure report failed' };
  }
}

export async function reopenVenueAction(
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
        is_temporarily_closed: false,
        temporary_closure_start: null,
        temporary_closure_end: null,
        temporary_closure_reason: null,
      })
      .eq('id', venueId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/partner/${venueId}`);
    revalidatePath(`/partner/${venueId}/closure`);
    revalidatePath(`/business/${venueId}`);
    revalidatePath(`/business/${venueId}/updates`);
    revalidatePath(`/venue/${venueId}`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Reopen action failed' };
  }
}

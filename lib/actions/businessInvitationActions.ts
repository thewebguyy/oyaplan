'use server';

import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase-server';
import { isAuthorizedAdmin } from '@/lib/admin/permissions';
import { ActivityRepository } from '@/lib/admin/repositories/activityRepository';
import { ClaimantRole, InvitationPreview } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * generateVenueInvitationAction
 * Admin action to create a secure, expiring, single-use invitation token.
 * Stores ONLY the SHA-256 hash in the database.
 */
export async function generateVenueInvitationAction(
  venueId: string,
  claimantEmail?: string,
  claimantRole?: ClaimantRole
): Promise<{ 
  success: boolean; 
  rawToken?: string; 
  invitationUrl?: string; 
  expiresAt?: string; 
  error?: string 
}> {
  try {
    const auth = await isAuthorizedAdmin();
    if (!auth.authorized || !auth.email) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }

    if (!venueId) {
      return { success: false, error: 'Venue ID is required' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Check if venue already has an active operator
    const { data: existingRoles } = await supabase
      .from('venue_roles')
      .select('user_id')
      .eq('venue_id', venueId);

    if (existingRoles && existingRoles.length > 0) {
      return { 
        success: false, 
        error: 'This venue already has an active operator assigned. Revoke their role first if re-inviting.' 
      };
    }

    // 2. Revoke any previous unconsumed invitations for this venue
    await supabase
      .from('venue_claims')
      .update({ status: 'revoked' })
      .eq('venue_id', venueId)
      .in('status', ['invited', 'opened']);

    // 3. Cryptographically secure random token (32 bytes hex = 64 characters)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 4. Default 7-day TTL
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 5. Insert invitation record (user_id is NULL initially)
    const { data: claim, error: insertError } = await supabase
      .from('venue_claims')
      .insert({
        venue_id: venueId,
        user_id: null,
        status: 'invited',
        verification_method: 'manual',
        invitation_token_hash: tokenHash,
        token_expires_at: expiresAt,
        invitation_sent_at: new Date().toISOString(),
        claimant_email: claimantEmail?.trim().toLowerCase() || null,
        claimant_role: claimantRole || 'owner',
        created_by: user?.id || null,
      })
      .select('id, venue_id, venues(name)')
      .single();

    if (insertError || !claim) {
      return { success: false, error: insertError?.message || 'Failed to create invitation record' };
    }

    // 6. Log admin audit activity
    await ActivityRepository.logActivity(
      auth.email,
      'INVITATION_GENERATED',
      'VenueClaim',
      claim.id,
      {
        venueId,
        claimantEmail,
        expiresAt,
      }
    );

    revalidatePath('/admin/venues/claims');

    const invitationUrl = `/business/claim/${rawToken}`;
    return {
      success: true,
      rawToken,
      invitationUrl,
      expiresAt,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error generating invitation' };
  }
}

/**
 * revokeVenueInvitationAction
 * Admin action to revoke an active, unconsumed invitation token.
 */
export async function revokeVenueInvitationAction(
  claimId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await isAuthorizedAdmin();
    if (!auth.authorized || !auth.email) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }

    const supabase = await createServerClient();

    const { data: claim, error: fetchError } = await supabase
      .from('venue_claims')
      .select('id, venue_id, status')
      .eq('id', claimId)
      .single();

    if (fetchError || !claim) {
      return { success: false, error: 'Invitation record not found' };
    }

    if (!['invited', 'opened'].includes(claim.status)) {
      return { success: false, error: `Cannot revoke invitation in status '${claim.status}'` };
    }

    const { error: updateError } = await supabase
      .from('venue_claims')
      .update({ status: 'revoked' })
      .eq('id', claimId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await ActivityRepository.logActivity(
      auth.email,
      'INVITATION_REVOKED',
      'VenueClaim',
      claimId,
      { venueId: claim.venue_id }
    );

    revalidatePath('/admin/venues/claims');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to revoke invitation' };
  }
}

/**
 * getInvitationPreviewAction
 * Public/Unauthenticated query to inspect an invited listing.
 * Verifies hash & expiration, marks status as 'opened', and returns non-sensitive preview.
 */
export async function getInvitationPreviewAction(
  rawToken: string
): Promise<{ success: boolean; preview?: InvitationPreview; error?: string }> {
  try {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length !== 64) {
      return { success: false, error: 'Invalid invitation link format' };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    const supabase = await createServerClient();

    // 1. Fetch claim matching token hash
    const { data: claim, error: fetchError } = await supabase
      .from('venue_claims')
      .select(`
        id,
        venue_id,
        status,
        token_expires_at,
        claimant_email,
        claimant_role,
        consumed_at,
        venues (
          id,
          name,
          address,
          category,
          cover_url
        )
      `)
      .eq('invitation_token_hash', tokenHash)
      .maybeSingle();

    if (fetchError || !claim) {
      return { success: false, error: 'This invitation was not found or the link is invalid.' };
    }

    // 2. Check if already consumed
    if (claim.consumed_at || !['invited', 'opened', 'authenticated'].includes(claim.status)) {
      return { 
        success: false, 
        error: claim.status === 'revoked' 
          ? 'This invitation link has been revoked.' 
          : 'This invitation link has already been used.' 
      };
    }

    // 3. Check expiration
    if (claim.token_expires_at && new Date(claim.token_expires_at).getTime() < Date.now()) {
      // Mark expired in database
      await supabase
        .from('venue_claims')
        .update({ status: 'expired' })
        .eq('id', claim.id);

      return { success: false, error: 'This invitation link has expired. Please contact OyaPlan for a new link.' };
    }

    // 4. Mark opened if currently 'invited'
    if (claim.status === 'invited') {
      await supabase
        .from('venue_claims')
        .update({ 
          status: 'opened',
          invitation_opened_at: new Date().toISOString()
        })
        .eq('id', claim.id);
    }

    // 5. Count menu items
    const { count: menuItemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', claim.venue_id);

    const venue = claim.venues as any;
    const preview: InvitationPreview = {
      claimId: claim.id,
      venueId: claim.venue_id,
      venueName: venue?.name || 'Venue',
      venueAddress: venue?.address || '',
      venueCategory: venue?.category || 'restaurant',
      hasCover: Boolean(venue?.cover_url),
      menuItemCount: menuItemCount || 0,
      claimantEmail: claim.claimant_email,
      claimantRole: claim.claimant_role as ClaimantRole,
      status: claim.status === 'invited' ? 'opened' : claim.status,
      tokenExpiresAt: claim.token_expires_at || '',
    };

    return { success: true, preview };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error validating invitation' };
  }
}

/**
 * claimWithInvitationAction
 * Completes the invitation claim.
 * Requires an authenticated user session, transitions status to 'pending',
 * and invalidates the token by setting consumed_at = NOW().
 */
export async function claimWithInvitationAction(
  rawToken: string,
  claimantData: {
    claimantName: string;
    claimantRole: ClaimantRole;
    claimantPhone: string;
    claimantEmail: string;
    relationshipNotes?: string;
  }
): Promise<{ success: boolean; claimId?: string; venueId?: string; error?: string }> {
  try {
    if (!rawToken || rawToken.trim().length !== 64) {
      return { success: false, error: 'Invalid invitation token format' };
    }

    const { claimantName, claimantRole, claimantPhone, claimantEmail, relationshipNotes } = claimantData;
    if (!claimantName || claimantName.trim().length < 2) return { success: false, error: 'Full name is required' };
    if (!claimantPhone || claimantPhone.trim().length < 7) return { success: false, error: 'Valid phone number is required' };
    if (!claimantEmail || !claimantEmail.includes('@')) return { success: false, error: 'Valid email address is required' };

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Authenticated user session is mandatory
    if (!user) {
      return { 
        success: false, 
        error: 'Please sign in or verify your email to submit your claim so we can link your venue to your account.' 
      };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    // 1. Fetch and lock active claim record
    const { data: claim, error: fetchError } = await supabase
      .from('venue_claims')
      .select('id, venue_id, status, token_expires_at, consumed_at')
      .eq('invitation_token_hash', tokenHash)
      .single();

    if (fetchError || !claim) {
      return { success: false, error: 'Invitation not found or invalid' };
    }

    if (claim.consumed_at || !['invited', 'opened', 'authenticated'].includes(claim.status)) {
      return { success: false, error: 'This invitation has already been used or revoked' };
    }

    if (claim.token_expires_at && new Date(claim.token_expires_at).getTime() < Date.now()) {
      await supabase.from('venue_claims').update({ status: 'expired' }).eq('id', claim.id);
      return { success: false, error: 'This invitation link has expired' };
    }

    // 2. Consume token and transition claim to 'pending'
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('venue_claims')
      .update({
        user_id: user.id,
        status: 'pending',
        claimant_name: claimantName.trim(),
        claimant_role: claimantRole,
        claimant_phone: claimantPhone.trim(),
        claimant_email: claimantEmail.trim().toLowerCase(),
        relationship_notes: relationshipNotes?.trim() || null,
        consumed_at: nowIso,
        claimed_at: nowIso,
      })
      .eq('id', claim.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. Transition venue partner_state to claim_pending if currently unclaimed
    await supabase
      .from('venues')
      .update({ partner_state: 'claim_pending' })
      .eq('id', claim.venue_id)
      .eq('partner_state', 'unclaimed');

    revalidatePath(`/venue/${claim.venue_id}`);
    revalidatePath('/admin/venues/claims');

    return { 
      success: true, 
      claimId: claim.id, 
      venueId: claim.venue_id 
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Claim submission failed' };
  }
}

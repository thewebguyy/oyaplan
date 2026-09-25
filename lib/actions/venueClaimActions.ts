'use server';

import { createServerClient } from '@/lib/supabase-server';
import { isAuthorizedAdmin } from '@/lib/admin/permissions';
import { ActivityRepository } from '@/lib/admin/repositories/activityRepository';
import { ClaimantRole } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface SubmitClaimInput {
  venueId: string;
  claimantName: string;
  claimantRole: ClaimantRole;
  claimantPhone: string;
  claimantEmail: string;
  relationshipNotes?: string;
  verificationMethod?: 'business_document' | 'email_domain' | 'phone' | 'manual';
  documentUrl?: string;
}

export async function submitVenueClaimAction(
  input: SubmitClaimInput
): Promise<{ success: boolean; claimId?: string; error?: string }> {
  try {
    const { venueId, claimantName, claimantRole, claimantPhone, claimantEmail, relationshipNotes } = input;

    if (!venueId) return { success: false, error: 'Venue ID is required' };
    if (!claimantName || claimantName.trim().length < 2) return { success: false, error: 'Full name is required' };
    if (!claimantPhone || claimantPhone.trim().length < 7) return { success: false, error: 'Valid phone number is required' };
    if (!claimantEmail || !claimantEmail.includes('@')) return { success: false, error: 'Valid email address is required' };

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Enforce authentication or link to anonymous user if available
    const userId = user?.id;
    if (!userId) {
      return { 
        success: false, 
        error: 'Please sign in or enter your email to submit your claim so we can link your venue to your account.' 
      };
    }

    // Check if venue already has an approved partner
    const { data: existingRoles } = await supabase
      .from('venue_roles')
      .select('user_id')
      .eq('venue_id', venueId);

    if (existingRoles && existingRoles.length > 0) {
      return {
        success: false,
        error: 'This venue already has an active verified partner. If you believe this is in error, please report a change or contact OyaPlan support.'
      };
    }

    // Check if user already submitted a pending claim for this venue
    const { data: existingClaim } = await supabase
      .from('venue_claims')
      .select('id, status')
      .eq('venue_id', venueId)
      .eq('user_id', userId)
      .in('status', ['pending', 'needs_more_information'])
      .maybeSingle();

    if (existingClaim) {
      return {
        success: true,
        claimId: existingClaim.id,
        error: 'You already have a pending claim for this venue under review.'
      };
    }

    const { data: claim, error: insertError } = await supabase
      .from('venue_claims')
      .insert({
        venue_id: venueId,
        user_id: userId,
        verification_method: input.verificationMethod || 'manual',
        document_url: input.documentUrl || null,
        claimant_name: claimantName.trim(),
        claimant_role: claimantRole || 'owner',
        claimant_phone: claimantPhone.trim(),
        claimant_email: claimantEmail.trim().toLowerCase(),
        relationship_notes: relationshipNotes?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Set venue partner_state to claim_pending if currently unclaimed
    await supabase
      .from('venues')
      .update({ partner_state: 'claim_pending' })
      .eq('id', venueId)
      .eq('partner_state', 'unclaimed');

    revalidatePath(`/venue/${venueId}`);
    return { success: true, claimId: claim?.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit claim' };
  }
}

export interface ReviewClaimInput {
  claimId: string;
  decision: 'approved' | 'rejected' | 'needs_more_information';
  adminNotes?: string;
  rejectionReason?: string;
}

export async function reviewVenueClaimAction(
  input: ReviewClaimInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await isAuthorizedAdmin();
    if (!auth.authorized || !auth.email) {
      return { success: false, error: 'Unauthorized: Admin session required' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the claim
    const { data: claim, error: fetchError } = await supabase
      .from('venue_claims')
      .select('*, venues(id, name)')
      .eq('id', input.claimId)
      .single();

    if (fetchError || !claim) {
      return { success: false, error: 'Claim record not found' };
    }

    const updatePayload: Record<string, any> = {
      status: input.decision,
      admin_notes: input.adminNotes || null,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    };

    if (input.decision === 'rejected') {
      updatePayload.rejection_reason = input.rejectionReason || 'Verification requirements not met';
    } else if (input.decision === 'approved') {
      updatePayload.approved_at = new Date().toISOString();
    }

    const { error: claimUpdateError } = await supabase
      .from('venue_claims')
      .update(updatePayload)
      .eq('id', input.claimId);

    if (claimUpdateError) {
      return { success: false, error: claimUpdateError.message };
    }

    if (input.decision === 'approved') {
      // 1. Assign venue_roles
      const assignedRole = claim.claimant_role === 'manager' ? 'manager' : 'owner';
      await supabase
        .from('venue_roles')
        .upsert(
          {
            venue_id: claim.venue_id,
            user_id: claim.user_id,
            role: assignedRole,
          },
          { onConflict: 'venue_id,user_id' }
        );

      // 2. Transition venue state to claimed
      await supabase
        .from('venues')
        .update({
          partner_state: 'claimed',
          claimed_by: claim.user_id,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', claim.venue_id);

      // 3. Update user profile role to venue_operator if currently planner
      await supabase
        .from('profiles')
        .update({ role: 'venue_operator' })
        .eq('id', claim.user_id)
        .eq('role', 'planner');
    } else if (input.decision === 'rejected') {
      // If no other pending/approved claims, revert venue to unclaimed
      const { data: otherClaims } = await supabase
        .from('venue_claims')
        .select('id')
        .eq('venue_id', claim.venue_id)
        .in('status', ['pending', 'approved'])
        .neq('id', input.claimId);

      if (!otherClaims || otherClaims.length === 0) {
        await supabase
          .from('venues')
          .update({ partner_state: 'unclaimed' })
          .eq('id', claim.venue_id)
          .eq('partner_state', 'claim_pending');
      }
    }

    // Audit log
    await ActivityRepository.logActivity(
      auth.email,
      `Claim ${input.decision.toUpperCase()}`,
      'VenueClaim',
      input.claimId,
      {
        venueId: claim.venue_id,
        venueName: claim.venues?.name,
        claimantEmail: claim.claimant_email,
        decision: input.decision,
      }
    );

    revalidatePath(`/venue/${claim.venue_id}`);
    revalidatePath(`/partner/${claim.venue_id}`);
    revalidatePath('/admin/venues');
    revalidatePath('/admin/venues/claims');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Claim review failed' };
  }
}

export interface ClaimSearchVenueResult {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
}

/**
 * searchVenuesForClaimAction
 * Queries the venues table directly in real-time with fallback to spots
 */
export async function searchVenuesForClaimAction(
  query: string
): Promise<ClaimSearchVenueResult[]> {
  try {
    if (!query || !query.trim()) return [];
    const q = query.trim();
    const supabase = await createServerClient();

    // 1. Direct query to venues table
    const { data: venuesData } = await supabase
      .from('venues')
      .select('id, slug, name, category, address, partner_state, districts(name, slug)')
      .or(`name.ilike.%${q}%,address.ilike.%${q}%,category.ilike.%${q}%`)
      .order('name', { ascending: true })
      .limit(25);

    // 2. Fallback query to spots table
    const { data: spotsData } = await supabase
      .from('spots')
      .select('id, name, category, address, active, areas(name, slug)')
      .or(`name.ilike.%${q}%,address.ilike.%${q}%,category.ilike.%${q}%`)
      .eq('active', true)
      .limit(25);

    const seenNames = new Set<string>();
    const results: ClaimSearchVenueResult[] = [];

    if (venuesData) {
      for (const v of venuesData) {
        seenNames.add(v.name.toLowerCase().trim());
        results.push({
          id: v.id,
          slug: v.slug,
          name: v.name,
          category: v.category,
          address: v.address,
          partner_state: v.partner_state || 'unclaimed',
          district_name: (v as any).districts?.name || undefined,
        });
      }
    }

    if (spotsData) {
      for (const s of spotsData) {
        const normName = s.name.toLowerCase().trim();
        if (!seenNames.has(normName)) {
          seenNames.add(normName);
          results.push({
            id: s.id,
            slug: s.id,
            name: s.name,
            category: s.category,
            address: s.address,
            partner_state: 'unclaimed',
            district_name: (s as any).areas?.name || 'Lagos',
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error('Error in searchVenuesForClaimAction:', err);
    return [];
  }
}


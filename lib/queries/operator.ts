import { supabase } from "@/lib/supabase";
import { VenueClaimStatus } from "@/lib/types";

export interface VenueRole {
  venue_id: string;
  user_id: string;
  role: "owner" | "manager";
  venues?: {
    name: string;
    address: string;
  };
}

/**
 * getVenuesByOwner
 * Retrieves all venues where the logged-in user is a verified owner/manager.
 */
export async function getVenuesByOwner(userId: string): Promise<VenueRole[]> {
  const { data, error } = await supabase
    .from("venue_roles")
    .select("venue_id, user_id, role, venues:venue_id(name, address)")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data as any as VenueRole[];
}

/**
 * getVenueClaimsByUser
 * Checks pending claim inquiries for the user.
 */
export async function getVenueClaimsByUser(userId: string): Promise<
  Array<{
    id: string;
    venue_id: string;
    status: VenueClaimStatus;
    claimed_at: string;
    venues: { name: string };
  }>
> {
  const { data, error } = await supabase
    .from("venue_claims")
    .select("id, venue_id, status, claimed_at, venues:venue_id(name)")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data as any;
}

/**
 * submitVenueClaim
 * Submits a new claim request for ownership of a venue.
 */
export async function submitVenueClaim(
  userId: string,
  venueId: string,
  method: "business_document" | "email_domain" | "phone" | "manual",
  documentUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("venue_claims").insert({
    venue_id: venueId,
    user_id: userId,
    verification_method: method,
    document_url: documentUrl || null,
    status: "pending",
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * submitVenueEditRequest
 * Creates a pending edit record for approval rather than modifying public details directly.
 */
export async function submitVenueEditRequest(
  userId: string,
  venueId: string,
  fieldName: string,
  oldValue: any,
  newValue: any
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("venue_edit_requests").insert({
    venue_id: venueId,
    user_id: userId,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
    status: "pending",
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

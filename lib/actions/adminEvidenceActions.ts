"use server";

import { createServerClient } from "@/lib/supabase-server";
import { assertAdminSession } from "@/lib/admin/permissions";
import { ActivityRepository } from "@/lib/admin/repositories/activityRepository";
import { revalidatePath } from "next/cache";

const ALLOWED_SOURCES = new Set([
  "official_website",
  "menu_photo",
  "receipt",
  "scout_verified",
  "owner_confirmation",
  "social_media",
]);

export async function verifySpotAction(formData: FormData) {
  const admin = await assertAdminSession();

  const id = formData.get("id") as string;
  let price_source = (formData.get("price_source") as string)?.trim() || "official_website";
  if (!ALLOWED_SOURCES.has(price_source)) {
    price_source = "official_website";
  }

  const evidence_url = (formData.get("evidence_url") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const price_per_person = Number(formData.get("price_per_person")) || 0;

  if (!id) throw new Error("Venue ID is required for verification");
  if (price_per_person <= 0 || price_per_person > 50000000) {
    throw new Error("Price per person must be a positive amount under ₦50,000,000");
  }

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  // 1. Fetch current venue snapshot for full before/after audit fidelity
  const { data: currentVenue } = await supabase
    .from("venues")
    .select("name, derived_typical_cost, last_price_source, operational_status")
    .eq("id", id)
    .single();

  const beforeSnapshot = {
    price: currentVenue?.derived_typical_cost ?? null,
    source: currentVenue?.last_price_source ?? null,
    status: currentVenue?.operational_status ?? null,
  };

  // 2. Update venue record in public.venues base table
  const venueUpdates: Record<string, unknown> = {
    derived_typical_cost: price_per_person,
    operational_status: "verified",
    last_price_source: price_source,
    last_price_updated_at: now,
    updated_at: now,
  };

  const { error: venueError } = await supabase
    .from("venues")
    .update(venueUpdates)
    .eq("id", id);

  if (venueError) {
    console.error("Failed to verify venue in public.venues:", venueError);
    await supabase.from("spots").update({
      verified_by: "owner_verified",
      price_source,
      price_per_person,
      price_updated_at: now,
    }).eq("id", id);
  }

  // 3. Insert audit record in public.price_evidence
  await supabase.from("price_evidence").insert({
    venue_id: id,
    source_type: price_source,
    submitted_by: admin.email,
    recorded_price: price_per_person,
    evidence_url: evidence_url,
    notes: notes,
    verification_status: "approved",
    confidence_weight: 0.90,
  });

  // 4. Log full reconstructable audit event
  await ActivityRepository.logActivity(
    admin.email,
    "Verified Venue Price Evidence",
    "Venue",
    id,
    {
      venue_name: currentVenue?.name || "Venue",
      field: "derived_typical_cost",
      before: beforeSnapshot,
      after: {
        price: price_per_person,
        source: price_source,
        status: "verified",
      },
      evidence_url,
      source_type: price_source,
      notes: notes || "Verified in Trust Operations Cockpit",
      timestamp: now,
    }
  );

  revalidatePath(`/admin/venues/${id}`);
  revalidatePath("/admin/venues");
  revalidatePath("/admin/quality");
}

export async function quickVerifySpotAction(formData: FormData) {
  const admin = await assertAdminSession();
  const id = formData.get("id") as string;

  if (!id) return;

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("venues")
    .update({
      operational_status: "verified",
      last_price_updated_at: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to quick verify venue in public.venues:", error);
    await supabase.from("spots").update({
      verified_by: "owner_verified",
      price_updated_at: now,
    }).eq("id", id);
  }

  await ActivityRepository.logActivity(
    admin.email,
    "Quick Verified Spot",
    "Spot",
    id,
    { verified_by: "owner_verified" }
  );

  revalidatePath("/admin/quality");
  revalidatePath("/admin/venues");
}

export async function quickSetCoverImageAction(formData: FormData) {
  const admin = await assertAdminSession();
  const venueId = formData.get("venue_id") as string;
  const coverUrl = (formData.get("cover_url") as string)?.trim();

  if (!venueId || !coverUrl) return;

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  const { error: venueError } = await supabase
    .from("venues")
    .update({
      cover_url: coverUrl,
      updated_at: now,
    })
    .eq("id", venueId);

  if (venueError) {
    console.error("Failed to update cover image in public.venues:", venueError);
    await supabase.from("spots").update({
      cover_url: coverUrl,
    }).eq("id", venueId);
  }

  await ActivityRepository.logActivity(
    admin.email,
    "Set Venue Hero Photo",
    "Venue",
    venueId,
    { cover_url: coverUrl }
  );

  revalidatePath("/admin/quality");
  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${venueId}`);
}

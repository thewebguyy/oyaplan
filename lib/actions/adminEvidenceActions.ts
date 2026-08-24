"use server";

import { createServerClient } from "@/lib/supabase-server";
import { assertAdminSession } from "@/lib/admin/permissions";
import { ActivityRepository } from "@/lib/admin/repositories/activityRepository";
import { revalidatePath } from "next/cache";

export async function verifySpotAction(formData: FormData) {
  const admin = await assertAdminSession();

  const id = formData.get("id") as string;
  const verified_by = (formData.get("verified_by") as string) || "owner_verified";
  const price_source = (formData.get("price_source") as string) || "official_website";
  const evidence_url = formData.get("evidence_url") as string;
  const price_per_person = Number(formData.get("price_per_person")) || 0;

  if (!id) return;

  const supabase = await createServerClient();
  const now = new Date().toISOString();

  // 1. Update spot record
  const spotUpdates: Record<string, unknown> = {
    verified_by,
    price_source,
    price_updated_at: now,
  };
  if (price_per_person > 0) {
    spotUpdates.price_per_person = price_per_person;
  }

  const { error: spotError } = await supabase
    .from("spots")
    .update(spotUpdates)
    .eq("id", id);

  if (spotError) {
    console.error("Failed to verify spot price:", spotError);
    return;
  }

  // 2. Insert audit record in price_evidence
  await supabase.from("price_evidence").insert({
    venue_id: id,
    source_type: price_source,
    submitted_by: admin.email,
    recorded_price: price_per_person,
    evidence_url: evidence_url || null,
    verification_status: "approved",
    confidence_weight: 0.85,
  });

  // 3. Log activity
  await ActivityRepository.logActivity(
    admin.email,
    "Verified Spot Price Evidence",
    "Spot",
    id,
    { verified_by, price_source, price_per_person, evidence_url }
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
    .from("spots")
    .update({
      verified_by: "owner_verified",
      price_updated_at: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to quick verify spot:", error);
    return;
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

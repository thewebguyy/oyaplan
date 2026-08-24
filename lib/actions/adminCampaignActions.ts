"use server";

import { CampaignService } from "@/lib/admin/services/campaignService";
import { assertAdminSession } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function createCampaignAction(formData: FormData) {
  const admin = await assertAdminSession();

  const venue_id = formData.get("venueId") as string;
  const tier = formData.get("tier") as "basic" | "featured" | "premium";
  const placement = formData.get("placement") as "homepage" | "explore" | "search" | "category";
  const endDate = formData.get("endDate") as string;

  if (!venue_id || !tier || !endDate) return;

  await CampaignService.createCampaign(
    {
      venue_id,
      tier,
      placement,
      start_date: new Date().toISOString().split("T")[0],
      end_date: endDate,
      status: "active",
    },
    admin.email
  );

  revalidatePath("/admin/sponsored");
}

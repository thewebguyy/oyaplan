"use server";

import { MediaService } from "@/lib/admin/services/mediaService";
import { assertAdminSession } from "@/lib/admin/permissions";
import { revalidatePath } from "next/cache";

export async function assignMediaAction(formData: FormData) {
  const admin = await assertAdminSession();

  const venueId = formData.get("venueId") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!venueId || !imageUrl) return;

  await MediaService.assignImageToVenue(venueId, imageUrl, true, admin.email);

  revalidatePath("/admin/media");
  revalidatePath("/admin/venues");
}

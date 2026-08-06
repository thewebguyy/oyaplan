"use server";

import { MediaService } from "@/lib/admin/services/mediaService";
import { revalidatePath } from "next/cache";

export async function assignMediaAction(formData: FormData) {
  const venueId = formData.get("venueId") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!venueId || !imageUrl) return;

  await MediaService.assignImageToVenue(venueId, imageUrl, true);

  revalidatePath("/admin/media");
  revalidatePath("/admin/venues");
}

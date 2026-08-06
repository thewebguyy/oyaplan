"use server";

import { VenueService } from "@/lib/admin/services/venueService";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateVenueAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const updates = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    category: formData.get("category") as string,
    status: formData.get("status") as "published" | "draft",
    description: formData.get("description") as string,
    price_level: formData.get("price_level") as string,
    price_per_person: Number(formData.get("price_per_person")) || 0,
    address: formData.get("address") as string,
    image_url: formData.get("image_url") as string,
  };

  await VenueService.updateVenue(id, updates);

  revalidatePath(`/admin/venues/${id}`);
  revalidatePath("/admin/venues");
  redirect("/admin/venues");
}

import { createServerClient } from "@/lib/supabase-server";
import { MediaItem } from "../types";
import { ActivityRepository } from "./activityRepository";

export class MediaRepository {
  static async getMediaItems(): Promise<MediaItem[]> {
    const supabase = await createServerClient();
    const { data } = await supabase.from("spots").select("id, name, image_url, gallery_urls").not("image_url", "is", null);

    const items: MediaItem[] = [];
    (data || []).forEach((spot: any) => {
      if (spot.image_url) {
        items.push({
          id: `${spot.id}-hero`,
          url: spot.image_url,
          venue_id: spot.id,
          venue_name: spot.name,
          filename: spot.image_url.split("/").pop() || "hero.jpg",
          created_at: new Date().toISOString(),
          is_hero: true,
        });
      }
    });

    return items;
  }

  static async assignImageToVenue(venueId: string, imageUrl: string, isHero = true, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const updates = isHero ? { image_url: imageUrl } : {};

    const { error } = await supabase.from("spots").update(updates).eq("id", venueId);

    if (error) {
      console.error("Failed to assign image to venue:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Assigned Venue Image", "Media", venueId, { imageUrl, isHero });
    return true;
  }
}

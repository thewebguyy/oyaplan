import { createServerClient } from "@/lib/supabase-server";
import { MediaItem } from "../types";
import { ActivityRepository } from "./activityRepository";

export class MediaRepository {
  static async getMediaItems(): Promise<MediaItem[]> {
    const supabase = await createServerClient();
    const { data } = await supabase.from("spots").select("id, name, cover_url").not("cover_url", "is", null);

    interface MediaSpotDbRow {
      id: string;
      name: string;
      cover_url?: string | null;
    }

    const items: MediaItem[] = [];
    ((data as unknown as MediaSpotDbRow[]) || []).forEach((spot) => {
      if (spot.cover_url) {
        items.push({
          id: `${spot.id}-hero`,
          url: spot.cover_url,
          venue_id: spot.id,
          venue_name: spot.name,
          filename: spot.cover_url.split("/").pop() || "hero.jpg",
          created_at: new Date().toISOString(),
          is_hero: true,
        });
      }
    });

    return items;
  }

  static async assignImageToVenue(venueId: string, imageUrl: string, isHero = true, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const updates = isHero ? { cover_url: imageUrl } : {};

    const { error } = await supabase.from("spots").update(updates).eq("id", venueId);

    if (error) {
      console.error("Failed to assign image to venue:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Assigned Venue Image", "Media", venueId, { imageUrl, isHero });
    return true;
  }
}

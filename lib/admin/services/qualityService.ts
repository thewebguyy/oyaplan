import { createServerClient } from "@/lib/supabase-server";
import { QualityCheckItem } from "../types";

export class QualityService {
  static async getChecklist(): Promise<QualityCheckItem[]> {
    const supabase = await createServerClient();
    const { data: spots } = await supabase.from("spots").select("id, name, image_url, gallery_urls, min_price, category, opening_hours, latitude, area_id, areas:area_id(name)");

    const items: QualityCheckItem[] = [];

    (spots || []).forEach((spot: any) => {
      const areaName = spot.areas?.name || "Lagos";

      if (!spot.image_url || spot.image_url.trim() === "") {
        items.push({
          id: `${spot.id}-no-hero`,
          issue_type: "Missing Hero",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          severity: "high",
        });
      }

      if (!spot.min_price || spot.min_price === 0) {
        items.push({
          id: `${spot.id}-no-price`,
          issue_type: "Missing Pricing",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          severity: "high",
        });
      }

      if (!spot.category || spot.category.trim() === "") {
        items.push({
          id: `${spot.id}-no-cat`,
          issue_type: "Missing Category",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          severity: "medium",
        });
      }

      if (!spot.latitude) {
        items.push({
          id: `${spot.id}-no-coords`,
          issue_type: "Missing Coordinates",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          severity: "low",
        });
      }
    });

    return items;
  }
}

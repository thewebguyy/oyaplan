import { createServerClient } from "@/lib/supabase-server";
import { QualityCheckItem } from "../types";

export class QualityService {
  static async getChecklist(): Promise<QualityCheckItem[]> {
    const supabase = await createServerClient();
    const { data: spots, error } = await supabase
      .from("spots")
      .select("id, name, cover_url, logo_url, price_per_person, category, opening_hours, area_id, areas(name)");

    if (error) {
      console.error("Failed to fetch spots for QualityService:", error);
      return [];
    }

    const items: QualityCheckItem[] = [];

    (spots || []).forEach((spot: any) => {
      const areaName = spot.areas?.name || "Lagos";

      if (!spot.cover_url || spot.cover_url.trim() === "") {
        items.push({
          id: `${spot.id}-no-hero`,
          issue_type: "Missing Hero",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          severity: "high",
        });
      }

      if (!spot.price_per_person || spot.price_per_person === 0) {
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
    });

    return items;
  }
}

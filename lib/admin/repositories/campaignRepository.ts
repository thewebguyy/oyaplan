import { createServerClient } from "@/lib/supabase-server";
import { SponsoredCampaign } from "../types";
import { ActivityRepository } from "./activityRepository";

export class CampaignRepository {
  static async getCampaigns(): Promise<SponsoredCampaign[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("sponsored_campaigns")
      .select("*, spots:venue_id(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch campaigns:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      venue_id: row.venue_id,
      venue_name: row.spots?.name || "Venue",
      tier: row.tier,
      placement: row.placement || "explore",
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      created_at: row.created_at,
    }));
  }

  static async createCampaign(
    campaign: Omit<SponsoredCampaign, "id" | "created_at">,
    actorEmail = "admin"
  ): Promise<boolean> {
    const supabase = await createServerClient();
    const { error } = await supabase.from("sponsored_campaigns").insert(campaign);

    if (error) {
      console.error("Failed to create campaign:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Created Campaign", "SponsoredCampaign", campaign.venue_id, campaign as Record<string, unknown>);
    return true;
  }
}

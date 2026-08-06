import { createServerClient } from "@/lib/supabase-server";
import { DashboardMetrics } from "../types";

export class DashboardService {
  static async getMetrics(): Promise<DashboardMetrics> {
    const supabase = await createServerClient();

    const [
      { count: totalVenues },
      { count: publishedVenues },
      { count: draftVenues },
      { count: betaUsersCount },
      { count: pendingBetaApprovalsCount },
      { count: venuesMissingImagesCount },
      { count: venuesMissingPricesCount },
      { count: pendingSubmissionsCount },
    ] = await Promise.all([
      supabase.from("spots").select("id", { count: "exact", head: true }),
      supabase.from("spots").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("spots").select("id", { count: "exact", head: true }).eq("active", false),
      supabase.from("profiles").select("id", { count: "exact", head: true }).not("profile_badge", "is", null),
      supabase.from("approved_beta_users").select("email", { count: "exact", head: true }).is("accepted_at", null),
      supabase.from("spots").select("id", { count: "exact", head: true }).or("cover_url.is.null,cover_url.eq.''"),
      supabase.from("spots").select("id", { count: "exact", head: true }).or("price_per_person.is.null,price_per_person.eq.0"),
      supabase.from("spot_submissions_raw").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    return {
      totalVenues: totalVenues || 0,
      publishedVenues: publishedVenues || 0,
      draftVenues: draftVenues || 0,
      betaUsersCount: betaUsersCount || 0,
      pendingBetaApprovalsCount: pendingBetaApprovalsCount || 0,
      venuesMissingImagesCount: venuesMissingImagesCount || 0,
      venuesMissingPricesCount: venuesMissingPricesCount || 0,
      pendingSubmissionsCount: pendingSubmissionsCount || 0,
    };
  }
}

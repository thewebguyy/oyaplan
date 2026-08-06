import { createServerClient } from "@/lib/supabase-server";
import { SpotSubmission } from "../types";
import { ActivityRepository } from "./activityRepository";

export class SubmissionRepository {
  static async getSubmissions(): Promise<SpotSubmission[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("spot_submissions_raw")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch spot submissions:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      spot_name: row.spot_name || "Submitted Spot",
      area: row.area || "Lagos",
      category: row.category || "Restaurant",
      estimated_price: row.estimated_price || "N/A",
      notes: row.notes || row.tweet_text || "",
      submitted_by: row.submitted_by || "Anonymous Scout",
      status: row.status || "pending",
      created_at: row.created_at,
    }));
  }

  static async moderateSubmission(id: string, status: "approved" | "rejected", actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const { error } = await supabase.from("spot_submissions_raw").update({ status }).eq("id", id);

    if (error) {
      console.error("Failed to moderate submission:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, `Moderated Submission: ${status}`, "SpotSubmission", id, { status });
    return true;
  }
}

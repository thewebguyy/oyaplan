import { createServerClient } from "@/lib/supabase-server";
import { ApprovedBetaUser } from "../types";
import { ActivityRepository } from "./activityRepository";

export class BetaRepository {
  static async getApprovedBetaUsers(search?: string): Promise<ApprovedBetaUser[]> {
    const supabase = await createServerClient();
    let query = supabase.from("approved_beta_users").select("*");

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data, error } = await query.order("approved_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch approved beta users:", error);
      return [];
    }

    return (data || []).map((row: any) => {
      let status: "Pending" | "Accepted" | "Not Registered" = "Pending";
      if (row.accepted_at) {
        status = "Accepted";
      } else if (row.invited_at) {
        status = "Pending";
      } else {
        status = "Not Registered";
      }

      return {
        email: row.email,
        approved_at: row.approved_at,
        approved_by: row.approved_by || "admin",
        invited_at: row.invited_at,
        accepted_at: row.accepted_at,
        notes: row.notes,
        status,
      };
    });
  }

  static async approveEmail(email: string, notes?: string, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("approved_beta_users").upsert({
      email: cleanEmail,
      approved_by: actorEmail,
      notes: notes || "Approved via Admin Control Center",
      approved_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to approve beta email:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Approved Beta Email", "BetaUser", cleanEmail, { notes });
    return true;
  }

  static async removeEmail(email: string, actorEmail = "admin"): Promise<boolean> {
    const supabase = await createServerClient();
    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("approved_beta_users").delete().eq("email", cleanEmail);

    if (error) {
      console.error("Failed to remove beta email:", error);
      return false;
    }

    await ActivityRepository.logActivity(actorEmail, "Removed Beta Email", "BetaUser", cleanEmail);
    return true;
  }
}

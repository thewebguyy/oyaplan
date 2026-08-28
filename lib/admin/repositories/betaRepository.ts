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

    const { data: betaRows, error } = await query.order("approved_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch approved beta users:", error);
      return [];
    }

    // Fetch profiles to correlate registration and badge status
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, profile_badge, created_at");

    const profileMap = new Map<string, { id: string; profile_badge?: string | null; created_at?: string }>();
    (profiles || []).forEach((p) => {
      if (p.email) {
        profileMap.set(p.email.toLowerCase(), p);
      }
    });

    interface BetaRow {
      email: string;
      approved_at: string;
      approved_by?: string | null;
      invited_at?: string | null;
      accepted_at?: string | null;
      notes?: string | null;
    }

    return ((betaRows as unknown as BetaRow[]) || []).map((row) => {
      const cleanEmail = row.email.toLowerCase();
      const profile = profileMap.get(cleanEmail);
      const hasBadge = profile?.profile_badge === "founding_beta";

      let status: "Active" | "Accepted" | "Registered" | "Invited" = "Invited";

      if (hasBadge) {
        status = "Active";
      } else if (row.accepted_at) {
        status = "Accepted";
      } else if (profile) {
        status = "Registered";
      } else {
        status = "Invited";
      }

      return {
        email: row.email,
        approved_at: row.approved_at,
        approved_by: row.approved_by || "admin",
        invited_at: row.invited_at || undefined,
        accepted_at: row.accepted_at || undefined,
        registered_at: profile?.created_at || undefined,
        notes: row.notes || undefined,
        status,
        has_badge: hasBadge,
        user_id: profile?.id || undefined,
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

  static async approveBulkEmails(emails: string[], notes?: string, actorEmail = "admin"): Promise<{ approvedCount: number }> {
    const supabase = await createServerClient();
    
    const cleanEmails = emails
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 3 && e.includes("@"));

    if (cleanEmails.length === 0) return { approvedCount: 0 };

    const records = cleanEmails.map(email => ({
      email,
      approved_by: actorEmail,
      notes: notes || "Bulk Import from Google Sheets",
      approved_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("approved_beta_users").upsert(records, { onConflict: "email" });

    if (error) {
      console.error("Failed to bulk approve beta emails:", error);
      return { approvedCount: 0 };
    }

    await ActivityRepository.logActivity(actorEmail, `Bulk Approved ${cleanEmails.length} Beta Emails`, "BetaUser", undefined, { count: cleanEmails.length, notes });
    return { approvedCount: cleanEmails.length };
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

import { createServerClient } from "@/lib/supabase-server";
import { AdminActivityItem } from "../types";

export class ActivityRepository {
  static async logActivity(
    actorEmail: string,
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const supabase = await createServerClient();
      await supabase.from("admin_activity").insert({
        actor_email: actorEmail,
        action,
        target_type: targetType,
        target_id: targetId || null,
        details: details || {},
      });
    } catch (e) {
      console.error("Failed to log admin activity:", e);
    }
  }

  static async getRecentActivity(limit = 20): Promise<AdminActivityItem[]> {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("admin_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data || []) as AdminActivityItem[];
    } catch (e) {
      console.error("Failed to fetch admin activity:", e);
      return [];
    }
  }
}

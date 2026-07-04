"use server";

import { supabase } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { aggregateVenuePricing } from "@/lib/services/normalizationLayer";

export async function moderateEvidenceAction(
  evidenceId: string,
  action: "approve" | "reject_duplicate" | "reject_malicious" | "reject_poor_quality" | "reject"
): Promise<{ success: boolean; error?: string }> {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized admin access." };
  }

  try {
    // 1. Fetch details of the evidence submission
    const { data: evidence, error: fetchErr } = await supabase
      .from("price_evidence")
      .select("*, menu_items(*)")
      .eq("id", evidenceId)
      .single();

    if (fetchErr || !evidence) {
      return { success: false, error: `Failed to locate evidence: ${fetchErr?.message || "Not found"}` };
    }

    const targetStatus = action === "approve" ? "approved" : "rejected";

    // 2. Update price_evidence status
    const { error: updateEvErr } = await supabase
      .from("price_evidence")
      .update({ verification_status: targetStatus })
      .eq("id", evidenceId);

    if (updateEvErr) {
      return { success: false, error: `Failed to update status: ${updateEvErr.message}` };
    }

    // 3. If approved, update active price on the menu item
    if (action === "approve" && evidence.menu_item_id) {
      const { error: updateItemErr } = await supabase
        .from("menu_items")
        .update({
          price: evidence.recorded_price,
          last_updated_at: new Date().toISOString()
        })
        .eq("id", evidence.menu_item_id);

      if (updateItemErr) {
        console.error("Failed to update active menu item price:", updateItemErr.message);
      }

      // Log in price_audit_logs
      await supabase.from("price_audit_logs").insert({
        menu_item_id: evidence.menu_item_id,
        changed_by: "admin_moderator",
        action_type: "update",
        previous_price: evidence.menu_items?.price || null,
        new_price: evidence.recorded_price,
        evidence_id: evidence.id,
        reason: "Admin approved pending evidence submission"
      });
    }

    // Phase 5: Reward Scout XP proportional to quality upon moderation resolution
    if (evidence.scout_id) {
      let xpAward = 0;

      // 1. Calculate XP based on action quality
      if (action === "approve") xpAward = 20; // Base price update
      else if (action === "reject_duplicate") xpAward = 5;
      else if (action === "reject_malicious") xpAward = -50;
      else xpAward = 0; // standard reject

      // 2. Check if this evidence fulfills a Scout Mission (Phase 5 priority engine)
      const { data: mission } = await supabase
        .from("scout_missions")
        .select("id, base_reward_xp")
        .eq("evidence_id", evidence.id)
        .single();

      if (mission) {
        if (action === "approve") {
          xpAward = mission.base_reward_xp; // Override with mission difficulty reward
          // Mark mission complete
          await supabase.from("scout_missions").update({ status: "completed" }).eq("id", mission.id);
        } else {
          // Re-open mission if rejected
          await supabase.from("scout_missions").update({ status: "open", evidence_id: null, claimed_by: null }).eq("id", mission.id);
        }
      }

      // 3. Apply XP to Scout Profile if non-zero
      if (xpAward !== 0) {
        const { data: profile } = await supabase
          .from("scout_profiles")
          .select("total_score")
          .eq("user_id", evidence.scout_id)
          .single();

        if (profile) {
          const newScore = Math.max(0, profile.total_score + xpAward);
          await supabase
            .from("scout_profiles")
            .update({ 
              total_score: newScore
            })
            .eq("user_id", evidence.scout_id);
        }
      }
    }

    // 4. Recalculate stats for the venue (database triggers will run too, redundant is safe)
    await aggregateVenuePricing(evidence.venue_id);

    // Revalidate paths to refresh page data
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Moderation exception occurred.";
    return { success: false, error: msg };
  }
}

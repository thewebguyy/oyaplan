"use server";

import { supabase } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { aggregateVenuePricing } from "@/lib/services/normalizationLayer";

export async function moderateEvidenceAction(
  evidenceId: string,
  action: "approve" | "reject"
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

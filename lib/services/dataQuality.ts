import { supabase } from "@/lib/supabase";

export interface DataQualityReport {
  isAcceptable: boolean;
  confidenceWeight: number; // 0.0 to 1.0
  reasons: string[];
}

/**
 * detectConflict
 * Checks if a proposed new price deviates by more than 35% from the current running median.
 * Devation limit acts as a guard against typing errors or malicious submissions.
 */
export async function detectConflict(
  venueId: string,
  menuItemName: string,
  newPrice: number
): Promise<{ hasConflict: boolean; message?: string }> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("price")
    .eq("venue_id", venueId)
    .eq("name", menuItemName)
    .maybeSingle();

  if (error || !data) {
    return { hasConflict: false };
  }

  const currentPrice = data.price;
  const deviation = Math.abs((newPrice - currentPrice) / currentPrice) * 100;

  if (deviation > 35) {
    return {
      hasConflict: true,
      message: `Proposed price ₦${newPrice.toLocaleString()} deviates by ${Math.round(
        deviation
      )}% from current recorded price ₦${currentPrice.toLocaleString()}.`,
    };
  }

  return { hasConflict: false };
}

/**
 * isSpam
 * Rate limits verification submissions per user session/account to prevent flooding.
 * Maximum of 10 submissions within a 5-minute window.
 */
export async function isSpam(userId: string): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  // Query price_evidence for recent inserts by this submitter
  const { count, error } = await supabase
    .from("price_evidence")
    .select("id", { count: "exact", head: true })
    .eq("submitted_by", userId)
    .gte("created_at", fiveMinutesAgo);

  if (error) return false;

  return (count || 0) >= 10;
}

/**
 * scoreSubmission
 * Evaluates a price evidence submission, assigning weight and deciding whether
 * to auto-approve or route to the moderation queue.
 */
export async function scoreSubmission(
  userId: string,
  venueId: string,
  menuItemName: string,
  newPrice: number,
  sourceType: string
): Promise<DataQualityReport> {
  const reasons: string[] = [];
  let isAcceptable = true;
  let confidenceWeight = 0.5;

  // 1. Check spam/flooding
  const spamTriggered = await isSpam(userId);
  if (spamTriggered) {
    isAcceptable = false;
    reasons.push("Spam prevention triggered: too many submissions recently.");
    return { isAcceptable, confidenceWeight: 0, reasons };
  }

  // 2. Check conflict/deviation
  const conflict = await detectConflict(venueId, menuItemName, newPrice);
  if (conflict.hasConflict) {
    confidenceWeight = 0.2; // Heavily penalize confidence weight
    reasons.push(conflict.message || "Price deviates too far from existing records.");
  } else {
    reasons.push("Price conforms to historical bounds.");
  }

  // 3. Weight by source type
  if (sourceType === "receipt_upload") {
    confidenceWeight += 0.2;
    reasons.push("+20% confidence: Verified receipt scan");
  } else if (sourceType === "owner_submission") {
    confidenceWeight += 0.4;
    reasons.push("+40% confidence: Official owner submission");
  } else if (sourceType === "official_website") {
    confidenceWeight += 0.1;
    reasons.push("+10% confidence: Reference to official menu link");
  }

  // 4. Adjust based on scout profile level if authenticated
  const { data: scout } = await supabase
    .from("scout_profiles")
    .select("trust_tier")
    .eq("user_id", userId)
    .maybeSingle();

  if (scout) {
    if (scout.trust_tier === "elite") {
      confidenceWeight += 0.2;
      reasons.push("+20% confidence: Submitted by Elite Scout");
    } else if (scout.trust_tier === "verified") {
      confidenceWeight += 0.1;
      reasons.push("+10% confidence: Submitted by Verified Scout");
    }
  }

  // Clamp weight between 0.1 and 1.0
  confidenceWeight = Math.min(Math.max(confidenceWeight, 0.1), 1.0);

  return {
    isAcceptable,
    confidenceWeight: Number(confidenceWeight.toFixed(2)),
    reasons,
  };
}

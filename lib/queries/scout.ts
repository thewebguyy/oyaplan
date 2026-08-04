import { supabase, supabaseBrowser } from "@/lib/supabase";

export interface ScoutProfile {
  user_id: string;
  username: string;
  trust_tier: "novice" | "verified" | "elite";
  total_score: number;
  accuracy_rate: number;
  accepted_submissions: number;
  rejected_submissions: number;
  venues_covered: number;
  badges: string[];
  last_activity: string;
}

/**
 * getScoutProfile
 * Retrieves the scout details for a logged-in user.
 */
export async function getScoutProfile(userId: string): Promise<ScoutProfile | null> {
  const { data, error } = await supabase
    .from("scout_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ScoutProfile;
}

/**
 * createScoutProfile
 * Registers an authenticated user as a scout.
 */
export async function createScoutProfile(userId: string, username: string): Promise<{ success: boolean; error?: string }> {
  // Use cookie-backed browser client so auth session JWT is attached to RLS policy check (auth.uid() = user_id)
  const client = typeof window !== "undefined" ? supabaseBrowser : supabase;

  const { error } = await client.from("scout_profiles").insert({
    user_id: userId,
    username: username,
    trust_tier: "novice",
    total_score: 0,
    accuracy_rate: 100.00,
    accepted_submissions: 0,
    rejected_submissions: 0,
    venues_covered: 0,
    badges: [],
  });

  if (error) {
    console.error("[ScoutProfile] Insert error:", error);

    // Standardized user-friendly error mapping (never leak raw DB error strings)
    if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
      return { success: false, error: "That scout username is already taken. Please choose another." };
    }
    if (error.message?.includes("row-level security") || error.message?.includes("JWT") || error.code === "42501") {
      return { success: false, error: "Please sign in first to join Scouts." };
    }

    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

/**
 * getScoutLeaderboard
 * Lists top scouts in the community.
 */
export async function getScoutLeaderboard(limit: number = 10): Promise<ScoutProfile[]> {
  const { data, error } = await supabase
    .from("scout_profiles")
    .select("*")
    .order("total_score", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as ScoutProfile[];
}

/**
 * getPendingVerificationTasks
 * Returns pricing queue assignments waiting for verification context.
 */
export async function getPendingVerificationTasks(): Promise<
  Array<{
    id: string;
    venue_id: string;
    venue_name: string;
    image_url: string;
    ocr_status: string;
    created_at: string;
  }>
> {
  // Query queue elements needing user attention
  const { data, error } = await supabase
    .from("menu_digitization_queue")
    .select("id, venue_id, image_url, ocr_status, created_at, venues:venue_id(name)")
    .eq("ocr_status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  interface QueueItem {
    id: string;
    venue_id: string;
    image_url: string;
    ocr_status: string;
    created_at: string;
    venues?: { name?: string } | null;
  }

  return (data as unknown as QueueItem[]).map((item: QueueItem) => ({
    id: item.id,
    venue_id: item.venue_id,
    venue_name: item.venues?.name || "Unknown Venue",
    image_url: item.image_url,
    ocr_status: item.ocr_status,
    created_at: item.created_at,
  }));
}

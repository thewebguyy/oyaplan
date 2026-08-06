"use server";

import { SessionResolver } from "@/lib/services/identity/sessionResolver";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function completeBetaOnboarding() {
  const identity = await SessionResolver.resolveIdentity();
  
  if (identity.type !== "authenticated" || !identity.profile) {
    return { success: false, error: "Not authenticated" };
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {}
    }
  });

  const { error } = await supabase
    .from("profiles")
    .update({ beta_onboarding_complete: true })
    .eq("id", identity.profile.id);

  if (error) {
    console.error("Failed to set beta_onboarding_complete:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

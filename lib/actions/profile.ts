"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { displayName: string }) {
  if (!data.displayName || data.displayName.trim().length === 0) {
    return { success: false, error: "Display name cannot be empty" };
  }

  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Action handles writing implicitly if needed
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: data.displayName.trim() })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update failed:", updateError);
      return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/account");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Profile action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

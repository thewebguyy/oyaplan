"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface ProfileUpdateInput {
  displayName?: string;
  avatarUrl?: string | null;
  phoneNumber?: string;
  country?: string;
}

export async function updateProfile(data: ProfileUpdateInput) {
  if (data.displayName !== undefined && data.displayName.trim().length === 0) {
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled
          }
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

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.displayName !== undefined) {
      updates.display_name = data.displayName.trim();
    }

    if (data.avatarUrl !== undefined) {
      updates.avatar_url = data.avatarUrl;
    }

    // Update profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update failed:", updateError);
      return { success: false, error: "Failed to update profile" };
    }

    // Also update auth user metadata if extra attributes were provided
    if (data.phoneNumber || data.country || data.displayName) {
      await supabase.auth.updateUser({
        data: {
          ...(data.displayName ? { full_name: data.displayName.trim(), name: data.displayName.trim() } : {}),
          ...(data.phoneNumber ? { phone_number: data.phoneNumber.trim() } : {}),
          ...(data.country ? { country: data.country.trim() } : {}),
        },
      });
    }

    revalidatePath("/account");
    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Profile action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

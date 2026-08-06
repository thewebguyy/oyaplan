import { createServerClient } from "@/lib/supabase-server";

export async function isAuthorizedAdmin(): Promise<{ authorized: boolean; email?: string; role?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { authorized: false };
    }

    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("email, role")
      .eq("email", user.email.toLowerCase())
      .single();

    if (adminRecord) {
      return { authorized: true, email: adminRecord.email, role: adminRecord.role };
    }

    // Default fallback for initial CTO access
    if (user.email === "pstmax@gmail.com") {
      return { authorized: true, email: user.email, role: "owner" };
    }

    return { authorized: false, email: user.email };
  } catch (error) {
    console.error("Failed to check admin authorization:", error);
    return { authorized: false };
  }
}

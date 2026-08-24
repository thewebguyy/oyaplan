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

    return { authorized: false, email: user.email };
  } catch (error) {
    console.error("Failed to check admin authorization:", error);
    return { authorized: false };
  }
}

export async function assertAdminSession(): Promise<{ email: string; role: string }> {
  const auth = await isAuthorizedAdmin();
  if (!auth.authorized || !auth.email) {
    throw new Error("Unauthorized: Admin session required.");
  }
  return { email: auth.email, role: auth.role || "admin" };
}

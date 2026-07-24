import { createServerClient } from "@/lib/supabase-server";
import { getScoutProfile, getScoutLeaderboard, getPendingVerificationTasks } from "@/lib/queries/scout";
import ScoutDashboardClient from "./ScoutDashboardClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ScoutPage() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    // Redirect to login but retain scout path
    redirect("/admin/login?next=/scout");
  }

  const profile = await getScoutProfile(user.id);
  const leaderboard = await getScoutLeaderboard();
  const tasks = await getPendingVerificationTasks();

  return (
    <main className="min-h-screen bg-[#FAFAF8] antialiased pb-24">
      {/* Nav */}
      <div className="w-full bg-white border-b border-border-default py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-block tap-feedback">
          <span className="text-xl font-black tracking-tighter uppercase text-black">
            OyaPlan
          </span>
        </Link>
        <span className="type-ui-label text-xs bg-[#008751]/10 text-[#008751] px-3 py-1 rounded-full font-black uppercase">
          Scout Portal
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <ScoutDashboardClient
          userId={user.id}
          initialProfile={profile}
          leaderboard={leaderboard}
          initialTasks={tasks}
        />
      </div>
    </main>
  );
}

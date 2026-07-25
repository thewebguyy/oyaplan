import { createServerClient } from "@/lib/supabase-server";
import { getVenuesByOwner, getVenueClaimsByUser } from "@/lib/queries/operator";
import { getForgeSpots } from "@/lib/queries/spots";
import Link from "next/link";
import { redirect } from "next/navigation";
import OperatorDashboardClient from "./OperatorDashboardClient";

export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    redirect("/admin/login?next=/operator");
  }

  const venues = await getVenuesByOwner(user.id);
  const claims = await getVenueClaimsByUser(user.id);
  const { data: spots } = await getForgeSpots();

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24">
      {/* Nav */}
      <div className="w-full bg-white border-b border-border-default py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-block tap-feedback">
          <span className="text-xl font-black tracking-tighter uppercase text-black">
            OyaPlan
          </span>
        </Link>
        <span className="type-ui-label text-xs bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full font-black uppercase">
          Operator Portal
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <OperatorDashboardClient
          userId={user.id}
          initialVenues={venues}
          initialClaims={claims}
          availableSpots={spots || []}
        />
      </div>
    </main>
  );
}

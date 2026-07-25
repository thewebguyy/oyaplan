import { getForgeSpots } from "@/lib/queries/spots";
import { LocationService } from "@/lib/services/LocationService";
import Link from "next/link";
import ChainPlannerWidget from "@/components/ChainPlannerWidget";

export const dynamic = "force-dynamic";

export default async function ChainPage() {
  const { data: spots } = await getForgeSpots();
  const areas = LocationService.getVerifiedAreas();

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24">
      {/* Navigation */}
      <div className="w-full bg-white border-b border-border-default py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-block tap-feedback">
          <span className="text-xl font-black tracking-tighter uppercase text-black">
            OyaPlan
          </span>
        </Link>
        <span className="type-ui-label text-xs bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full font-black uppercase">
          Multi-Stop Chain Planner
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10">
        <ChainPlannerWidget
          spots={spots || []}
          areas={areas}
        />
      </div>
    </main>
  );
}

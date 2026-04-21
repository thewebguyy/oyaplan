import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ areaSlug: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ areaSlug: string }> }): Promise<Metadata> {
  const { areaSlug } = await params;
  const { data: area } = await supabase
    .from("areas")
    .select("name")
    .eq("slug", areaSlug)
    .single();

  const areaName = area?.name || "Lagos";

  return {
    title: `${areaName} Outing Spots — OyaPlan`,
    description: `Restaurants, activities, and experiences in ${areaName}, Lagos. Budget-friendly squad planning.`,
    openGraph: {
      images: ["/og"],
    }
  };
}

export default async function ExploreArea({ params, searchParams }: Props) {
  const { areaSlug } = await params;
  const urlParams = await searchParams;
  const budget = urlParams.budget ? parseInt(urlParams.budget) : null;
  const vibe = urlParams.vibe || null;

  // Fetch area details
  const { data: area } = await supabase
    .from("areas")
    .select("*, spots(*)")
    .eq("slug", areaSlug)
    .single();

  if (!area) return <div>Area not found</div>;

  // Process spots with budget awareness
  const spots = (area.spots || []).filter((s: any) => s.active !== false).map((spot: any) => {
    const estimatedTotal = spot.price_per_person * 2 * 1.1;
    const fitsBudget = budget ? estimatedTotal <= budget : true;
    return { ...spot, fitsBudget };
  }).sort((a: any, b: any) => {
    if (a.fitsBudget && !b.fitsBudget) return -1;
    if (!a.fitsBudget && b.fitsBudget) return 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Context Banner */}
      {budget && vibe && (
        <div className="bg-[#008751] text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm font-bold">
            <p>Showing spots in {area.name} that match your ₦{budget.toLocaleString()} {vibe} outing</p>
            <Link href={`/explore/${areaSlug}`} className="underline text-white/80 hover:text-white">Clear filters</Link>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/explore" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Areas</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight">{area.name}</h1>
          <p className="text-gray-500 mt-1">Found {spots.length} spots in this area.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-6">
        {spots.length > 0 ? (
          spots.map((spot: any) => {
            const prefillParams = new URLSearchParams();
            prefillParams.append("startArea", areaSlug);
            prefillParams.append("pinnedSpotId", spot.id);
            if (budget) prefillParams.append("budget", budget.toString());
            if (vibe) prefillParams.append("vibe", vibe);

            return (
              <div 
                key={spot.id} 
                className={`p-6 border rounded-2xl transition-all ${
                  spot.fitsBudget 
                    ? "bg-white border-gray-100 shadow-sm" 
                    : "bg-gray-50/50 border-gray-100 opacity-60"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold">{spot.name}</h3>
                      <Badge variant="outline" className="bg-white">{spot.category}</Badge>
                      {budget && spot.fitsBudget && (
                        <Badge className="bg-[#008751] text-white border-none">Fits your budget</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {spot.address}
                    </div>
                    <p className="text-sm font-bold text-[#008751]">
                      Avg ₦{spot.price_per_person.toLocaleString()} per person
                    </p>
                  </div>
                  
                  <Link href={`/?${prefillParams.toString()}`}>
                    <Button className="bg-[#008751] hover:bg-[#007043] rounded-xl font-bold h-12 px-6 w-full md:w-auto">
                      Plan around this spot
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">No spots found in this area yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

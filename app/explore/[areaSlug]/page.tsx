import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ExploreArea({ params }: { params: Promise<{ areaSlug: string }> }) {
  const { areaSlug } = await params;

  // Fetch area details
  const { data: area } = await supabase
    .from("areas")
    .select("*")
    .eq("slug", areaSlug)
    .single();

  if (!area) return <div>Area not found</div>;

  // Fetch spots in this area
  const { data: spots } = await supabase
    .from("spots")
    .select("*")
    .eq("area_id", area.id)
    .eq("active", true);

  // Group by category
  const groupedSpots = (spots || []).reduce((acc: any, spot) => {
    const category = spot.category || "restaurant";
    if (!acc[category]) acc[category] = [];
    acc[category].push(spot);
    return acc;
  }, {});

  const categories = Object.keys(groupedSpots).sort();

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
      <div className="bg-gray-50 border-b border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/explore" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">All Areas</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight">{area.name}</h1>
          <p className="text-gray-500 mt-1">Discover the best spots in {area.name}.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10 space-y-12">
        {categories.length > 0 ? (
          categories.map(cat => (
            <div key={cat} className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#008751] border-b border-green-50 pb-2">
                {cat}s
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {groupedSpots[cat].map((spot: any) => (
                  <div key={spot.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{spot.name}</h3>
                        <Badge variant="secondary" className="bg-green-50 text-[#008751] border-none text-[10px] uppercase tracking-tighter">
                          {spot.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {spot.vibe_tags?.map((v: string) => (
                          <span key={v} className="text-[11px] text-gray-400 font-medium">#{v}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {spot.address}
                        </div>
                        <div className="text-[#008751]">
                          ₦{spot.price_per_person.toLocaleString()}–₦{(spot.price_per_person * 1.3).toLocaleString()} pp
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/?startArea=${areaSlug}&pinnedSpotId=${spot.id}`}>
                      <Button className="bg-[#008751] hover:bg-[#007043] font-bold text-sm h-11 px-6 rounded-xl">
                        Plan around this spot →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">No active spots found in this area yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

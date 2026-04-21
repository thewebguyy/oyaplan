import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings by Area — OyaPlan",
  description: "Browse spots, restaurants, activities, and hidden gems across all Lagos areas. Find your next squad outing.",
  openGraph: {
    images: ["/og"],
  }
};

export default async function ExploreIndex({ 
  searchParams 
}: { 
  searchParams: Promise<{ budget?: string; vibe?: string }> 
}) {
  const params = await searchParams;
  const { data: areas } = await supabase
    .from("areas")
    .select("*, spots(id)")
    .order("name");

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Context Banner */}
      {params.budget && params.vibe && (
        <div className="bg-[#008751] text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm font-bold">
            <p>Showing spots that match your ₦{parseInt(params.budget).toLocaleString()} {params.vibe} outing</p>
            <Link href="/explore" className="underline text-white/80 hover:text-white">Clear filters</Link>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Planner</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Explore Lagos</h1>
          <p className="text-gray-500 mt-1">Select an area to see what's happening.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {areas?.map((area: any) => {
            const areaParams = new URLSearchParams();
            if (params.budget) areaParams.append("budget", params.budget);
            if (params.vibe) areaParams.append("vibe", params.vibe);
            const href = areaParams.toString() ? `/explore/${area.slug}?${areaParams.toString()}` : `/explore/${area.slug}`;

            return (
              <Link 
                key={area.id} 
                href={href}
                className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#008751]/20 transition-all text-left"
              >
                <h3 className="text-xl font-bold group-hover:text-[#008751] transition-colors">{area.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{area.spots?.length || 0} spots to discover</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

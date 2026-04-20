import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExploreIndex() {
  const { data: areas } = await supabase
    .from("areas")
    .select("*, spots(id)")
    .order("name");

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20">
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
          {areas?.map((area: any) => (
            <Link 
              key={area.id} 
              href={`/explore/${area.slug}`}
              className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#008751]/20 transition-all text-left"
            >
              <h3 className="text-xl font-bold group-hover:text-[#008751] transition-colors">{area.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{area.spots?.length || 0} spots to discover</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

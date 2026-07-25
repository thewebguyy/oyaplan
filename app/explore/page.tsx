import { Metadata } from "next";
import Link from "next/link";
import { getAreasWithSpotCounts } from "@/lib/queries/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings — OyaPlan",
  description: "Find your next squad outing across all Lagos zones.",
  openGraph: {
    images: ["/og"],
  }
};

const AREA_COLORS: Record<string, string> = {
  "lekki-phase-1": "#00BCD4", // Cyan
  "vi": "#29B6F6", // Light Blue
  "yaba": "#E91E63", // Pink
  "ikeja": "#FFCA28", // Yellow
  "surulere": "#FF8F00", // Orange
  "ikoyi": "#AB47BC", // Purple
  "lagos-island": "#D81B60",
};

export default async function ExploreIndex() {
  const { data: areas, error } = await getAreasWithSpotCounts();
  
  const validAreas = (areas || []).filter(a => a.activeSpotCount > 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase text-[#008751] bg-[#008751]/10 px-3 py-1.5 rounded-full w-fit block mb-4">
            Discover Lagos Venues
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight mb-3">
            Where do you feel like?
          </h1>
          <p className="text-lg text-text-muted">
            Select a neighborhood to swipe through verified spots and build your plan.
          </p>
        </div>

        {error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            Failed to load areas. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validAreas.map((area) => {
              const color = AREA_COLORS[area.slug] || "#008751";
              return (
                <Link key={area.slug} href={`/explore/${area.slug}`}>
                  <div className="group relative overflow-hidden bg-white rounded-3xl p-6 border border-border-default hover:border-midnight-lagoon transition-all shadow-sm hover:shadow-md tap-feedback">
                    <div className="flex items-center justify-between z-10 relative">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner"
                          style={{ backgroundColor: color }}
                        >
                          {area.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-text-primary group-hover:text-midnight-lagoon transition-colors">
                            {area.name}
                          </h2>
                          <p className="text-sm font-bold text-text-muted mt-0.5">
                            {area.activeSpotCount} venues
                          </p>
                        </div>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                        style={{ backgroundColor: `${color}15`, color: color }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

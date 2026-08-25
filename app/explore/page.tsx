import { Metadata } from "next";
import Link from "next/link";
import { getAreasWithSpotCounts } from "@/lib/queries/areas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Explore Lagos Outings — OyaPlan",
  description: "Find your next squad outing across Lagos' best hubs.",
  openGraph: {
    images: ["/og"],
  }
};

const AREA_COLORS: Record<string, string> = {
  "lekki-phase-1": "#00BCD4", // Cyan
  "vi": "#29B6F6", // Light Blue
  "yaba": "#E91E63", // Pink
  "ikeja": "#FFCA28", // Yellow
};

const AREA_METADATA: Record<string, { vibe: string; desc: string; gradient: string }> = {
  "lekki-phase-1": {
    vibe: "Coastal Vibes & Rooftops",
    desc: "Ocean breeze, chic waterside spots, and premium late-night lounges.",
    gradient: "from-[#00BCD4]/10 to-[#008751]/5 hover:shadow-[0_8px_32px_rgba(0,188,212,0.15)] hover:border-[#00BCD4]/40"
  },
  "vi": {
    vibe: "Fine Dining & High-End Bars",
    desc: "Elite culinary concepts, sleek cocktail lounges, and premier date spots.",
    gradient: "from-[#29B6F6]/10 to-[#AB47BC]/5 hover:shadow-[0_8px_32px_rgba(41,182,246,0.15)] hover:border-[#29B6F6]/40"
  },
  "yaba": {
    vibe: "Creative Spaces & Quick Bites",
    desc: "Student-friendly student hubs, tech workspaces, and casual brunch spots.",
    gradient: "from-[#E91E63]/10 to-[#FF8F00]/5 hover:shadow-[0_8px_32px_rgba(233,30,99,0.15)] hover:border-[#E91E63]/40"
  },
  "ikeja": {
    vibe: "Mainland Grills & Dynamic Energy",
    desc: "Vibrant energy, local grills, lively bars, and iconic mainland hangouts.",
    gradient: "from-[#FFCA28]/10 to-[#FF8F00]/5 hover:shadow-[0_8px_32px_rgba(255,202,40,0.15)] hover:border-[#FFCA28]/40"
  }
};

export default async function ExploreIndex() {
  const { data: areas, error } = await getAreasWithSpotCounts();
  
  // Filter out any deactivated areas
  const validAreas = (areas || []).filter(a => a.activeSpotCount > 0);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Editorial Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#008751] bg-[#008751]/10 px-3 py-1.5 rounded-full mb-4">
            ✨ Hand-Vetted Outing Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight mb-3">
            Where do you feel like?
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-xl">
            We manually verified menus and calibrated transport pricing for Lagos&apos; top active hubs. Choose an area to plan with confidence.
          </p>
        </div>

        {error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            Failed to load areas. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Area Cards */}
            {validAreas.map((area) => {
              const color = AREA_COLORS[area.slug] || "#008751";
              const meta = AREA_METADATA[area.slug] || {
                vibe: "Vetted Outing Hub",
                desc: "Discover verified restaurants, bars, and experiences.",
                gradient: "from-[#008751]/10 to-[#008751]/5 hover:border-[#008751]/40"
              };

              return (
                <Link key={area.slug} href={`/explore/${area.slug}`} className="group block">
                  <div className={`relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-border-default hover:border-midnight-lagoon transition-all duration-300 shadow-sm hover:shadow-lg tap-feedback bg-gradient-to-br ${meta.gradient} h-full flex flex-col justify-between`}>
                    <div>
                      {/* Top badge row */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#008751] bg-[#008751]/10 px-2.5 py-1 rounded-md">
                          {meta.vibe}
                        </span>
                        <span className="text-[11px] font-bold text-text-muted">
                          {area.activeSpotCount} venues
                        </span>
                      </div>

                      {/* Area Name & Description */}
                      <h2 className="text-2xl font-black text-text-primary group-hover:text-midnight-lagoon transition-colors mb-2">
                        {area.name}
                      </h2>
                      <p className="text-sm text-text-muted leading-relaxed mb-6">
                        {meta.desc}
                      </p>
                    </div>

                    {/* Arrow / Interactive Footer */}
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300" style={{ color: color }}>
                      <span>Explore Spots</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Gen Z "Cooking Soon" Teaser Card */}
            <div className="group relative overflow-hidden bg-[#FAFAF8] rounded-3xl p-8 border border-dashed border-gray-300 transition-all flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-200 text-xl mb-6 shadow-sm select-none">
                  🧑‍🍳
                </div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">
                  Your hood next?
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  We&apos;re currently cooking up the math for <strong>Surulere</strong>, <strong>Ikoyi</strong>, and more. Sit tight, your budget confidence is loading...
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008751] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008751]"></span>
                </span>
                <span>Calibrating price matrix</span>
              </div>
            </div>

          </div>
        )}

        {/* Quality Promise / Trust Dashboard */}
        <div className="mt-20 border-t border-border-default/80 pt-12">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-8 text-center">
            The OyaPlan Quality Promise
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-border-default shadow-sm flex gap-4 items-start">
              <span className="text-2xl select-none">🕵️‍♂️</span>
              <div>
                <h4 className="font-bold text-midnight-lagoon text-sm">100% Manually Audited</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  No scraped data or outdated web lists. We check menus directly to verify every price point.
                </p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-border-default shadow-sm flex gap-4 items-start">
              <span className="text-2xl select-none">🚕</span>
              <div>
                <h4 className="font-bold text-midnight-lagoon text-sm">Transport Calibrated</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Uber/Bolt costs are dynamically calibrated using actual traffic patterns and off-peak values.
                </p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-border-default shadow-sm flex gap-4 items-start">
              <span className="text-2xl select-none">🎯</span>
              <div>
                <h4 className="font-bold text-midnight-lagoon text-sm">Zero Surprise Bills</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Taxes, service charges, and cover fees are baked into the cost engine so the plan remains accurate.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

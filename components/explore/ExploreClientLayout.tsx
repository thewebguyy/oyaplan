"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import ExperienceRenderer from "../cxl/ExperienceRenderer";
import { lagosCityData } from "../cxl/data/lagos.city";
import { resolveTimeState, TimeOfDay } from "../cxl/utils/time";
import QuickSwapWipe from "./QuickSwapWipe";
import Link from "next/link";

interface ExploreClientLayoutProps {
  children: ReactNode;
}

export default function ExploreClientLayout({ children }: ExploreClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");

  const budgetParam = searchParams.get("budget");
  const budget = budgetParam ? parseInt(budgetParam) : null;

  useEffect(() => {
    const resolved = resolveTimeState();
    if (resolved !== "afternoon") {
      setTimeOfDay(resolved);
    }
  }, []);

  const handleDistrictClick = (slug: string, isActive: boolean) => {
    if (!isActive) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    router.push(`/explore/${slug}?${nextParams.toString()}`);
  };
  
  // Detect if we are on a details/results page (/explore/[slug])
  const isDetailsPage = pathname.startsWith("/explore/") && pathname !== "/explore";
  const activeSlug = pathname === "/explore" ? null : pathname.replace("/explore/", "");

  const activeAreas = [
    { name: "Ikeja", slug: "ikeja", description: "Capital hub, mainland vibe, dynamic grills", color: "#FFCA28" },
    { name: "Lekki Phase 1", slug: "lekki-phase-1", description: "Bustling cocktail lounges, beach views", color: "#00BCD4" },
    { name: "Victoria Island", slug: "vi", description: "Premium restaurants, high-end lounges", color: "#29B6F6" },
    { name: "Yaba", slug: "yaba", description: "Tech-hub energy, budget-friendly student spots", color: "#E91E63" },
    { name: "Surulere", slug: "surulere", description: "Classic local hotspots, mainland pepper soup", color: "#FF8F00" },
    { name: "Ikoyi", slug: "ikoyi", description: "Intimate date options, exclusive cafes", color: "#AB47BC" },
    { name: "Lagos Island", slug: "lagos-island", description: "High-energy commercial central hub", color: "#D81B60" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAFAF8] lg:flex">
      
      {/* 
        MAP LAYER (Left Page on Desktop)
      */}
      <div 
        className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-screen lg:w-1/2"
      >
        <ExperienceRenderer 
          scene={lagosCityData} 
          chapter={activeSlug} 
          timeOfDay={timeOfDay} 
          budget={budget}
          onDistrictClick={handleDistrictClick}
        />
      </div>

      {/* 
        RESULTS PANEL LAYER (Right Page on Desktop)
      */}
      <div 
        className={`fixed lg:static z-40 bg-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:shadow-none lg:border-l border-border-default/40
          /* Desktop styling: right panel */
          lg:w-1/2 lg:h-screen
          /* Mobile styling: bottom sheet */
          bottom-0 inset-x-0 h-[65vh] lg:bottom-auto rounded-t-3xl lg:rounded-none
          /* Transform states on mobile */
          ${isDetailsPage ? "translate-y-0 opacity-100" : "translate-y-0 lg:translate-x-0"}
        `}
      >
        {/* Close Button / Return */}
        {isDetailsPage && (
          <div className="absolute top-0 inset-x-0 z-20 flex justify-end p-4">
             <Link href="/explore" className="w-8 h-8 flex items-center justify-center bg-surface-grey hover:bg-black/5 rounded-full transition-colors pointer-events-auto tap-feedback">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </Link>
          </div>
        )}
        
        {/* Scrollable Container with Wipe Wrapper */}
        <div className="w-full h-full overflow-y-auto px-6 py-8">
          {isDetailsPage ? (
            <QuickSwapWipe pathname={pathname}>
              {children}
            </QuickSwapWipe>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-[#008751] bg-[#008751]/10 px-2.5 py-1 rounded-full w-fit block">Lagos Directory</span>
                <h2 className="text-2xl font-black text-midnight-lagoon tracking-tight">Explore Lagos Zones</h2>
                <p className="text-sm text-text-muted">Select a neighborhood on the map or choose a district below to find verified spots and budgets.</p>
              </div>

              <div className="space-y-3 pt-2">
                {activeAreas.map((area) => (
                  <button
                    key={area.slug}
                    onClick={() => handleDistrictClick(area.slug, true)}
                    className="w-full text-left p-4 bg-[#FAFAF8] border border-border-default/60 hover:border-midnight-lagoon rounded-2xl flex items-center justify-between transition-all group tap-feedback"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-4">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-sm" style={{ backgroundColor: area.color }} />
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary text-sm group-hover:text-midnight-lagoon transition-colors">{area.name}</p>
                        <p className="text-xs text-text-muted mt-0.5 truncate">{area.description}</p>
                      </div>
                    </div>
                    <span className="text-text-muted group-hover:text-midnight-lagoon transition-colors font-bold text-base">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

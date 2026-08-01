"use client";

import { useOrigin } from "@/lib/location/OriginContext";
import { useRecommendations } from "@/lib/planning/useRecommendations";
import { mapPlanToCardViewModel } from "@/lib/planning/presentation/decisionCardMapper";
import { VenueCardStack } from "./VenueCardStack";
import { Spot } from "@/lib/types";
import { ArrowLeft, RefreshCw, Navigation } from "lucide-react";
import Link from "next/link";

interface ExplorePageContentProps {
  initialSpots: Spot[];
  slug: string;
  initialBudget?: number;
  initialVibe?: string;
  squadCount: number;
}

export function ExplorePageContent({
  initialSpots,
  slug,
  initialBudget,
  initialVibe,
  squadCount
}: ExplorePageContentProps) {
  const { origin, status, requestCurrentLocation, clearOrigin } = useOrigin();

  const request = {
    squadSize: squadCount,
    budget: initialBudget || 10000000,
    vibe: initialVibe || ""
  };

  const { plans } = useRecommendations({
    spots: initialSpots,
    request
  });

  const viewModels = plans.map(mapPlanToCardViewModel);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] pt-8 flex flex-col relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto px-6 mb-4 flex flex-col z-10 relative pointer-events-none">
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-4 w-fit pointer-events-auto tap-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          All Areas
        </Link>

        {/* Location Status Control Area */}
        <div className="bg-[#FAF9F6] border border-border-default/60 rounded-2xl p-4 shadow-sm pointer-events-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Planning starting from
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-text-primary">
                {status === "gps" ? `📍 Near ${origin?.resolvedName}` : `📍 ${origin?.resolvedName || "Lagos"}`}
              </span>
              {status === "gps" && (
                <span className="text-[10px] text-brand-green font-bold bg-[#EAFDF3] px-2 py-0.5 rounded-full">
                  detected automatically
                </span>
              )}
            </div>
          </div>

          <div>
            {status === "gps" ? (
              <button
                onClick={clearOrigin}
                className="text-xs font-bold text-text-muted hover:text-text-primary uppercase tracking-wider px-3 py-1.5 bg-surface-grey border border-border-default/60 rounded-xl transition-colors cursor-pointer"
              >
                Change
              </button>
            ) : (
              <button
                onClick={requestCurrentLocation}
                disabled={status === "locating"}
                className="text-xs font-bold text-brand-green hover:bg-brand-green/5 border border-brand-green uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                {status === "locating" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                )}
                Plan from my location
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center pb-12 z-10">
        <VenueCardStack 
          spots={viewModels} 
          rawSpots={initialSpots}
          slug={slug} 
          budget={initialBudget} 
          vibe={initialVibe} 
          squadCount={squadCount} 
        />
      </div>
      
      {/* Background decoration to replace map feel */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #008751 0%, transparent 60%)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }} />
    </div>
  );
}

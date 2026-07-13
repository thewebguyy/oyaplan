"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Spot } from "@/lib/types";
import BlueprintMap from "./BlueprintMap";
import DanfoTicker from "./DanfoTicker";
import SquadBuilder from "./SquadBuilder";
import MoodFilters from "./MoodFilters";
import QuickSwapWipe from "./QuickSwapWipe";

interface ExploreClientLayoutProps {
  spots: Spot[];
  children: ReactNode;
}

export default function ExploreClientLayout({ spots, children }: ExploreClientLayoutProps) {
  const pathname = usePathname();
  
  // Detect if we are on a details/results page (/explore/[slug])
  const isDetailsPage = pathname.startsWith("/explore/") && pathname !== "/explore";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAFAFA]">
      
      {/* 
        MAP LAYER
        Always mounted. On desktop, when details are open, we translate the map left by 20vw 
        so its center is at 30vw (the middle of the remaining 60vw).
        On mobile, we translate it up by 30vh so its center is in the top 40vh.
      */}
      <div 
        className={`absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${
          isDetailsPage 
            ? "-translate-y-[30vh] md:-translate-x-[20vw]" 
            : "translate-y-0"
        }`}
      >
        {/* Ticker & Header Layer */}
        <div className="absolute top-0 inset-x-0 z-10 flex flex-col pointer-events-none">
          <div className="pointer-events-auto">
            <DanfoTicker spots={spots} />
          </div>
          <div className="text-center max-w-xl mx-auto mt-6 px-4">
            <h1 className="font-sans font-black text-3xl sm:text-5xl tracking-[-0.04em] uppercase leading-none text-text-primary">
              Where to Go?
            </h1>
            <p className="type-caption text-text-muted mt-1.5 uppercase font-bold tracking-widest text-[9px]">
              Tap a zone below &bull; Verified Lagos pricing
            </p>
          </div>
        </div>

        {/* The Map Component */}
        <div className="w-full h-full flex items-center justify-center pt-[10vh] md:pt-[15vh] pb-[15vh]">
          <BlueprintMap />
        </div>

        {/* Footer Filters */}
        <div className="absolute bottom-6 inset-x-0 z-10 pointer-events-auto">
          <div className="w-full max-w-xl mx-auto px-4 flex flex-col gap-5">
            <SquadBuilder />
            <MoodFilters />
          </div>
        </div>
      </div>

      {/* 
        RESULTS PANEL LAYER
        Desktop: Side-by-side panel (40vw wide, right aligned)
        Mobile: Bottom sheet (60vh tall)
      */}
      <div 
        className={`fixed z-50 bg-white border-black/80 transition-transform duration-200 ease-out motion-reduce:transition-none shadow-[0_0_40px_rgba(0,0,0,0.1)]
          /* Desktop styling: right panel */
          md:top-0 md:right-0 md:left-auto md:w-[40vw] md:h-screen md:border-l-2 md:bottom-auto md:rounded-t-none
          /* Mobile styling: bottom sheet */
          bottom-0 inset-x-0 h-[60vh] border-t-2 md:border-t-0 rounded-t-3xl
          /* Transform states */
          ${isDetailsPage ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
        `}
      >
        {/* Mobile Drag Handle (Visual only) */}
        <div className="md:hidden w-12 h-1.5 bg-black/20 rounded-full mx-auto mt-3 mb-1" />
        
        {/* Scrollable Container with Wipe Wrapper */}
        <div className="w-full h-full overflow-y-auto">
          {/* Quick Swap Wipe ensures inner content performs a hard wipe on slug change without remounting the panel */}
          <QuickSwapWipe pathname={pathname}>
            {children}
          </QuickSwapWipe>
        </div>
      </div>

    </div>
  );
}

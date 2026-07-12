"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Spot } from "@/lib/types";
import BlueprintMap from "./BlueprintMap";
import DanfoTicker from "./DanfoTicker";
import SquadBuilder from "./SquadBuilder";
import MoodFilters from "./MoodFilters";

interface ExploreClientLayoutProps {
  spots: Spot[];
  children: ReactNode;
}

export default function ExploreClientLayout({ spots, children }: ExploreClientLayoutProps) {
  const pathname = usePathname();
  
  // Detect if we are on a details/results page (/explore/[slug])
  const isDetailsPage = pathname.startsWith("/explore/") && pathname !== "/explore";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      {/* 
        Area details results container. 
        Rendered under/behind the map overlay so Next.js server-rendered HTML is ready in the DOM on load.
      */}
      <div 
        className="relative z-10 w-full min-h-screen"
        style={{
          visibility: isDetailsPage ? "visible" : "hidden",
          transition: "none"
        }}
      >
        {children}
      </div>

      {/* The Printing Press Split Overlay Container */}
      <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
        
        {/* Top Half Plate */}
        <div 
          className="relative w-full h-[50vh] bg-white border-b-2 border-black/80 transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between overflow-hidden pointer-events-auto shadow-md"
          style={{ transform: isDetailsPage ? "translateY(-100%)" : "translateY(0)" }}
        >
          {/* Ticker at the top */}
          <DanfoTicker spots={spots} />

          {/* Heading Section */}
          <div className="text-center max-w-xl mx-auto mt-6 px-4">
            <h1 className="font-sans font-black text-3xl sm:text-5xl tracking-[-0.04em] uppercase leading-none text-text-primary">
              Where to Go?
            </h1>
            <p className="type-caption text-text-muted mt-1.5 uppercase font-bold tracking-widest text-[9px]">
              Tap a zone below &bull; Verified Lagos pricing
            </p>
          </div>

          {/* Upper Map Segment */}
          <div className="w-full max-w-[700px] mx-auto h-[26vh] relative overflow-hidden flex items-end">
            <div className="absolute top-[-24vh] inset-x-0 flex justify-center">
              <BlueprintMap half="top" />
            </div>
          </div>
        </div>

        {/* Bottom Half Plate */}
        <div 
          className="relative w-full h-[50vh] bg-white border-t-2 border-black/80 transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between overflow-hidden pointer-events-auto shadow-md"
          style={{ transform: isDetailsPage ? "translateY(100%)" : "translateY(0)" }}
        >
          {/* Lower Map Segment */}
          <div className="w-full max-w-[700px] mx-auto h-[26vh] relative overflow-hidden flex items-start">
            <div className="absolute bottom-[-24vh] inset-x-0 flex justify-center">
              <BlueprintMap half="bottom" />
            </div>
          </div>

          {/* Bottom Filter Controls */}
          <div className="w-full max-w-xl mx-auto pb-6 pt-4 px-4 flex flex-col gap-5 border-t border-black/5">
            <SquadBuilder />
            <MoodFilters />
          </div>
        </div>

      </div>
    </div>
  );
}

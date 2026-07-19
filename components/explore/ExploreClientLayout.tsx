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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F9F8F6] lg:flex">
      
      {/* 
        MAP LAYER (Left Page on Desktop)
      */}
      <div 
        className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-screen ${
          isDetailsPage 
            ? "lg:w-1/2 -translate-y-[15vh] lg:translate-y-0" 
            : "lg:w-full translate-y-0"
        }`}
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
        Desktop: Side-by-side panel (50% wide)
        Mobile: Bottom sheet (60vh tall)
      */}
      <div 
        className={`fixed lg:static z-50 bg-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:shadow-none lg:border-l border-border-default/40
          /* Desktop styling: right panel */
          lg:w-1/2 lg:h-screen
          /* Mobile styling: bottom sheet */
          bottom-0 inset-x-0 h-[65vh] lg:bottom-auto rounded-t-3xl lg:rounded-none
          /* Transform states with transition delays */
          ${isDetailsPage ? "translate-y-0 lg:translate-x-0 opacity-100" : "translate-y-full lg:translate-x-full opacity-0 pointer-events-none lg:hidden"}
        `}
      >
        {/* Sticky Header Actions */}
        <div className="absolute top-0 inset-x-0 z-20 flex justify-center lg:justify-end p-4 pointer-events-none">
           {/* Mobile Drag Handle (Visual only) */}
           <div className="lg:hidden w-12 h-1.5 bg-black/10 rounded-full mt-2" />
           
           {/* Close Button */}
           <Link href="/explore" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-surface-grey hover:bg-black/5 rounded-full transition-colors pointer-events-auto tap-feedback">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </Link>
        </div>
        
        {/* Scrollable Container with Wipe Wrapper */}
        <div className="w-full h-full overflow-y-auto lg:px-6">
          <QuickSwapWipe pathname={pathname}>
            {children}
          </QuickSwapWipe>
        </div>
      </div>
    </div>
  );
}

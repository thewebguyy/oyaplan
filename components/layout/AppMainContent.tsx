"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function AppMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Business portal (/business, /business/[venueId], /business/claim) has its own header and top clearance
  const isBusinessPortal = pathname === "/business" || pathname?.startsWith("/business/");
  const isStandalone = pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot";
  const isPublicBusiness = pathname === "/for-business" || pathname?.startsWith("/partner");

  if (isBusinessPortal || isStandalone) {
    return <div className="pt-0 pb-0">{children}</div>;
  }

  if (isPublicBusiness) {
    // Fixed business navbar clearance for marketing page
    return <div className="pt-16 sm:pt-18 pb-0">{children}</div>;
  }

  // Consumer pages: 56px top nav + dynamic safe-area clearance for mobile bottom bar
  return <div className="pt-14 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</div>;
}

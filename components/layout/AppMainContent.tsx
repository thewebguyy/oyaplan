"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function AppMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Venue management workspace has its own internal BusinessShell layout with full-height header & bottom tabs
  const isBusinessWorkspace = pathname?.startsWith("/business/") && !pathname?.startsWith("/business/claim");
  const isStandalone = pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot";
  const isPublicBusiness = pathname === "/for-business" || pathname === "/business" || pathname?.startsWith("/business/claim") || pathname?.startsWith("/partner");

  if (isBusinessWorkspace || isStandalone) {
    return <div className="pt-0 pb-0">{children}</div>;
  }

  if (isPublicBusiness) {
    // 64px business header, no consumer mobile bottom nav
    return <div className="pt-16 pb-0">{children}</div>;
  }

  // Consumer pages: 56px user nav + 64px mobile bottom nav on mobile
  return <div className="pt-14 pb-16 md:pb-0">{children}</div>;
}

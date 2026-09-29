"use client";

import React from "react";
import { BusinessHero } from "@/components/business/BusinessHero";
import { BusinessTypesSection } from "@/components/business/BusinessTypesSection";
import { BusinessReservationSection } from "@/components/business/BusinessReservationSection";
import { BusinessMarketplaceRelationship } from "@/components/business/BusinessMarketplaceRelationship";
import { BusinessMarquee } from "@/components/business/motion/BusinessMarquee";
import { BusinessProductDeepDive } from "@/components/business/BusinessProductDeepDive";
import { BusinessNarrativeJourney } from "@/components/business/BusinessNarrativeJourney";
import { BusinessFoundingPartner } from "@/components/business/BusinessFoundingPartner";
import { BusinessFAQ } from "@/components/business/BusinessFAQ";
import { BusinessFooter } from "@/components/business/BusinessFooter";

export function ForBusinessClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-brand-green/10 selection:text-brand-green overflow-x-clip">
      {/* ACT 1 — THE DECISION: Hero with composed Business Controller ↔ Consumer Plan UI */}
      <BusinessHero />

      {/* ACT 2 — THE BUSINESS: Broad Lagos supply and real category engine */}
      <BusinessTypesSection />

      {/* ACT 3 — THE RESERVATION: 4-step reservation journey & direct venue deposits */}
      <BusinessReservationSection />

      {/* ACT 4 — THE MARKETPLACE: 3-way relationship (Customers, Businesses, OyaPlan) */}
      <BusinessMarketplaceRelationship />

      {/* ACT 5 — THE PRODUCT: Continuous Horizontal Marquee + Product Deep Dives */}
      <BusinessMarquee />
      <BusinessProductDeepDive />

      {/* ACT 6 — THE CONNECTION: The complete marketplace loop (Discover → Decide → Reserve → Serve → Learn) */}
      <BusinessNarrativeJourney />

      {/* ACT 7 — THE INVITATION: Priority Partner Cohort */}
      <BusinessFoundingPartner />

      {/* ACT 8 — THE TRUST: Comprehensive FAQ + Business Dedicated Footer */}
      <BusinessFAQ />
      <BusinessFooter />
    </div>
  );
}

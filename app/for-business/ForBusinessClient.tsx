"use client";

import React from "react";
import { BusinessHero } from "@/components/business/BusinessHero";
import { BusinessTypesSection } from "@/components/business/BusinessTypesSection";
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

      {/* ACT 2 — THE BUSINESS: Real categorization engine & venue types */}
      <BusinessTypesSection />

      {/* ACT 3 — THE PRODUCT: Continuous Horizontal Marquee + Product Deep Dives */}
      <BusinessMarquee />
      <BusinessProductDeepDive />

      {/* ACT 4 — THE CONNECTION: Business updates → Marketplace → Plan → Visit → Demand signals */}
      <BusinessNarrativeJourney />

      {/* ACT 5 — THE INVITATION: Founding Partner Cohort */}
      <BusinessFoundingPartner />

      {/* ACT 6 — THE TRUST: FAQ + Business Dedicated Footer */}
      <BusinessFAQ />
      <BusinessFooter />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Venue, MenuItem, VenuePhoto } from "@/lib/types";
import { VenueHeroGallery } from "@/components/venue/VenueHeroGallery";
import { VenueStickyAnchorNav } from "@/components/venue/VenueStickyAnchorNav";
import { OperationalNoticeBanner } from "@/components/venue/OperationalNoticeBanner";
import { VenueDecisionSummary } from "@/components/venue/VenueDecisionSummary";
import { VenueBudgetScenario } from "@/components/venue/VenueBudgetScenario";
import { VenueScannableMenu } from "@/components/venue/VenueScannableMenu";
import { VenueExperienceSection } from "@/components/venue/VenueExperienceSection";
import { VenueGoodToKnow } from "@/components/venue/VenueGoodToKnow";
import { VenueNearbyDiscovery } from "@/components/venue/VenueNearbyDiscovery";
import { VenueMobileStickyCTA } from "@/components/venue/VenueMobileStickyCTA";
import { ChangeRequestModal } from "@/components/venue/ChangeRequestModal";
import { trackEvent } from "@/lib/analytics/trackClient";

import { useSearchParams } from "next/navigation";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { VenuePlanContextCard } from "@/components/venue/VenuePlanContextCard";

interface PublicVenueClientProps {
  venue: Venue;
  menuItems: MenuItem[];
  photos: VenuePhoto[];
  nearbyVenues?: Venue[];
  areaName?: string;
  areaSlug?: string;
}

export function PublicVenueClient({
  venue,
  menuItems,
  photos,
  nearbyVenues = [],
  areaName = "Lagos",
  areaSlug = "ikeja",
}: PublicVenueClientProps) {
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const searchParams = useSearchParams();
  const { recordView } = useRecentlyViewed();

  const fromPlan = searchParams.get("fromPlan") === "true";
  const planSquad = searchParams.get("squad") ? Number(searchParams.get("squad")) : undefined;
  const planBudget = searchParams.get("budget") ? Number(searchParams.get("budget")) : undefined;
  const planVibe = searchParams.get("vibe") || undefined;

  // Telemetry & Factual Recent History
  useEffect(() => {
    trackEvent("venue_viewed", {
      category: "Engagement",
      spot_id: venue.id,
      area: areaSlug,
      version: "1.0",
    });

    // Record in local factual history (capped at 10 items)
    recordView({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      areaSlug: areaSlug,
      areaName: areaName,
      category: venue.category || "restaurant",
      pricePerPerson: venue.derived_typical_cost > 0 ? venue.derived_typical_cost : 0,
      imageUrl: venue.cover_url || (photos.length > 0 ? photos[0].url : undefined),
      coverUrl: venue.cover_url,
      vibeTags: venue.vibe_tags || ["Chill"],
    });
  }, [venue, areaSlug, areaName, photos, recordView]);

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] antialiased pb-28 md:pb-20">
      
      {/* 1. Hero & Visual Gallery */}
      <VenueHeroGallery
        venue={venue}
        photos={photos}
        areaName={areaName}
        areaSlug={areaSlug}
        fromPlan={fromPlan}
        planSquad={planSquad}
        planBudget={planBudget}
        planVibe={planVibe}
        onOpenCorrection={() => setIsCorrectionOpen(true)}
      />

      {/* 2. Sticky Anchor Navigation */}
      <VenueStickyAnchorNav />

      {/* 3. Main Content Stream */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Plan Origin Context Card (When arriving from a generated Plan) */}
        {fromPlan && (
          <VenuePlanContextCard
            venue={venue}
            areaSlug={areaSlug}
            areaName={areaName}
            planSquad={planSquad}
            planBudget={planBudget}
            planVibe={planVibe}
          />
        )}

        {/* Operational Notice (Temporary Closure / Maintenance) */}
        <OperationalNoticeBanner venue={venue} />

        {/* Financial Decision Summary */}
        <VenueDecisionSummary
          venue={venue}
          areaSlug={areaSlug}
          fromPlan={fromPlan}
          planSquad={planSquad}
          planBudget={planBudget}
          planVibe={planVibe}
        />

        {/* Budget Spending Simulator ("What can I get for ₦X?") */}
        <VenueBudgetScenario
          venue={venue}
          menuItems={menuItems}
          areaSlug={areaSlug}
        />

        {/* Scannable Menu */}
        <VenueScannableMenu venue={venue} menuItems={menuItems} />

        {/* Experience & Vibe Fit */}
        <VenueExperienceSection venue={venue} />

        {/* Good to Know (House Charges, Hours, Policies & Location) */}
        <VenueGoodToKnow venue={venue} />

        {/* Nearby Discovery */}
        <VenueNearbyDiscovery
          currentVenue={venue}
          nearbyVenues={nearbyVenues}
          areaName={areaName}
        />

      </div>

      {/* 4. Mobile Sticky Action Bar */}
      <VenueMobileStickyCTA
        venue={venue}
        areaSlug={areaSlug}
        coverImage={venue.cover_url || photos[0]?.url}
        fromPlan={fromPlan}
        planSquad={planSquad}
        planBudget={planBudget}
        planVibe={planVibe}
      />

      {/* 5. Correction Modal */}
      <ChangeRequestModal
        venueId={venue.id}
        venueName={venue.name}
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
      />
    </main>
  );
}

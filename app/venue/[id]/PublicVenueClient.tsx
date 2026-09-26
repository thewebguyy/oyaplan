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

  // Telemetry
  useEffect(() => {
    trackEvent("venue_viewed", {
      category: "Discovery",
      venue_id: venue.id,
      venue_name: venue.name,
      area: areaSlug,
      category_type: venue.category,
      has_menu: menuItems.length > 0,
      has_photos: photos.length > 0 || Boolean(venue.cover_url),
      version: "1.0",
    });
  }, [venue.id, venue.name, venue.category, areaSlug, menuItems.length, photos.length, venue.cover_url]);

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] antialiased pb-28 md:pb-20">
      
      {/* 1. Hero & Visual Gallery */}
      <VenueHeroGallery
        venue={venue}
        photos={photos}
        areaName={areaName}
        areaSlug={areaSlug}
        onOpenCorrection={() => setIsCorrectionOpen(true)}
      />

      {/* 2. Sticky Anchor Navigation */}
      <VenueStickyAnchorNav />

      {/* 3. Main Content Stream */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Operational Notice (Temporary Closure / Maintenance) */}
        <OperationalNoticeBanner venue={venue} />

        {/* Financial Decision Summary */}
        <VenueDecisionSummary venue={venue} areaSlug={areaSlug} />

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

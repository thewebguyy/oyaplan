'use client';

import React, { useState } from 'react';
import { Venue, MenuItem, VenuePhoto } from '@/lib/types';
import { PublicVenueHero } from '@/components/venue/PublicVenueHero';
import { PublicPricingSection } from '@/components/venue/PublicPricingSection';
import { OperationalNoticeBanner } from '@/components/venue/OperationalNoticeBanner';
import { PublicOverviewSection } from '@/components/venue/PublicOverviewSection';
import { PublicExperienceFit } from '@/components/venue/PublicExperienceFit';
import { PublicGallery } from '@/components/venue/PublicGallery';
import { ChangeRequestModal } from '@/components/venue/ChangeRequestModal';

interface PublicVenueClientProps {
  venue: Venue;
  menuItems: MenuItem[];
  photos: VenuePhoto[];
  areaName?: string;
  areaSlug?: string;
}

export function PublicVenueClient({
  venue,
  menuItems,
  photos,
  areaName,
  areaSlug,
}: PublicVenueClientProps) {
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24 space-y-8">
      {/* Hero Section */}
      <PublicVenueHero
        venue={venue}
        areaName={areaName}
        areaSlug={areaSlug}
        onOpenCorrection={() => setIsCorrectionOpen(true)}
      />

      {/* Main Body Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Operational Notice (Temporary Closure / Maintenance) */}
        <OperationalNoticeBanner venue={venue} />

        {/* Pricing Section (The most important consumer decision card) */}
        <PublicPricingSection venue={venue} menuItems={menuItems} />

        {/* Experience & Squad Fit */}
        <PublicExperienceFit venue={venue} />

        {/* Overview & Hours */}
        <PublicOverviewSection venue={venue} />

        {/* Verified Photos Gallery */}
        <PublicGallery venue={venue} photos={photos} />
      </div>

      {/* Correction Modal */}
      <ChangeRequestModal
        venueId={venue.id}
        venueName={venue.name}
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
      />
    </main>
  );
}

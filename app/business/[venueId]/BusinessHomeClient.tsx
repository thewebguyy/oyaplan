'use client';

import React from 'react';
import {
  Venue,
  MenuItem,
  ProfileHealth,
  VenueDemandActivity,
  VenuePlanningInsights,
  VenuePhoto,
} from '@/lib/types';
import { VenueControlHero } from '@/components/business/VenueControlHero';
import { NeedsAttentionSection } from '@/components/business/NeedsAttentionSection';
import { WhatCustomersSeePreview } from '@/components/business/WhatCustomersSeePreview';
import { DemandPulseSection } from '@/components/business/DemandPulseSection';
import { VenueDigitalPlaque } from '@/components/business/VenueDigitalPlaque';
import { BusinessReservationsCard } from '@/components/business/BusinessReservationsCard';
import { AttributionVerifyCard } from '@/components/business/AttributionVerifyCard';
import { InformationFreshnessCard } from '@/components/partner/InformationFreshnessCard';
import { ProfileHealthCard } from '@/components/partner/ProfileHealthCard';

interface BusinessHomeClientProps {
  venue: Venue;
  health: ProfileHealth;
  activity: VenueDemandActivity;
  insights: VenuePlanningInsights;
  menuItems: MenuItem[];
  photos: VenuePhoto[];
}

export function BusinessHomeClient({
  venue,
  health,
  activity,
  insights,
  menuItems,
  photos,
}: BusinessHomeClientProps) {
  const approvedCount = photos.filter((p: VenuePhoto) => p.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* ── 1. The Venue Control Panel (Hero) ── */}
      <VenueControlHero venue={venue} />

      {/* ── 2. Highest-Value Actionable Triage: Needs Your Attention ── */}
      <NeedsAttentionSection venue={venue} menuItems={menuItems} />

      {/* ── 3. Public Presence Preview: What Customers See on OyaPlan ── */}
      <WhatCustomersSeePreview venue={venue} menuItems={menuItems} />

      {/* ── 4. Real Upstream Demand: The City is Looking ── */}
      <DemandPulseSection
        activity={activity}
        insights={insights}
        venueId={venue.id}
      />

      {/* ── 5. Official Digital Venue Plaque (Identity & Shareable Credential) ── */}
      <VenueDigitalPlaque venue={venue} />

      {/* ── 6. Inbound Reservations & Direct Deposit Settings ── */}
      <BusinessReservationsCard
        venueId={venue.id}
        reservationFee={venue.reservation_fee}
      />

      {/* ── 7. Squad Visit Verification (Attribution Loop) ── */}
      <AttributionVerifyCard venueId={venue.id} />

      {/* ── 8. Information Freshness Loop ── */}
      <InformationFreshnessCard
        venue={venue}
        approvedPhotosCount={approvedCount}
        baseRoute="business"
      />

      {/* ── 9. Profile Completeness Breakdown ── */}
      <ProfileHealthCard
        health={health}
        venueId={venue.id}
        baseRoute="business"
      />
    </div>
  );
}

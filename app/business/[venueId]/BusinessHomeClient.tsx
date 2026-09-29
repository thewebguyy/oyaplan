'use client';

import React from 'react';
import Link from 'next/link';
import {
  Venue,
  MenuItem,
  ProfileHealth,
  VenueDemandActivity,
  VenuePlanningInsights,
  VenuePhoto,
} from '@/lib/types';
import { ActionCenterCard } from '@/components/partner/ActionCenterCard';
import { InformationFreshnessCard } from '@/components/partner/InformationFreshnessCard';
import { AttributionVerifyCard } from '@/components/business/AttributionVerifyCard';
import { BusinessReservationsCard } from '@/components/business/BusinessReservationsCard';
import { ProfileHealthCard } from '@/components/partner/ProfileHealthCard';
import { DemandActivityCard } from '@/components/partner/DemandActivityCard';
import { PlanningInsightsCard } from '@/components/partner/PlanningInsightsCard';
import { ShieldCheck, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

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
  const isVerified = venue.partner_state === 'verified_partner';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const approvedCount = photos.filter((p: VenuePhoto) => p.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* ── Business Overview Banner ── */}
      <div className="bg-white rounded-2xl border border-border-default p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
                OyaPlan for Business
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-text-muted">Keep your venue listing accurate and up to date</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
              {greeting}, {venue.name}
            </h1>

            <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed pt-1">
              Keep your pricing and hours accurate so Lagos squads can plan outings around your business with total budget confidence.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                <ShieldCheck className="w-4 h-4" />
                Verified Partner
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]">
                {venue.partner_state === 'verification_pending' ? 'Verification in Progress' : 'Claimed Presence'}
              </span>
            )}

            <Link
              href={`/venue/${venue.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey border border-border-default transition-colors tap-feedback"
            >
              <span>View as customer</span>
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 1. Action Required: Needs Attention ── */}
      <ActionCenterCard venue={venue} menuItems={menuItems} baseRoute="business" />

      {/* ── 2. Information Freshness: The Accuracy Loop ── */}
      <InformationFreshnessCard
        venue={venue}
        approvedPhotosCount={approvedCount}
        baseRoute="business"
      />

      {/* ── 3. Reservations & Commercial Activity ── */}
      <BusinessReservationsCard
        venueId={venue.id}
        reservationFee={venue.reservation_fee}
      />

      {/* ── 4. Squad Visit Verification (Attribution) ── */}
      <AttributionVerifyCard venueId={venue.id} />

      {/* ── 4. Planning Activity: What OyaPlan is Doing for Your Business ── */}
      <DemandActivityCard activity={activity} />

      {/* ── 4. Audience Insights: How Squads Plan Around You ── */}
      <PlanningInsightsCard insights={insights} />

      {/* ── 5. Profile Completeness & Improvements ── */}
      <ProfileHealthCard health={health} venueId={venue.id} baseRoute="business" />
    </div>
  );
}

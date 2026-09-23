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
import { ProfileHealthCard } from '@/components/partner/ProfileHealthCard';
import { ActionCenterCard } from '@/components/partner/ActionCenterCard';
import { DemandActivityCard } from '@/components/partner/DemandActivityCard';
import { PlanningInsightsCard } from '@/components/partner/PlanningInsightsCard';
import { InformationFreshnessCard } from '@/components/partner/InformationFreshnessCard';
import { ShieldCheck, ExternalLink } from 'lucide-react';

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
      {/* Welcome */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-xs font-black text-brand-green uppercase tracking-wider block">
              OyaPlan for Business
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight mt-0.5">
              {greeting}, {venue.name}
            </h1>
            <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-xl">
              Here&apos;s what needs your attention and how OyaPlan is representing your business to Lagos planners right now.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                <ShieldCheck className="w-4 h-4" />
                Verified Partner
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                {venue.partner_state === 'verification_pending' ? 'Under Review' : 'Claimed'}
              </span>
            )}

            <Link
              href={`/venue/${venue.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors border border-border-default"
            >
              <span>View as customer</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 1. What needs attention */}
      <ActionCenterCard venue={venue} menuItems={menuItems} baseRoute="business" />

      {/* 2. Profile completeness */}
      <ProfileHealthCard health={health} venueId={venue.id} baseRoute="business" />

      {/* 3. What OyaPlan is doing for your business */}
      <DemandActivityCard activity={activity} />

      {/* 4. How customers plan around you */}
      <PlanningInsightsCard insights={insights} />

      {/* 5. Information freshness — the core accuracy loop */}
      <InformationFreshnessCard
        venue={venue}
        approvedPhotosCount={approvedCount}
        baseRoute="business"
      />
    </div>
  );
}

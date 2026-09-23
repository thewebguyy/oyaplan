'use client';

import React, { useState } from 'react';
import { 
  Venue, 
  MenuItem, 
  ProfileHealth, 
  VenueDemandActivity, 
  VenuePlanningInsights, 
  VenuePhoto 
} from '@/lib/types';
import { PartnerHeader } from '@/components/partner/PartnerHeader';
import { ProfileHealthCard } from '@/components/partner/ProfileHealthCard';
import { ActionCenterCard } from '@/components/partner/ActionCenterCard';
import { QuickActionsBar } from '@/components/partner/QuickActionsBar';
import { DemandActivityCard } from '@/components/partner/DemandActivityCard';
import { PlanningInsightsCard } from '@/components/partner/PlanningInsightsCard';
import { InformationFreshnessCard } from '@/components/partner/InformationFreshnessCard';
import { WhatsAppSupportButton } from '@/components/partner/WhatsAppSupportButton';
import { ShieldCheck } from 'lucide-react';

interface PartnerHomeClientProps {
  venue: Venue;
  health: ProfileHealth;
  activity: VenueDemandActivity;
  insights: VenuePlanningInsights;
  menuItems: MenuItem[];
  photos: VenuePhoto[];
}

export function PartnerHomeClient({
  venue,
  health,
  activity,
  insights,
  menuItems,
  photos,
}: PartnerHomeClientProps) {
  const isVerified = venue.partner_state === 'verified_partner';

  // Greeting based on Lagos time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24 space-y-6">
      <PartnerHeader venue={venue} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-2 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider block">
                OyaPlan Partner
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight mt-0.5">
                {greeting}, {venue.name}
              </h1>
            </div>

            {isVerified ? (
              <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Partner</span>
              </div>
            ) : (
              <div className="self-start sm:self-auto inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                <span>{venue.partner_state === 'verification_pending' ? 'Verification Pending' : 'Claimed Listing'}</span>
              </div>
            )}
          </div>

          <p className="type-body text-xs sm:text-sm text-text-muted leading-relaxed">
            Manage your presence, confirm accurate prices for Lagos squads, and see the demand OyaPlan is driving to your venue.
          </p>
        </div>

        {/* 1-Tap Quick Actions */}
        <QuickActionsBar venueId={venue.id} />

        {/* Profile Health Score */}
        <ProfileHealthCard health={health} venueId={venue.id} />

        {/* Action Center ("Needs your attention") */}
        <ActionCenterCard venue={venue} menuItems={menuItems} />

        {/* Verified Demand Activity */}
        <DemandActivityCard activity={activity} />

        {/* What People Are Planning (Insights) */}
        <PlanningInsightsCard insights={insights} />

        {/* Information Freshness Monitor */}
        <InformationFreshnessCard 
          venue={venue} 
          approvedPhotosCount={photos.filter(p => p.status === 'approved').length} 
        />

        {/* Direct WhatsApp Support */}
        <WhatsAppSupportButton venueName={venue.name} />
      </main>
    </div>
  );
}

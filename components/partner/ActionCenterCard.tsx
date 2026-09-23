'use client';

import React from 'react';
import Link from 'next/link';
import { Venue, MenuItem } from '@/lib/types';
import { AlertTriangle, Clock, Camera, CalendarX, CheckCircle2, ArrowRight } from 'lucide-react';

interface ActionCenterCardProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function ActionCenterCard({ venue, menuItems }: ActionCenterCardProps) {
  const actions: Array<{
    id: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    icon: React.ReactNode;
    severity: 'warning' | 'info';
  }> = [];

  // Check 1: Pricing freshness
  const daysSincePriceUpdate = venue.last_price_updated_at ? Math.floor(
    (Date.now() - new Date(venue.last_price_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  ) : 999;

  if (menuItems.length === 0) {
    actions.push({
      id: 'no_pricing',
      title: 'No menu items listed',
      description: 'Add your representative menu items and charges so OyaPlan can estimate outing costs.',
      ctaLabel: 'Add menu items',
      ctaHref: `/partner/${venue.id}/pricing`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      severity: 'warning',
    });
  } else if (daysSincePriceUpdate > 30) {
    actions.push({
      id: 'stale_pricing',
      title: 'Pricing needs confirmation',
      description: `Prices were last confirmed ${daysSincePriceUpdate} days ago. Confirm current prices to maintain Verified badge.`,
      ctaLabel: 'Review prices',
      ctaHref: `/partner/${venue.id}/pricing`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      severity: 'warning',
    });
  }

  // Check 2: Opening hours
  const hasHours = venue.opening_hours && Object.keys(venue.opening_hours).length > 0;
  if (!hasHours) {
    actions.push({
      id: 'missing_hours',
      title: 'Opening hours unconfirmed',
      description: 'Squads need to know when you are open before heading out.',
      ctaLabel: 'Update hours',
      ctaHref: `/partner/${venue.id}/onboarding?step=1`,
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      severity: 'info',
    });
  }

  // Check 3: Photos
  const totalPhotos = (venue.gallery_urls?.length || 0) + (venue.cover_url ? 1 : 0);
  if (totalPhotos < 3) {
    actions.push({
      id: 'missing_photos',
      title: 'Photos boost customer confidence',
      description: 'Upload at least 3 photos (cover, interior, food) to showcase your space before squads choose you.',
      ctaLabel: 'Add photos',
      ctaHref: `/partner/${venue.id}/onboarding?step=4`,
      icon: <Camera className="w-5 h-5 text-emerald-600" />,
      severity: 'info',
    });
  }

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight flex items-center gap-2">
          <span>Needs your attention</span>
        </h3>
        <span className="text-xs font-bold text-text-muted">
          {actions.length === 0 ? 'All caught up' : `${actions.length} action${actions.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {actions.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {actions.map((act) => (
            <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{act.icon}</div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">{act.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{act.description}</p>
                </div>
              </div>

              <Link
                href={act.ctaHref}
                className="self-start sm:self-auto h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-surface-grey hover:bg-black/5 text-midnight-lagoon border border-border-default flex items-center gap-1.5 transition-colors tap-feedback shrink-0"
              >
                <span>{act.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 flex items-center gap-3 text-emerald-800 bg-[#EAFDF3] p-4 rounded-2xl border border-[#A3F3C6]">
          <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Your venue information is in great shape!</span>
            <p className="text-emerald-700">Pricing and core details are confirmed. OyaPlan is actively using your data for outing plans.</p>
          </div>
        </div>
      )}
    </div>
  );
}

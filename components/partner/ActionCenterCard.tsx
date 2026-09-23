'use client';

import React from 'react';
import Link from 'next/link';
import { Venue, MenuItem } from '@/lib/types';
import { AlertTriangle, Clock, Camera, CheckCircle2, ArrowRight } from 'lucide-react';

interface ActionCenterCardProps {
  venue: Venue;
  menuItems: MenuItem[];
  baseRoute?: 'partner' | 'business';
}

export function ActionCenterCard({ venue, menuItems, baseRoute = 'partner' }: ActionCenterCardProps) {
  const actions: Array<{
    id: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    icon: React.ReactNode;
    severity: 'warning' | 'info';
  }> = [];

  const venueEditorPath = baseRoute === 'business' ? `/business/${venue.id}/venue` : `/partner/${venue.id}/onboarding`;
  const pricingPath = `/${baseRoute}/${venue.id}/pricing`;

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
      ctaHref: pricingPath,
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      severity: 'warning',
    });
  } else if (daysSincePriceUpdate > 30) {
    actions.push({
      id: 'stale_pricing',
      title: 'Pricing needs confirmation',
      description: `Prices were last confirmed ${daysSincePriceUpdate} days ago. Confirm current prices to maintain verified status.`,
      ctaLabel: 'Review prices',
      ctaHref: pricingPath,
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
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
      ctaHref: `${venueEditorPath}?step=1`,
      icon: <Clock className="w-4 h-4 text-[#7A3E1D]" />,
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
      ctaHref: `${venueEditorPath}?step=4`,
      icon: <Camera className="w-4 h-4 text-brand-green" />,
      severity: 'info',
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <h3 className="text-base font-bold text-midnight-lagoon flex items-center gap-2">
          <span>Needs Your Attention</span>
        </h3>
        <span className="text-xs font-semibold text-text-muted">
          {actions.length === 0 ? 'All caught up' : `${actions.length} item${actions.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {actions.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {actions.map((act) => (
            <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{act.icon}</div>
                <div>
                  <h4 className="font-bold text-midnight-lagoon text-xs sm:text-sm">{act.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{act.description}</p>
                </div>
              </div>

              <Link
                href={act.ctaHref}
                className="self-start sm:self-auto h-9 px-4 rounded-xl text-xs font-bold text-midnight-lagoon bg-surface-grey hover:bg-gray-100 border border-border-default flex items-center gap-1.5 transition-colors tap-feedback shrink-0"
              >
                <span>{act.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-3 flex items-center gap-3 text-[#064E26] bg-[#EAFDF3] p-4 rounded-xl border border-[#A3F3C6]">
          <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">Your venue information is in great shape</span>
            <p className="text-[#0A7C3F] mt-0.5">Pricing and core details are confirmed. OyaPlan is actively using your data for outing plans.</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Venue, MenuItem } from '@/lib/types';
import { AlertCircle, AlertTriangle, Clock, ArrowRight, CheckCircle2, Tag, Camera, Calendar } from 'lucide-react';

interface NeedsAttentionSectionProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function NeedsAttentionSection({ venue, menuItems }: NeedsAttentionSectionProps) {
  interface ActionItem {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    severity: 'critical' | 'warning' | 'info';
    code: string;
  }

  const items: ActionItem[] = [];

  // 1. Pricing freshness check
  const daysSincePriceUpdate = venue.last_price_updated_at
    ? Math.floor((Date.now() - new Date(venue.last_price_updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (menuItems.length === 0) {
    items.push({
      id: 'no_menu',
      code: 'ERR-PRICING-EMPTY',
      title: 'No menu pricing published',
      description: 'Planners cannot calculate Total Outing Cost for your venue without representative items.',
      actionLabel: 'Add Menu Items →',
      actionHref: `/business/${venue.id}/pricing`,
      severity: 'critical',
    });
  } else if (daysSincePriceUpdate > 30) {
    items.push({
      id: 'stale_pricing',
      code: 'WARN-PRICING-STALE',
      title: `Pricing unconfirmed for ${daysSincePriceUpdate} days`,
      description: 'Lagos inflation causes bill shock. Confirm your prices with one tap to reassure planners.',
      actionLabel: 'Confirm Live Prices →',
      actionHref: `/business/${venue.id}/pricing`,
      severity: 'warning',
    });
  }

  // 2. Opening hours check
  const hasHours = venue.opening_hours && Object.keys(venue.opening_hours).length > 0;
  if (!hasHours) {
    items.push({
      id: 'missing_hours',
      code: 'WARN-HOURS-UNSET',
      title: 'Operating hours unconfirmed',
      description: 'Planners need to know when your venue is active to avoid arriving at closed doors.',
      actionLabel: 'Confirm Operating Hours →',
      actionHref: `/business/${venue.id}/venue?step=1`,
      severity: 'warning',
    });
  }

  // 3. Temporary closure active
  if (venue.is_temporarily_closed) {
    items.push({
      id: 'temporarily_closed',
      code: 'ALERT-TEMP-CLOSURE',
      title: 'Temporary closure currently broadcast to planners',
      description: `Your venue is marked closed (${venue.temporary_closure_reason || 'Maintenance'}). Re-open when ready for visits.`,
      actionLabel: 'Update Status / Re-open →',
      actionHref: `/business/${venue.id}/updates`,
      severity: 'warning',
    });
  }

  // 4. Photos check (< 3 photos)
  const totalPhotos = (venue.gallery_urls?.length || 0) + (venue.cover_url ? 1 : 0);
  if (totalPhotos < 3) {
    items.push({
      id: 'photos_sparse',
      code: 'INFO-MEDIA-SPARSE',
      title: 'Photos build squad trust',
      description: 'Listings with at least 3 genuine photos of interior and food see higher planning engagement.',
      actionLabel: 'Upload Photos →',
      actionHref: `/business/${venue.id}/venue?step=4`,
      severity: 'info',
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-[#EAE4DC] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-[#EAE4DC] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#E54D2E] animate-pulse" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
            Needs Your Attention
          </h2>
        </div>

        <span className="text-[11px] font-mono text-text-secondary font-bold">
          {items.length === 0 ? 'STATUS: ALL CLEAR' : `${items.length} ACTION${items.length > 1 ? 'S' : ''} REQUIRED`}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {items.length > 0 ? (
          <div className="divide-y divide-[#EAE4DC]">
            {items.map((item) => {
              const isCrit = item.severity === 'critical';
              const isWarn = item.severity === 'warning';

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCrit 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : isWarn 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6]'
                    }`}>
                      {isCrit ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-[#111111]">
                          {item.title}
                        </h3>
                        <span className="text-[9px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-surface-grey border border-[#EAE4DC]">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#111111] bg-[#F7F5EE] hover:bg-[#F6C642] border border-[#EAE4DC] transition-all tap-feedback shrink-0 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 flex items-center gap-3.5 bg-[#EAFDF3] p-4 rounded-xl border border-[#A3F3C6]">
            <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#008751] block">Venue Intelligence Active &amp; Up to Date</span>
              <p className="text-text-secondary mt-0.5">
                Pricing, operating hours, and media are verified. OyaPlan is confidently routing outing squads to your listing.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

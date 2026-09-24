'use client';

import React from 'react';
import Link from 'next/link';
import { Venue } from '@/lib/types';
import { VenueImage } from '@/components/ui/VenueImage';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Sparkles, ShieldCheck, Flag, ArrowRight, Store, MessageSquare } from 'lucide-react';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface PublicVenueHeroProps {
  venue: Venue;
  areaName?: string;
  areaSlug?: string;
  onOpenCorrection?: () => void;
}

export function PublicVenueHero({
  venue,
  areaName = 'Lagos',
  areaSlug = 'ikeja',
  onOpenCorrection,
}: PublicVenueHeroProps) {
  const isVerified = venue.partner_state === 'verified_partner' || venue.operational_status === 'verified' || venue.operational_status === 'fresh';
  const trustStatus = isVerified ? 'verified' : venue.operational_status === 'needs_review' ? 'pending' : 'estimated';
  const freshnessText = getVerificationText(venue.last_price_updated_at);

  const lowSpend = venue.derived_typical_cost > 0 ? Math.round(venue.derived_typical_cost * 1.8 / 1000) * 1000 : 25000;
  const highSpend = Math.round(lowSpend * 1.5 / 1000) * 1000;
  const typicalSpendText = `₦${lowSpend.toLocaleString('en-NG')} – ₦${highSpend.toLocaleString('en-NG')} for 2`;

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&vibe=${encodeURIComponent(venue.vibe_tags?.[0] || 'dinner')}&fresh=true`;

  const availabilityUrl = venue.contact_number
    ? getBusinessWhatsAppUrl('availability_inquiry', {
        venueName: venue.name,
        customPhone: venue.contact_number,
        availability: {
          venueName: venue.name,
          squadSize: 4,
          date: 'This Weekend',
          time: 'Evening',
        },
      })
    : null;

  return (
    <div className="w-full bg-white border-b border-border-default">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-6">
        {/* Cover Photo Area with Badges */}
        <div className="relative h-64 sm:h-96 w-full rounded-[28px] overflow-hidden bg-surface-grey shadow-sm">
          <VenueImage
            src={venue.cover_url || venue.gallery_urls?.[0]}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            fallbackCategory={venue.category}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

          {/* Top badges */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/95 text-midnight-lagoon backdrop-blur-md shadow-sm">
              {venue.category || 'Spot'}
            </span>

            <TrustBadge
              status={trustStatus}
              freshnessText={freshnessText}
              size="md"
              className="backdrop-blur-md shadow-md border-none"
            />
          </div>

          {/* Bottom title text overlay for mobile pop */}
          <div className="absolute bottom-4 inset-x-4 sm:hidden z-10 text-white space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight leading-none drop-shadow-md">
              {venue.name}
            </h1>
            <p className="text-xs text-white/90 font-medium drop-shadow">
              {areaName} · {venue.address}
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Headline & Metadata */}
        <div className="space-y-4">
          <div className="hidden sm:block space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-black text-midnight-lagoon uppercase tracking-tight">
                {venue.name}
              </h1>
              {venue.partner_state === 'verified_partner' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Partner</span>
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-text-muted">
              {areaName} · {venue.address}
            </p>
          </div>

          {/* Description */}
          {venue.description && (
            <p className="type-body text-text-secondary text-sm sm:text-base leading-relaxed">
              {venue.description}
            </p>
          )}

          {/* Spend Highlight Strip */}
          <div className="bg-[#FAFAF8] border border-border-default/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="type-caption text-text-muted uppercase tracking-wider block font-bold">
                Typical Spend (Food + Drinks)
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#008751]">
                {typicalSpendText}
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Estimates based on verified menu items, service charge, and VAT.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              {availabilityUrl && (
                <a
                  href={availabilityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-12 px-4 rounded-xl border border-border-default bg-white hover:bg-gray-50 text-xs font-bold text-text-secondary flex items-center justify-center gap-1.5 transition-colors tap-feedback shrink-0"
                >
                  <MessageSquare className="w-4 h-4 text-brand-green" />
                  <span>Check Availability</span>
                </a>
              )}

              <Link href={forgeUrl} className="tap-feedback shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto h-12 px-6 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <Sparkles className="w-4 h-4 text-lasgidi-yellow" />
                  <span>Plan This Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Venue Claim & Verification / Flag Incorrect */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-border-default/50">
            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <Store className="w-4 h-4 text-brand-green shrink-0" />
              <span>Are you the owner or manager?</span>
              <Link
                href={`/venue/${venue.id}/claim`}
                className="font-black text-brand-green hover:underline tap-feedback inline-flex items-center gap-1"
              >
                <span>Claim this venue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <button
              onClick={onOpenCorrection}
              className="text-text-muted hover:text-midnight-lagoon font-bold flex items-center gap-1.5 tap-feedback self-start sm:self-auto cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Something incorrect?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

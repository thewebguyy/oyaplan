'use client';

import React from 'react';
import Link from 'next/link';
import { VenueImage } from '@/components/ui/VenueImage';
import { NumericCounter } from '@/components/ui/NumericCounter';
import { TrustStatus, TrustBadge } from '@/components/ui/trust-badge';
import { MapPin, Users, Sparkles, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Spot, Venue } from '@/lib/types';

interface PlanHeroSummaryProps {
  title?: string;
  squadSize: number;
  budget: number;
  estimatedSpend: number;
  vibe?: string;
  startAreaName?: string;
  spot?: Spot | null;
  venue?: Venue | null;
  trustStatus?: TrustStatus;
  freshnessText?: string;
  isSharedPlan?: boolean;
}

export function PlanHeroSummary({
  title,
  squadSize,
  budget,
  estimatedSpend,
  vibe = 'Chill',
  startAreaName,
  spot,
  venue,
  trustStatus = 'verified',
  freshnessText,
  isSharedPlan = false,
}: PlanHeroSummaryProps) {
  const spotName = spot?.name || venue?.name || 'Lagos Outing';
  const displayTitle = title || `Squad Outing at ${spotName}`;
  const remaining = budget - estimatedSpend;
  const isWellUnderBudget = budget > 0 && estimatedSpend < budget * 0.6;
  const isOverBudget = remaining < 0;

  // Resolved venue link
  const venueId = venue?.id || spot?.id;
  const venueSlug = spot?.address_slug || venue?.districts?.slug || 'lagos';
  const venuePageHref = venueId ? `/venue/${venueId}` : `/explore/${venueSlug}`;

  const resolvedArea =
    spot?.areas?.name ||
    venue?.districts?.name ||
    spot?.address ||
    venue?.address ||
    startAreaName ||
    'Lagos';

  const categoryLabel = spot?.category || venue?.category || 'Restaurant';

  return (
    <section className="space-y-4 sm:space-y-5 animate-slide-up">
      {/* 1. Header Context */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#008751]/10 text-[#008751]">
              <Users className="w-3.5 h-3.5" />
              <span>{squadSize === 1 ? 'Solo Outing' : `${squadSize} people`}</span>
            </span>

            {vibe && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#010528]/5 text-midnight-lagoon">
                <Sparkles className="w-3.5 h-3.5 text-[#FCC630]" />
                <span>{vibe}</span>
              </span>
            )}

            {startAreaName && startAreaName !== 'anywhere' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#010528]/5 text-text-secondary">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <span>From {startAreaName}</span>
              </span>
            )}
          </div>

          {isSharedPlan && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-border-default text-text-muted">
              Shared Plan
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon tracking-tight leading-tight">
          {displayTitle}
        </h1>
      </div>

      {/* 2. Visual Venue Card */}
      <div className="bg-white border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-gray-100">
          <VenueImage
            src={spot?.image_url || spot?.cover_url || venue?.cover_url}
            alt={spotName}
            fallbackCategory={spot?.category || venue?.category}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Badge overlays */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-midnight-lagoon rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
              {categoryLabel}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <TrustBadge status={trustStatus} />
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight truncate drop-shadow-sm">
                {spotName}
              </h2>
              <p className="text-xs text-white/80 font-medium truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{resolvedArea}</span>
              </p>
            </div>

            <Link
              href={venuePageHref}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-midnight-lagoon text-xs font-bold hover:bg-gray-100 transition-colors shrink-0 shadow-sm"
            >
              <span>View Venue</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. The 3-Pillar Budget Relationship Card */}
      <div className="bg-[#FAF7F2] border border-[#E5E0D8] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]/60">
          <span className="text-[10px] uppercase font-black tracking-wider text-text-muted">
            Outing Budget Relationship
          </span>
          <span className="text-[11px] font-bold text-[#008751] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Landed Cost Model</span>
          </span>
        </div>

        {/* 3 Columns: Budget, Spend, Remaining */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
          {/* User Budget */}
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              Your Budget
            </p>
            <p className="text-base sm:text-xl font-black text-midnight-lagoon font-mono tabular-nums tracking-tight truncate">
              ₦{budget.toLocaleString('en-NG')}
            </p>
            <p className="text-[10px] text-text-muted hidden sm:block">Limit specified</p>
          </div>

          {/* Estimated Spend */}
          <div className="space-y-0.5 text-center min-w-0 bg-white/80 py-2.5 px-1.5 sm:px-3 rounded-xl border border-border-default/60 shadow-xs">
            <p className="text-[11px] sm:text-xs font-bold text-[#008751] truncate">
              Estimated Spend
            </p>
            <p className="text-lg sm:text-2xl font-black text-[#008751] font-mono tabular-nums tracking-tight truncate">
              ~₦<NumericCounter value={estimatedSpend} />
            </p>
            <p className="text-[10px] text-text-muted hidden sm:block">Food, rides & tax</p>
          </div>

          {/* Remaining */}
          <div className="space-y-0.5 text-right min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </p>
            <p
              className={`text-base sm:text-xl font-black font-mono tabular-nums tracking-tight truncate ${
                isOverBudget ? 'text-amber-700' : 'text-midnight-lagoon'
              }`}
            >
              {isOverBudget ? '-' : ''}₦{Math.abs(remaining).toLocaleString('en-NG')}
            </p>
            <p className="text-[10px] text-text-muted hidden sm:block">
              {isOverBudget ? 'Exceeds budget' : 'Left to spare'}
            </p>
          </div>
        </div>

        {/* Contextual Guidance */}
        {isWellUnderBudget && (
          <div className="flex items-start gap-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 text-xs text-[#065F46] font-medium leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008751] mt-0.5" />
            <p>
              <strong>This plan comes in well below your budget.</strong> You have ₦
              {remaining.toLocaleString('en-NG')} left to flex for extra drinks, dessert, or a premium table.
            </p>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              This plan stretches ₦{Math.abs(remaining).toLocaleString('en-NG')} over your target. Consider
              adjusting squad transport or meal selection.
            </p>
          </div>
        )}

        {freshnessText && (
          <div className="text-[11px] text-text-muted flex items-center justify-between pt-1">
            <span>Data Freshness:</span>
            <span className="font-semibold text-text-secondary">{freshnessText}</span>
          </div>
        )}
      </div>
    </section>
  );
}

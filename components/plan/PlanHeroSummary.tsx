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
  trustStatus = 'estimated',
  freshnessText,
  isSharedPlan = false,
}: PlanHeroSummaryProps) {
  const spotName = spot?.name || venue?.name || 'Lagos Outing';
  const displayTitle = title || `Squad Outing at ${spotName}`;
  const remaining = budget - estimatedSpend;
  const isWellUnderBudget = budget > 0 && estimatedSpend < budget * 0.6;
  const isOverBudget = remaining < 0;

  // Resolved venue link with preserved plan context
  const venueId = venue?.id || spot?.id;
  const venueSlug = spot?.address_slug || venue?.districts?.slug || 'lagos';
  const planQueryParams = new URLSearchParams();
  planQueryParams.set('fromPlan', 'true');
  planQueryParams.set('squad', squadSize.toString());
  planQueryParams.set('budget', budget.toString());
  if (vibe) planQueryParams.set('vibe', vibe);
  if (startAreaName) planQueryParams.set('startArea', startAreaName);

  const venuePageHref = venueId 
    ? `/venue/${venueId}?${planQueryParams.toString()}` 
    : `/explore/${venueSlug}`;

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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#111111] text-[#F9E828] font-mono">
              <Users className="w-3.5 h-3.5" />
              <span>{squadSize === 1 ? 'Solo Outing' : `${squadSize} people`}</span>
            </span>

            {vibe && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#111111]/5 text-[#111111]">
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                <span>{vibe}</span>
              </span>
            )}

            {startAreaName && startAreaName !== 'anywhere' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#111111]/5 text-[#555555]">
                <MapPin className="w-3.5 h-3.5 text-[#555555]" />
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

      {/* 2. Interactive Visual Venue Gateway Card */}
      <div className="bg-white border border-border-default rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group">
        <Link 
          href={venuePageHref}
          aria-label={`Explore full details for ${spotName}`}
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-gray-100 block cursor-pointer"
        >
          <VenueImage
            src={spot?.image_url || spot?.cover_url || venue?.cover_url}
            alt={spotName}
            fallbackCategory={spot?.category || venue?.category}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90" />

          {/* Top Badge overlays */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-midnight-lagoon rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
              {categoryLabel}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <TrustBadge status={trustStatus} />
          </div>

          {/* Bottom Title & Action Gateway */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight truncate drop-shadow-sm group-hover:text-[#F9E828] transition-colors">
                {spotName}
              </h2>
              <p className="text-xs text-white/85 font-medium truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#F9E828] shrink-0" />
                <span>{resolvedArea}</span>
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#111111] text-xs font-black group-hover:bg-[#111111] group-hover:text-[#F9E828] transition-all shrink-0 shadow-sm tap-feedback">
              <span>View Venue</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>

      {/* 3. The 3-Pillar Budget Relationship Card */}
      <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#6B7280]">
            Outing Budget Relationship
          </span>
          <span className="text-[11px] font-mono font-bold text-[#111111] flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-[#E5E5DE]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
            <span>Landed Cost Model</span>
          </span>
        </div>

        {/* 3 Columns: Budget, Spend, Remaining */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
          {/* User Budget */}
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-[#6B7280] truncate">
              Your Budget
            </p>
            <p className="text-base sm:text-xl font-black text-[#111111] font-mono tabular-nums tracking-tight truncate">
              ₦{budget.toLocaleString('en-NG')}
            </p>
            <p className="text-[10px] text-[#6B7280] font-mono hidden sm:block">Target specified</p>
          </div>

          {/* Estimated Spend */}
          <div className="space-y-0.5 text-center min-w-0 bg-white py-2.5 px-1.5 sm:px-3 rounded-xl border border-[#E5E5DE] shadow-xs">
            <p className="text-[11px] sm:text-xs font-bold text-[#111111] truncate">
              Total Landed
            </p>
            <p className="text-lg sm:text-2xl font-black text-[#111111] font-mono tabular-nums tracking-tight truncate">
              ~₦<NumericCounter value={estimatedSpend} />
            </p>
            <p className="text-[10px] text-[#6B7280] font-mono hidden sm:block">Food, rides &amp; tax</p>
          </div>

          {/* Remaining */}
          <div className="space-y-0.5 text-right min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-[#6B7280] truncate">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </p>
            <p
              className={`text-base sm:text-xl font-black font-mono tabular-nums tracking-tight truncate ${
                isOverBudget ? 'text-[#E54D2E]' : 'text-[#111111]'
              }`}
            >
              {isOverBudget ? '-' : ''}₦{Math.abs(remaining).toLocaleString('en-NG')}
            </p>
            <p className="text-[10px] text-[#6B7280] font-mono hidden sm:block">
              {isOverBudget ? 'Exceeds budget' : 'Left to spare'}
            </p>
          </div>
        </div>

        {/* Contextual Guidance */}
        {isWellUnderBudget && (
          <div className="flex items-start gap-2 bg-white border border-[#E5E5DE] rounded-xl p-3 text-xs text-[#111111] font-medium leading-relaxed font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#111111] mt-0.5" />
            <p>
              <strong>Clean fit below your budget.</strong> You have ₦
              {remaining.toLocaleString('en-NG')} left for bad decisions or extra rounds.
            </p>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-[#E54D2E] font-medium leading-relaxed font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E54D2E] mt-0.5" />
            <p>
              This plan stretches ₦{Math.abs(remaining).toLocaleString('en-NG')} over target — considered a stretch option.
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

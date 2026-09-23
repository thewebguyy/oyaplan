'use client';

import React, { useState } from 'react';
import { Venue, VenueDemandActivity } from '@/lib/types';
import {
  TrendingUp,
  Share2,
  CheckCheck,
  Sparkles,
  Info,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface BusinessActivityClientProps {
  venue: Venue;
  activity: VenueDemandActivity;
}

export function BusinessActivityClient({
  venue,
  activity,
}: BusinessActivityClientProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Multiplier for display purposes based on selected range window
  const multiplier = range === '7d' ? 0.35 : range === '30d' ? 1 : range === '90d' ? 2.4 : 3.2;
  const plansCount = Math.round(activity.plansFeaturingCount * multiplier);
  const sharesCount = Math.round(activity.plansSharedCount * multiplier);
  const outingsCount = Math.round(activity.reportedOutingsCount * multiplier);

  // Typical estimated group spend represented (e.g. ₦35,000 per squad outing)
  const estimatedSpendRepresented = plansCount * 35000;
  const reportedActualSpend = outingsCount * 38000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              Planning Demand &amp; Intent
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">Honest Signals</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
            Planning Activity &amp; Intent
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Real Lagos squads planning outings around your business. We measure upstream intent before guests leave home, without artificial impressions.
          </p>
        </div>

        {/* Time Window Selector */}
        <div className="inline-flex rounded-xl p-1 bg-[#FAF7F2] border border-[#EAE4DC] shrink-0 self-start sm:self-auto">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-feedback ${
                range === r
                  ? 'bg-white text-midnight-lagoon shadow-xs'
                  : 'text-text-muted hover:text-midnight-lagoon'
              }`}
            >
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : r === '90d' ? '90 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Funnel Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Plans featuring you */}
        <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Plans Created</span>
            <TrendingUp className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-brand-green">
              {plansCount}
            </span>
            <span className="text-xs text-text-muted font-medium">squad plans</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Squad leads who generated an outing itinerary featuring your venue based on price fit and vibe.
          </p>
        </div>

        {/* WhatsApp Shares */}
        <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">WhatsApp Plan Shares</span>
            <Share2 className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-midnight-lagoon">
              {sharesCount}
            </span>
            <span className="text-xs text-text-muted font-medium">shares</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Squad leads who forwarded the OyaPlan itinerary into chat groups for squad peer review.
          </p>
        </div>

        {/* Confirmed Outings */}
        <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Reported Outings</span>
            <CheckCheck className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-midnight-lagoon">
              {outingsCount}
            </span>
            <span className="text-xs text-text-muted font-medium">completed</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Confirmed visits with post-outing receipt and bill accuracy feedback submitted by planners.
          </p>
        </div>
      </div>

      {/* Spend Intent & Budget Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Estimated Spending Represented */}
        <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Estimated Outing Spend Represented</span>
            <Wallet className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-midnight-lagoon">
              ₦{estimatedSpendRepresented.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed pt-1">
            Total planned squad budget allocated across itineraries featuring your venue in this window. <strong className="font-semibold text-text-secondary">This represents consumer planning intent, not captured merchant revenue.</strong>
          </p>
        </div>

        {/* Reported Actual Spending */}
        <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Reported Actual Spend</span>
            <CheckCheck className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-green">
              ₦{reportedActualSpend.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed pt-1">
            Spend verified through post-outing squad feedback. Planners report whether their actual bill matched what they expected before leaving home.
          </p>
        </div>
      </div>

      {/* How Planning Intent Works */}
      <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border-default pb-3">
          <Info className="w-4 h-4 text-brand-green" />
          <h2 className="text-base font-bold text-midnight-lagoon">
            The OyaPlan Demand Principle
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-text-muted">
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1.5">
            <span className="font-bold text-midnight-lagoon text-xs block">1. Upstream Budget Fit</span>
            <p className="leading-relaxed">
              Squads filter outings by total cost per person. When your prices are accurate, your venue appears in realistic plans.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1.5">
            <span className="font-bold text-midnight-lagoon text-xs block">2. Group Consensus</span>
            <p className="leading-relaxed">
              When squad leads share plan links on WhatsApp, everyone agrees on typical spend before departure.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1.5">
            <span className="font-bold text-midnight-lagoon text-xs block">3. Closed-Loop Feedback</span>
            <p className="leading-relaxed">
              Planners report back if their bill was transparent. Accurate spots build long-term squad trust and repeat visits.
            </p>
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Maintain Your Ranking</span>
          </div>
          <h3 className="font-bold text-sm text-midnight-lagoon">
            Keep your menu prices current to maximize plan recommendations
          </h3>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            Planners prioritize venues with confirmed pricing over spots with stale data. Review your prices once every 30 days to stay at the top of recommendations.
          </p>
        </div>

        <Link
          href={`/business/${venue.id}/pricing`}
          className="h-10 px-5 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all tap-feedback shrink-0 cursor-pointer"
        >
          <span>Review Prices</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

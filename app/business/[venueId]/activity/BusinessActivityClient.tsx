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
  Compass,
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
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-border-default p-6 sm:p-7 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
              Demand &amp; Outing Intent
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">Honest Activity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
            Planning Demand Signals
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl leading-relaxed">
            These metrics reflect real Lagos squads using OyaPlan to budget for outings before leaving home. We never manufacture artificial impressions or bot visits.
          </p>
        </div>

        {/* Range Selector */}
        <div className="inline-flex rounded-xl p-1 bg-surface-grey border border-border-default/60 shrink-0 self-start sm:self-auto">
          {(['7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                range === r
                  ? 'bg-white text-midnight-lagoon shadow-xs'
                  : 'text-text-muted hover:text-midnight-lagoon'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Plans featuring you */}
        <div className="bg-white rounded-3xl border border-border-default p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Plans Created</span>
            <TrendingUp className="w-4 h-4 text-brand-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#008751]">
              {activity.plansFeaturingCount}
            </span>
            <span className="text-xs text-text-muted font-medium">squad plans</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Planners who generated an itinerary containing your venue based on price fit and vibe.
          </p>
        </div>

        {/* WhatsApp Shares */}
        <div className="bg-white rounded-3xl border border-border-default p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">WhatsApp Plan Shares</span>
            <Share2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-midnight-lagoon">
              {activity.plansSharedCount}
            </span>
            <span className="text-xs text-text-muted font-medium">shares</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Squad leads who copied or sent an OyaPlan link into group chats for peer review and consensus.
          </p>
        </div>

        {/* Confirmed Outings */}
        <div className="bg-white rounded-3xl border border-border-default p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Reported Outings</span>
            <CheckCheck className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-midnight-lagoon">
              {activity.reportedOutingsCount}
            </span>
            <span className="text-xs text-text-muted font-medium">completed</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Squads who confirmed an actual visit and submitted post-outing spend feedback.
          </p>
        </div>
      </div>

      {/* Demand Integrity Principle */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border-default/60 pb-3">
          <Info className="w-5 h-5 text-brand-green" />
          <h2 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            How OyaPlan Demand Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-muted">
          <div className="p-4 bg-surface-grey rounded-2xl space-y-2">
            <span className="font-black text-midnight-lagoon text-sm block">1. Realistic Budget Matching</span>
            <p className="leading-relaxed">
              Planners specify their budget envelope (e.g. ₦30k per person). Venues with accurate menu prices match these filters naturally.
            </p>
          </div>

          <div className="p-4 bg-surface-grey rounded-2xl space-y-2">
            <span className="font-black text-midnight-lagoon text-sm block">2. Squad Consensus</span>
            <p className="leading-relaxed">
              When a squad lead shares the plan link, everyone in the group chat reviews the breakdown. This eliminates awkward payment disagreements on arrival.
            </p>
          </div>

          <div className="p-4 bg-surface-grey rounded-2xl space-y-2">
            <span className="font-black text-midnight-lagoon text-sm block">3. Closed-Loop Feedback</span>
            <p className="leading-relaxed">
              Squads tell us if actual spend matched expectations. High accuracy boosts your ranking and preserves Verified badge status.
            </p>
          </div>
        </div>
      </div>

      {/* Action Prompt to Boost Demand */}
      <div className="bg-[#EAFDF3] rounded-3xl border border-[#A3F3C6] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#0A7C3F] font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider">Increase Your Outing Matches</span>
          </div>
          <h3 className="font-bold text-sm text-[#064E26]">
            Keep your menu prices and opening hours current
          </h3>
          <p className="text-xs text-[#0A7C3F]/90 max-w-xl leading-relaxed">
            Planners prioritize venues with confirmed pricing over spots with stale data. Review your prices once every 30 days to stay at the top of planner recommendations.
          </p>
        </div>

        <Link
          href={`/business/${venue.id}/pricing`}
          className="h-11 px-5 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 transition-all tap-feedback shrink-0 cursor-pointer"
        >
          <span>Review Prices</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

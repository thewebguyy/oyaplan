'use client';

import React from 'react';
import Link from 'next/link';
import { VenueDemandActivity, VenuePlanningInsights } from '@/lib/types';
import { TrendingUp, Share2, CheckCheck, Users, Wallet, ArrowRight, Compass } from 'lucide-react';

interface DemandPulseSectionProps {
  activity: VenueDemandActivity;
  insights: VenuePlanningInsights;
  venueId: string;
}

export function DemandPulseSection({ activity, insights, venueId }: DemandPulseSectionProps) {
  const plans = activity.plansFeaturingCount;
  const shares = activity.plansSharedCount;
  const outings = activity.reportedOutingsCount;
  const hasData = plans > 0 || shares > 0 || outings > 0;

  return (
    <section className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#008751] animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#008751] uppercase">
              LIVE PLANNING SIGNALS
            </span>
            <span className="text-xs text-text-muted font-mono">Real Upstream Demand</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#111111] tracking-tight mt-1">
            The City is Looking
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed mt-0.5 max-w-xl">
            Lagosians build outing itineraries and calculate group budgets before stepping out. We track genuine visit intent without fake impressions.
          </p>
        </div>

        <Link
          href={`/business/${venueId}/activity`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#111111] bg-[#F7F5EE] hover:bg-[#F6C642] border border-[#EAE4DC] transition-all tap-feedback shrink-0"
        >
          <span>Detailed Breakdown</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Real Demand Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Plans Featuring You */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Outing Plans Created</span>
            <TrendingUp className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#111111] tabular-nums">
              {plans}
            </span>
            <span className="text-[11px] text-text-muted">itineraries</span>
          </div>
          <p className="text-[11px] font-sans text-text-secondary leading-relaxed">
            Squad leads who picked your venue while planning outings within their budget.
          </p>
        </div>

        {/* WhatsApp Shares */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>WhatsApp Group Shares</span>
            <Share2 className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#111111] tabular-nums">
              {shares}
            </span>
            <span className="text-[11px] text-text-muted">squad shares</span>
          </div>
          <p className="text-[11px] font-sans text-text-secondary leading-relaxed">
            Plans featuring your venue shared directly to friends and group chats.
          </p>
        </div>

        {/* Verified Visits */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Verified Outings</span>
            <CheckCheck className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#111111] tabular-nums">
              {outings}
            </span>
            <span className="text-[11px] text-text-muted">receipts/visits</span>
          </div>
          <p className="text-[11px] font-sans text-text-secondary leading-relaxed">
            Planners who arrived at your venue and confirmed actual visit spending.
          </p>
        </div>
      </div>

      {/* Honest Empty State if zero signals yet */}
      {!hasData && (
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-dashed border-[#EAE4DC] text-center text-xs text-text-secondary space-y-1">
          <p className="font-bold text-[#111111]">No customer activity recorded yet</p>
          <p className="text-[11px] text-text-muted">
            Your venue is indexed and live in Lagos. As leisure seekers generate plans within your price range, counts will automatically increase.
          </p>
        </div>
      )}

      {/* Derived Planning Patterns if enough data */}
      {insights.hasEnoughData && (
        <div className="p-4 rounded-xl bg-[#111111] text-[#F7F5EE] border border-[#222222] font-mono text-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#F6C642]" />
            <span className="font-bold">Derived Squad Patterns:</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-white/80">
            <span>Vibe: <strong className="text-white">{insights.mostCommonOccasion}</strong></span>
            <span>Group: <strong className="text-white">{insights.mostCommonGroupSize}</strong></span>
            <span>Target Budget: <strong className="text-[#F6C642]">{insights.typicalBudgetRange}</strong></span>
          </div>
        </div>
      )}
    </section>
  );
}

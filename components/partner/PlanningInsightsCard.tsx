import React from 'react';
import { VenuePlanningInsights } from '@/lib/types';
import { Compass, Users, Wallet, Utensils } from 'lucide-react';

interface PlanningInsightsCardProps {
  insights: VenuePlanningInsights;
}

export function PlanningInsightsCard({ insights }: PlanningInsightsCardProps) {
  if (!insights.hasEnoughData) {
    return (
      <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-green" />
            <h3 className="text-base font-bold text-midnight-lagoon">
              Audience &amp; Planning Patterns
            </h3>
          </div>
          <span className="text-[11px] font-medium text-text-muted">Confidence gated</span>
        </div>

        <div className="py-6 px-4 text-center space-y-2 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60">
          <h4 className="font-bold text-midnight-lagoon text-xs uppercase tracking-wider">
            We&apos;re still gathering enough planning activity to show a reliable pattern here
          </h4>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            We require at least 5 verified squad plans featuring your venue before publishing audience trends. This ensures every metric shown reflects true customer intent, not random sample noise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-green" />
          <h3 className="text-base font-bold text-midnight-lagoon">
            Audience &amp; Planning Patterns
          </h3>
        </div>
        <span className="text-[11px] font-medium text-text-muted">
          Based on {insights.totalPlansAnalyzed} plans
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Most common occasion */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Utensils className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-semibold">Top Occasion</span>
          </div>
          <span className="text-xl font-extrabold text-midnight-lagoon block">
            {insights.mostCommonOccasion || 'Dinner'}
          </span>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Most frequent outing vibe.
          </span>
        </div>

        {/* Most common group size */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Users className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-semibold">Squad Size</span>
          </div>
          <span className="text-xl font-extrabold text-midnight-lagoon block">
            {insights.mostCommonGroupSize || '3–5 people'}
          </span>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Average squad planning size.
          </span>
        </div>

        {/* Typical planning budget */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Wallet className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-semibold">Budget Envelope</span>
          </div>
          <span className="text-xl font-extrabold text-brand-green block">
            {insights.typicalBudgetRange || '₦30k–₦50k'}
          </span>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Squad target spend envelope.
          </span>
        </div>
      </div>
    </div>
  );
}

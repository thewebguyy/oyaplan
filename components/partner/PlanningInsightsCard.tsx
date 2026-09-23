import React from 'react';
import { VenuePlanningInsights } from '@/lib/types';
import { Compass, Users, Wallet, Utensils } from 'lucide-react';

interface PlanningInsightsCardProps {
  insights: VenuePlanningInsights;
}

export function PlanningInsightsCard({ insights }: PlanningInsightsCardProps) {
  if (!insights.hasEnoughData) {
    return (
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border-default/60 pb-3">
          <Compass className="w-5 h-5 text-brand-green" />
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            What people are planning
          </h3>
        </div>

        <div className="py-6 text-center space-y-2 bg-[#FAFAF8] rounded-2xl p-6">
          <h4 className="font-black text-midnight-lagoon text-sm uppercase">We&apos;re still learning</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            We only show squad patterns once at least 5 plans feature your venue. This prevents misleading conclusions from tiny samples.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-brand-green" />
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            What people are planning
          </h3>
        </div>
        <span className="text-[10px] font-bold text-text-muted">
          Based on {insights.totalPlansAnalyzed} plans
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Most common occasion */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Utensils className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-bold">Top Occasion</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-midnight-lagoon block">
            {insights.mostCommonOccasion || 'Dinner'}
          </span>
          <span className="text-[10px] text-text-muted leading-tight block">
            Most frequent outing vibe.
          </span>
        </div>

        {/* Most common group size */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Users className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-bold">Squad Size</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-midnight-lagoon block">
            {insights.mostCommonGroupSize || '3–5 people'}
          </span>
          <span className="text-[10px] text-text-muted leading-tight block">
            Average squad planning size.
          </span>
        </div>

        {/* Typical planning budget */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Wallet className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-bold">Budget Fit</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-[#008751] block">
            {insights.typicalBudgetRange || '₦30k–₦50k'}
          </span>
          <span className="text-[10px] text-text-muted leading-tight block">
            Squad target spend envelope.
          </span>
        </div>
      </div>
    </div>
  );
}

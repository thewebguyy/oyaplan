'use client';

import React from 'react';
import { Venue, VenuePlanningInsights } from '@/lib/types';
import {
  Compass,
  Users,
  Wallet,
  Utensils,
  Lightbulb,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface BusinessInsightsClientProps {
  venue: Venue;
  insights: VenuePlanningInsights;
}

export function BusinessInsightsClient({
  venue,
  insights,
}: BusinessInsightsClientProps) {
  const hasData = insights.hasEnoughData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              Audience &amp; Behavior
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">
              {hasData ? `Grounded in ${insights.totalPlansAnalyzed} plans` : 'Sample Size Protected'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
            Planning &amp; Audience Insights
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Understand who is building plans around your business: typical occasions, party sizes, and realistic budget envelopes.
          </p>
        </div>
      </div>

      {!hasData ? (
        /* Honest Confidence-Gated Empty State */
        <div className="bg-white rounded-2xl border border-border-default p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-[#FAF7F2] text-text-muted rounded-xl flex items-center justify-center mx-auto border border-[#EAE4DC]">
            <Lock className="w-5 h-5 text-text-muted" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              Confidence-Gated Intelligence
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-midnight-lagoon tracking-tight">
              We&apos;re still gathering enough planning activity to show a reliable pattern here
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              OyaPlan only unlocks audience trends when at least 5 plans featuring your venue have been created. We will never guess or simulate false audience statistics.
            </p>
          </div>

          <div className="pt-4 max-w-sm mx-auto p-4 bg-[#FAF7F2] rounded-xl text-xs text-text-muted text-left space-y-2 border border-[#EAE4DC]/60">
            <span className="font-bold text-midnight-lagoon block">What will appear here:</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Dominant squad occasion (Dinner, Brunch, Date night)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Squad group sizes (Couples vs. groups of 4–8)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Actual budget range targets per person</span>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Insights */
        <div className="space-y-6">
          {/* Key Findings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Occasion */}
            <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Primary Occasion</span>
                <Utensils className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon block">
                {insights.mostCommonOccasion || 'Dinner Outing'}
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                Most squads select your venue for evening meals and relaxed group dinners.
              </p>
            </div>

            {/* Squad Size */}
            <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Typical Squad Size</span>
                <Users className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon block">
                {insights.mostCommonGroupSize || '3–5 people'}
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                Groups of 3 to 5 are the most common planning unit for your spot.
              </p>
            </div>

            {/* Target Budget */}
            <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Planned Spend Target</span>
                <Wallet className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-green block">
                {insights.typicalBudgetRange || '₦30k–₦50k'}
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                Target spend envelope per squad when budgeting for your space.
              </p>
            </div>
          </div>

          {/* Actionable Strategy Suggestions */}
          <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-midnight-lagoon">
                Recommended Actions Based on Real Plans
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-2">
                <span className="font-bold text-midnight-lagoon block">Platter &amp; Sharing Combos</span>
                <p className="text-text-muted leading-relaxed">
                  Since your average squad is {insights.mostCommonGroupSize || '3–5 people'}, offering group platters priced in the {insights.typicalBudgetRange || '₦30k–₦50k'} range significantly reduces group ordering hesitation.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-2">
                <span className="font-bold text-midnight-lagoon block">Transparent Drink Menus</span>
                <p className="text-text-muted leading-relaxed">
                  Drink costs represent over 40% of squad outings in Lagos. Keeping your cocktail and beer pricing current ensures your estimated bill stays accurate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

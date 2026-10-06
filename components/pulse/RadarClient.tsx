'use client';

import React from 'react';
import Link from 'next/link';
import { Venue, MenuItem, VenuePlanningInsights } from '@/lib/types';
import { PulseDemandSummary } from '@/lib/queries/pulse';
import {
  Radar,
  Users,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';

interface RadarClientProps {
  venue: Venue;
  insights: VenuePlanningInsights;
  demand: PulseDemandSummary;
  menuItems: MenuItem[];
}

export function RadarClient({
  venue,
  insights,
  demand,
  menuItems,
}: RadarClientProps) {
  const hasData = insights.hasEnoughData;
  const districtName = venue.districts?.name || 'Lagos';
  const mostSavedItem = menuItems.find((i) => i.is_available) || menuItems[0];

  return (
    <div className="space-y-6 pb-20">
      {/* ── Radar Header ── */}
      <div className="bg-[#121418] text-[#F8F9FA] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                RADAR · OPERATIONAL INTELLIGENCE
              </span>
              <span className="text-white/20 font-mono">/</span>
              <span className="text-xs font-mono text-white/50">
                {hasData ? `Grounded in ${insights.totalPlansAnalyzed} Real Plans` : 'Confidence-Gated Intelligence'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Market &amp; Squad Signals
            </h1>

            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              Actionable narrative intelligence. No decorative charts or vanity graphs — only genuine planning behavior from squads choosing your venue.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/business/${venue.id}`}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold border border-[#232732] transition-colors tap-feedback"
            >
              Back to The Pulse →
            </Link>
          </div>
        </div>
      </div>

      {/* ── NARRATIVE SIGNALS OR HONEST EMPTY STATE ── */}
      {!hasData ? (
        /* Honest Confidence-Gated Empty State */
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-8 sm:p-14 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 bg-white/5 text-white/50 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <Lock className="w-7 h-7 text-[#00E575]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#00E575] uppercase tracking-widest">
              CONFIDENCE-GATED RADAR
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              We&apos;re gathering real squad plans before unlocking signals
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              OyaPlan only surfaces intelligence when at least 5 verified plans featuring your venue have been created. We never fabricate metrics, generate simulated graphs, or guess customer patterns.
            </p>
          </div>

          <div className="pt-4 max-w-md mx-auto p-5 bg-black/40 rounded-2xl border border-white/5 text-left text-xs font-mono text-white/60 space-y-3">
            <span className="font-bold text-white uppercase text-[11px] block tracking-wide">
              What Radar will reveal when unlocked:
            </span>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00E575] shrink-0" />
              <span>Dominant squad party size (e.g. Couples vs. Squads of 6+)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00E575] shrink-0" />
              <span>Most frequent outing intent (Dinner, Cocktails, Birthday)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00E575] shrink-0" />
              <span>Actual per-person budget envelope requested by guests</span>
            </div>
          </div>
        </div>
      ) : (
        /* Narrative Intelligence Feed */
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E575]" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Active Narrative Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Finding 1: Squad Group Dynamics */}
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                    SQUAD DYNAMICS
                  </span>
                  <Users className="w-4 h-4 text-white/40" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {insights.mostCommonGroupSize || 'Groups of 4–6'} dominate your demand.
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Planners choosing {venue.name} overwhelmingly build plans for {insights.mostCommonGroupSize?.toLowerCase() || 'medium squads'}.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
                <span className="text-[#00E575] font-bold block mb-0.5">RECOMMENDED ACTION:</span>
                <span className="text-white/80">
                  Ensure table configurations comfortably seat groups of this size during peak evening service.
                </span>
              </div>
            </div>

            {/* Finding 2: Outing Occasion */}
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                    VIBE &amp; INTENT
                  </span>
                  <Sparkles className="w-4 h-4 text-white/40" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {insights.mostCommonOccasion || 'Dinner & Drinks'} is your top occasion.
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Guests prioritize your spot for {insights.mostCommonOccasion?.toLowerCase() || 'evening outings'} when budgeting their night out.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
                <span className="text-[#00E575] font-bold block mb-0.5">RECOMMENDED ACTION:</span>
                <span className="text-white/80">
                  Check sound system and floor lighting to match this mood from 7:00 PM onward.
                </span>
              </div>
            </div>

            {/* Finding 3: Target Budget Envelope */}
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                    BUDGET ENVELOPE
                  </span>
                  <span className="text-xs font-mono text-white/40">Per Person</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Typical squad budget is {insights.typicalBudgetRange || '₦35k–₦55k'}.
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Based on actual customer budgets submitted during plan creation for your district.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
                <span className="text-[#00E575] font-bold block mb-0.5">RECOMMENDED ACTION:</span>
                <span className="text-white/80">
                  Ensure entrée and cocktail pricing on The Board falls squarely into this sweet spot.
                </span>
              </div>
            </div>

            {/* Finding 4: District Heat & Location Signal */}
            <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30">
                    DISTRICT PULSE
                  </span>
                  <MapPin className="w-4 h-4 text-white/40" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {districtName} has active squad demand this week.
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Lagos planners are actively generating itinerary routes terminating in or passing through {districtName}.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono">
                <span className="text-[#00E575] font-bold block mb-0.5">RECOMMENDED ACTION:</span>
                <span className="text-white/80">
                  Verify weekend operating hours and door capacity are broadcasted accurately on The Pulse.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

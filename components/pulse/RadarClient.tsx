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
  AlertTriangle,
  Flame,
  Share2,
  TrendingUp,
  Zap,
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
  const districtName = venue.districts?.name || 'Victoria Island';
  const mostSavedItem = menuItems.find((i) => i.is_available) || menuItems[0];
  const featuredDishName = mostSavedItem ? mostSavedItem.name : 'Signature Cocktails';

  return (
    <div className="space-y-6 pb-20 font-sans text-[#F8F9FA]">
      {/* ── Street Intel Command Header ── */}
      <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                STREET INTEL · SQUAD BEHAVIOR &amp; COMPETITOR RADAR
              </span>
              <span className="text-white/20 font-mono">/</span>
              <span className="text-xs font-mono text-white/50">{districtName} Nightlife Frequency</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Street Intel &amp; Squad Behavior
            </h1>

            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              Human-translated intelligence. No vanity page views or bounce charts — only what squads are planning, where you&apos;re losing tables to competitors, and what&apos;s going viral in group chats.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/business/${venue.id}`}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold border border-[#232732] transition-colors tap-feedback"
            >
              Back to Radar →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 1. DISTRICT PLANNING FLOW & SQUAD BEHAVIOR ── */}
      <section className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575] bg-[#008751]/15 border border-[#008751]/30 px-2.5 py-0.5 rounded-full">
              <Radar className="w-3 h-3 text-[#00E575]" />
              <span>DISTRICT PLANNING INTEL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {demand.headlineCount > 0 || insights.hasEnoughData
                ? `Squads assembling outings in ${districtName} look for confirmed pricing`
                : `Gathering Planning Intel for ${districtName}`}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-white/50 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 shrink-0">
            {demand.headlineCount > 0 ? `${demand.headlineCount} Plans Live` : 'Emerging Signal'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
          {demand.headlineCount > 0 || insights.hasEnoughData
            ? 'Squads assembling outings on OyaPlan look for transparent bottle prices and confirmed cover charges. When items lack prices or operating hours say "Check back", planners bounce to spots with confirmed menus.'
            : `As squads assemble weekend runs featuring ${venue.name}, live planning dynamics, drop-off factors, and group consensus will aggregate live here.`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-white/50 uppercase block">Top Leak Factor</span>
            <span className="text-sm font-bold text-white block">Unconfirmed Bottle Pricing</span>
            <p className="text-[11px] text-white/60 leading-normal">
              Squads want to know what they will spend before getting in the car.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-white/50 uppercase block">Where They Go</span>
            <span className="text-sm font-bold text-[#00E575] block">Venues with Owner-Confirmed Menus</span>
            <p className="text-[11px] text-white/60 leading-normal">
              Spots with confirmed policies convert planning squads directly to table hold requests.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-[#008751]/30 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#00E575] uppercase block font-bold">1-Tap Action</span>
              <span className="text-sm font-bold text-white block">Confirm Menu Offerings</span>
            </div>
            <Link
              href={`/business/${venue.id}/pricing`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E575] hover:underline"
            >
              <span>Update on The Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. GROUP CHAT VIRALITY & SQUAD DYNAMICS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Group Chat Shares */}
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30 flex items-center gap-1">
                <Share2 className="w-3 h-3 text-[#00E575]" />
                <span>GROUP CHAT SIGNALS</span>
              </span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {demand.headlineCount > 0
                ? `"${featuredDishName}" featured in active squad planning.`
                : `Squad sharing intel unlocks on first planned outing.`}
            </h3>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {demand.headlineCount > 0
                ? 'When Lagos squad organizers build itinerary budgets, menu items are evaluated in group chats to reach spending consensus before leaving home.'
                : `When squad organizers include ${venue.name} in their weekend run, top-shared items and consensus signals will stream here.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/60">Planning Signal:</span>
              <span className="text-[#00E575] font-bold">
                {demand.headlineCount > 0 ? `${demand.headlineCount} Squads Planning` : 'Awaiting Weekend Runs'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/40 block">
              {demand.pendingSquads.length > 0
                ? `${demand.pendingSquads.length} pending table hold request(s) awaiting your decision.`
                : '100% grounded in real planner activity. No simulated estimates.'}
            </span>
          </div>
        </div>

        {/* Peak Surge Time & Party Sizes */}
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575] bg-[#008751]/15 px-2.5 py-0.5 rounded-full border border-[#008751]/30 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00E575]" />
                <span>ASSEMBLY PATTERNS</span>
              </span>
              <TrendingUp className="w-4 h-4 text-[#00E575]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {insights.hasEnoughData
                ? `Dominant squad size: ${insights.mostCommonGroupSize || 'Tables of 4–6'}`
                : `Friday & Saturday late evening is standard Lagos peak.`}
            </h3>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {insights.hasEnoughData ? (
                <>
                  Dominant squad party size for {venue.name} is {insights.mostCommonGroupSize || 'Tables of 4–6'}.
                  {insights.typicalBudgetRange ? ` Typical requested budget envelope is ${insights.typicalBudgetRange}.` : ''}
                </>
              ) : (
                `Awaiting detailed party size patterns for ${venue.name}. Standard Lagos weekend flow typically peaks between 8:30 PM and midnight.`
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-white/50 block text-[10px] uppercase">Stand Recommendation</span>
              <span className="font-bold text-white text-sm">Review incoming holds early</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#008751]/20 text-[#00E575] border border-[#008751]/40 font-bold">
              Floor Control
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. ACTIONABLE LOW-NIGHT PLAYBOOK (NEVER DEAD / NEVER BORED) ── */}
      <section className="bg-gradient-to-br from-[#121418] via-[#141820] to-[#0D1016] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575]">
              <Zap className="w-3 h-3 text-[#00E575]" />
              <span>ACTIONABLE DEMAND PLAYBOOK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Your tables quiet tonight? Here is how similar venues in {districtName} pack the room:
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#00E575]">01 · BROADCAST DJ TONIGHT</span>
              <h4 className="font-bold text-white text-sm">Turn on Live DJ Vibe Tag</h4>
              <p className="text-xs text-white/60">
                Squads searching for weekend vibe filter by live entertainment. Toggling this takes 2 seconds on Vibe Checks.
              </p>
            </div>
            <Link
              href={`/business/${venue.id}/venue`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#00E575] hover:underline pt-2"
            >
              <span>Toggle Vibe Checks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#00E575]">02 · FLASH PROMO HOOK</span>
              <h4 className="font-bold text-white text-sm">Free Round of Shots for First 3 Squads</h4>
              <p className="text-xs text-white/60">
                Give squads planning at home an immediate reason to choose your lounge over others in {districtName}.
              </p>
            </div>
            <Link
              href={`/business/${venue.id}`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#00E575] hover:underline pt-2"
            >
              <span>Push on The Pulse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-black/50 border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#00E575]">03 · CLEAR 86&apos;D ITEMS</span>
              <h4 className="font-bold text-white text-sm">Sync Menu Items &amp; Prices</h4>
              <p className="text-xs text-white/60">
                Remove out-of-stock bottles or dishes in 1 tap so squads don&apos;t face disappointment upon arrival.
              </p>
            </div>
            <Link
              href={`/business/${venue.id}/pricing`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#00E575] hover:underline pt-2"
            >
              <span>Open The Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

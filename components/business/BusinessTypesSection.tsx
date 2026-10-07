"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Utensils, Moon, Sparkles, Compass, ArrowRight, ShieldCheck, CreditCard, Users, CheckCircle2 } from "lucide-react";

export function BusinessTypesSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#090A0D] text-[#F8F9FA] relative overflow-hidden" id="business-types">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#008751]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00E575]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008751]/15 border border-[#008751]/30 text-[#00E575] text-[10px] font-mono font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-ping" />
            <span>OPERATING ENVIRONMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Built for the rooms where Lagosians spend money.
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            From rooftop lounges in Victoria Island to coastal beach clubs in Ilashe, OyaPlan connects high-intent squads with the exact tables they want to book. Not passive visitors — active outings with ready budgets.
          </p>
        </div>

        {/* ── ASYMMETRICAL OPERATIONAL BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* 1. HERO BENTO CARD: NIGHTLIFE & LOUNGES (Spans 7 cols on desktop) */}
          <div className="lg:col-span-7 bg-[#121418] rounded-3xl border border-[#232732] overflow-hidden relative group hover:border-[#00E575]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            {/* Background Venue Photography */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/venues/02_rsvp_lagos_hero.jpg"
                alt="Lagos Nightlife & Lounge"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.48] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
            </div>

            {/* Top Bar Label */}
            <div className="relative z-10 p-6 sm:p-7 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center backdrop-blur-md">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest">
                  NIGHTLIFE · LOUNGES &amp; CLUBS
                </span>
              </div>

              <span className="text-[10px] font-mono text-white/60 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                VI · Lekki · Ikeja
              </span>
            </div>

            {/* Content & Product-in-Action Overlay */}
            <div className="relative z-10 p-6 sm:p-7 space-y-5">
              {/* Product-in-Action Frosted Glass Card */}
              <div className="bg-black/75 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xl max-w-md">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#00E575] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00E575] animate-pulse" />
                    <span>INCOMING SQUAD REQUEST</span>
                  </div>
                  <span className="text-white/40">OYA-8K2M1A</span>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      Table of 6
                    </h4>
                    <p className="text-xs text-white/60 font-mono mt-0.5">
                      Friday 10:30 PM · VIP Booth
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-white/50 block">Planned Outing Spend</span>
                    <span className="text-lg sm:text-xl font-black text-[#00E575] font-mono">
                      ₦240,000
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/70">Deposit Ready:</span>
                  <span className="text-[#00E575] font-bold">
                    ₦50,000 (100% Direct Venue Deposit)
                  </span>
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Lounges, Bars &amp; Late-Night Clubs
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed">
                    Capture bottle service and VIP holds with instant door verification. Zero missed revenue.
                  </p>
                </div>

                <Link
                  href="/business/claim"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white bg-[#008751] hover:bg-[#007043] px-4 py-2.5 rounded-xl transition-all tap-feedback shadow-lg shrink-0 w-fit"
                >
                  <span>Claim Lounge</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00E575]" />
                </Link>
              </div>
            </div>
          </div>

          {/* 2. ANCHOR BENTO CARD: DINING & BISTROS (Spans 5 cols on desktop) */}
          <div className="lg:col-span-5 bg-[#121418] rounded-3xl border border-[#232732] overflow-hidden relative group hover:border-[#00E575]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            {/* Background Venue Photography */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/venues/07_circa_non_pareil_hero.jpg"
                alt="Lagos Restaurant Dining"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.48] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
            </div>

            {/* Top Bar Label */}
            <div className="relative z-10 p-6 sm:p-7 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center justify-center backdrop-blur-md">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest">
                  DINING · RESTAURANTS &amp; CAFÉS
                </span>
              </div>
            </div>

            {/* Content & Product-in-Action Overlay */}
            <div className="relative z-10 p-6 sm:p-7 space-y-5">
              {/* Product-in-Action Frosted Glass Card */}
              <div className="bg-black/75 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50 uppercase text-[10px]">OUTING CART MIRROR</span>
                  <span className="text-[10px] font-bold text-[#00E575] bg-[#008751]/20 px-2 py-0.5 rounded border border-[#008751]/30">
                    OWNER CONFIRMED
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono">
                    ₦38,500<span className="text-xs font-normal text-white/50">/head</span>
                  </span>
                  <span className="text-xs font-mono text-white/70">Squad of 4</span>
                </div>

                <div className="text-[11px] font-mono text-white/60 space-y-0.5 pt-1.5 border-t border-white/10">
                  <div className="flex justify-between">
                    <span>Dishes &amp; Cocktails:</span>
                    <span>₦132,000</span>
                  </div>
                  <div className="flex justify-between text-[#00E575]">
                    <span>VAT (7.5%) &amp; Service (10%):</span>
                    <span>₦22,000</span>
                  </div>
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Restaurants, Bistros &amp; Brunch
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Eliminate bill shock. Planners see your authentic dishes and taxes before leaving home.
                  </p>
                </div>

                <Link
                  href="/business/claim"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 rounded-xl transition-all tap-feedback w-fit"
                >
                  <span>Claim Restaurant</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00E575]" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3. TILE BENTO CARD: OUTDOOR & WATERFRONT (Spans 6 cols on desktop) */}
          <div className="lg:col-span-6 bg-[#121418] rounded-3xl border border-[#232732] overflow-hidden relative group hover:border-[#00E575]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between min-h-[340px] sm:min-h-[380px]">
            {/* Background Venue Photography */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/venues/09_wave_beach_hero.jpg"
                alt="Lagos Waterfront Beach Clubs"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-[0.38] group-hover:scale-105 group-hover:brightness-[0.46] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
            </div>

            {/* Top Bar Label */}
            <div className="relative z-10 p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-300 flex items-center justify-center backdrop-blur-md">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-sky-300 uppercase tracking-widest">
                  OUTDOOR · BEACHES &amp; RESORTS
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/60 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
                Ilashe · Tarkwa · Epe
              </span>
            </div>

            {/* Content & Product-in-Action Overlay */}
            <div className="relative z-10 p-6 space-y-4">
              {/* Product-in-Action Frosted Glass Card */}
              <div className="bg-black/75 backdrop-blur-xl border border-white/15 p-4 rounded-2xl space-y-2 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-300 font-bold">ILASHE DAY TRIP RUN</span>
                  <span className="text-white/40">Squad of 10</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-white font-mono">₦450,000</span>
                  <span className="text-[11px] font-mono text-[#00E575] font-bold">Cabana Seating Hold</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Beach Clubs &amp; Coastal Houses
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Coordinate day-trip minimums and private boats upfront.
                  </p>
                </div>

                <Link
                  href="/business/claim"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E575] hover:underline shrink-0"
                >
                  <span>List Beach Spot →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. TILE BENTO CARD: EXPERIENCES & ENTERTAINMENT (Spans 6 cols on desktop) */}
          <div className="lg:col-span-6 bg-[#121418] rounded-3xl border border-[#232732] overflow-hidden relative group hover:border-[#00E575]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between min-h-[340px] sm:min-h-[380px]">
            {/* Background Venue Photography */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/venues/14_bogobiri_house_hero.jpg"
                alt="Lagos Experiences & Entertainment"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-[0.38] group-hover:scale-105 group-hover:brightness-[0.46] transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
            </div>

            {/* Top Bar Label */}
            <div className="relative z-10 p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-emerald-300 uppercase tracking-widest">
                  EXPERIENCES · ACTIVITIES &amp; SPAS
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/60 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
                Ikoyi · Lekki · Mainland
              </span>
            </div>

            {/* Content & Product-in-Action Overlay */}
            <div className="relative z-10 p-6 space-y-4">
              {/* Product-in-Action Frosted Glass Card */}
              <div className="bg-black/75 backdrop-blur-xl border border-white/15 p-4 rounded-2xl space-y-2 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-300 font-bold">BIRTHDAY RUN · 8 GUESTS</span>
                  <span className="text-white/40">Paint &amp; Sip + Lounge</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-white font-mono">₦180,000</span>
                  <span className="text-[11px] font-mono text-[#00E575] font-bold">Upfront Hold Paid</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Arcades, Wellness &amp; Live Arts
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Lock in group bookings with clear per-guest package pricing.
                  </p>
                </div>

                <Link
                  href="/business/claim"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E575] hover:underline shrink-0"
                >
                  <span>List Activity →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

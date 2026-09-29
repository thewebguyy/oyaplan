"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Users,
  Wallet,
  Clock,
  Wine,
  Calendar,
  Check,
  ChevronRight,
} from "lucide-react";

export function BusinessHero() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-white">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-emerald-50/60 via-slate-50/30 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Editorial Value Proposition ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-brand-green">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                Lagos Decision &amp; Reservation Layer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Be there when people{" "}
              <span className="text-brand-green">decide where to spend.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Get discovered by Lagosians actively planning an outing, help them understand what their visit will cost, and turn that intent into reservations when they&apos;re ready.
            </p>

            {/* Structured CTAs: Primary, Secondary, Supporting */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/business/claim"
                  className="h-12 px-6 bg-brand-green hover:bg-[#007043] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm tap-feedback cursor-pointer"
                >
                  <span>Get Started — It&apos;s Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#reservations"
                  className="h-12 px-5 bg-white hover:bg-slate-50 text-slate-800 border border-border-default text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>See How Reservations Work</span>
                </a>
              </div>

              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green transition-colors pt-1"
                >
                  <span>Explore the marketplace as a customer</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Trust Anchors */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">₦0</p>
                <p className="text-xs text-slate-500 mt-0.5">Free to list your venue</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Deposits direct to venue</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">Attributed</p>
                <p className="text-xs text-slate-500 mt-0.5">Commission on reservations</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Composed Consumer Plan ↔ Business Reservation Specimen ── */}
          <div className="lg:col-span-6 relative">
            {/* Structural glow backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/40 via-amber-50/30 to-slate-100 rounded-3xl -z-10 blur-xl opacity-70" />

            <div className="space-y-3.5">
              
              {/* Layer 1: Consumer Planning Decision */}
              <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE4DC]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Step 1 • Consumer Outing Plan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-[#EAE4DC]">
                    Friday Night • 4 Guests
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-bold text-slate-900">Nok by Alara</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Wallet className="w-4 h-4 text-brand-green" />
                      <span>Est. ₦27,500 / person</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EAE4DC] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                        <span className="text-xs font-bold text-slate-900">Menu &amp; house rules confirmed</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Budget calculated with corkage &amp; transport included
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-brand-green bg-[#EAFDF3] px-2.5 py-1 rounded-lg border border-[#A3F3C6]">
                      Ready to reserve
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Step: Intent to Reservation Request */}
              <div className="flex items-center justify-center -my-1 relative z-10">
                <div className="px-3.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 border border-slate-700">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Planning Intent Becomes A Reservation Request</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Layer 2: Business Portal Incoming Reservation */}
              <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-lg relative">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Step 2 • Business Portal Incoming Request
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-[#EAFDF3] px-2.5 py-0.5 rounded-full border border-[#A3F3C6]">
                    New Reservation Request
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Table for 4 Guests</h4>
                      <p className="text-xs text-slate-500">Friday, Oct 3 • 8:00 PM • Dining Room</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-brand-green bg-[#EAFDF3] px-2 py-0.5 rounded-md border border-[#A3F3C6]">
                      Attributed via OyaPlan
                    </span>
                  </div>

                  {/* Direct Deposit Callout */}
                  <div className="bg-[#FAF7F2] rounded-xl p-3 border border-[#EAE4DC] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">Required Table Deposit:</span>
                      <span className="font-mono font-bold text-slate-900">₦20,000</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      🔒 <strong>Direct Venue Deposit:</strong> Customer pays deposit directly to your business account. OyaPlan does not hold your funds.
                    </p>
                  </div>

                  {/* Venue Action Controls */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <div className="flex-1 h-9 bg-slate-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm &amp; Share Bank Details</span>
                    </div>
                    <div className="px-3 h-9 bg-slate-100 text-slate-600 font-medium rounded-lg flex items-center justify-center">
                      <span>Decline</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
                    OyaPlan earns a commission on confirmed qualifying reservations.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

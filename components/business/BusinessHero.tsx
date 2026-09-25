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
  Tag,
  RefreshCw,
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
                The Lagos Outing Decision Layer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Be there when people{" "}
              <span className="text-brand-green">decide where to spend.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Lagosians use OyaPlan to calculate budgets, align group spending, and plan outings before leaving home. Manage the prices, menus, and house policies they rely on to choose your venue.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/business/claim"
                className="h-12 px-6 bg-brand-green hover:bg-[#007043] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm tap-feedback cursor-pointer"
              >
                <span>Claim your venue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="h-12 px-6 bg-white hover:bg-slate-50 text-slate-800 border border-border-default text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback"
              >
                <span>See OyaPlan as a customer</span>
                <ArrowUpRight className="w-4 h-4 text-brand-green" />
              </Link>
            </div>

            {/* Trust Anchors */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Control of your pricing</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Zero</p>
                <p className="text-xs text-slate-500 mt-0.5">Commission on walk-ins</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Live</p>
                <p className="text-xs text-slate-500 mt-0.5">Marketplace sync</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Composed Business ↔ Consumer Product Specimen ── */}
          <div className="lg:col-span-6 relative">
            {/* Structural glow backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/40 via-amber-50/30 to-slate-100 rounded-3xl -z-10 blur-xl opacity-70" />

            <div className="space-y-4">
              
              {/* Layer 1: The Business Controller View */}
              <div className="bg-white rounded-2xl border border-border-default p-5 shadow-lg relative">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      OyaPlan Business Portal • Live Control
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-[#EAFDF3] px-2 py-0.5 rounded-full border border-[#A3F3C6]">
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Synced to Lagos Marketplace</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Nok by Alara</h4>
                      <p className="text-xs text-slate-500">Victoria Island, Lagos • Contemporary African</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      ₦₦₦
                    </span>
                  </div>

                  {/* Pricing Specimen */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Signature Dish</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">Braised Short Ribs</p>
                      <p className="text-xs font-mono font-bold text-brand-green">₦18,500</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Cocktail Average</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">Hibiscus Mezcalita</p>
                      <p className="text-xs font-mono font-bold text-brand-green">₦9,000</p>
                    </div>
                  </div>

                  {/* Policies spec */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                      <Wine className="w-3 h-3 text-amber-600" />
                      <span>Corkage: ₦15,000</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      <span>Kitchen Closes 10:30 PM</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Sync Indicator */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 border border-slate-700">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Feeds Directly Into Consumer Outing Plans</span>
                </div>
              </div>

              {/* Layer 2: The Consumer Planning View */}
              <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE4DC]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Customer Decision View • Friday Group Plan
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-[#EAE4DC]">
                    Budget Calculated
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-bold text-slate-900">4 Planners Outing</span>
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
                        <span className="text-xs font-bold text-slate-900">Nok by Alara (Stop 1)</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Menu &amp; pricing confirmed via verified partner portal
                      </p>
                    </div>
                    <span className="text-xs font-black text-brand-green bg-[#EAFDF3] px-2 py-1 rounded-lg border border-[#A3F3C6]">
                      Locked In
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

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
    <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden bg-[#0C0D0E] text-[#F7F5EE]">
      {/* Subtle Architectural Road Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Operator Value Proposition ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#008751]/20 border border-[#008751]/40 text-[#00E575]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                THE PULSE · LAGOS HOSPITALITY COMMAND CENTER
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-serif">
              Control your venue&apos;s place in{" "}
              <span className="text-[#008751]">Lagos outing decisions.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              Manage how your venue appears to squads, control customer-facing prices and table policies, and capture high-intent reservations with 100% direct deposits.
            </p>

            {/* Structured CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
                <Link
                  href="/business/claim"
                  className="h-12 px-6 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <span>Claim Your Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login/business"
                  className="h-12 px-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00E575]" />
                  <span>Access The Floor</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/login/business"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white/50 hover:text-[#00E575] transition-colors pt-1"
                >
                  <span>Already claimed? Access The Floor →</span>
                </Link>
              </div>
            </div>

            {/* Operational Anchors */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 font-mono">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">₦0</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Pre-Indexed Listing</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#008751] tracking-tight">100%</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Direct Table Deposits</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#00E575] tracking-tight">1-Tap</p>
                <p className="text-[11px] text-white/50 uppercase mt-0.5">Price Freshness</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Dual Tactical Specimen ── */}
          <div className="lg:col-span-6 relative">
            <div className="space-y-4">
              
              {/* Specimen 1: The Pulse Control Room Specimen */}
              <div className="bg-[#141517] rounded-2xl border-2 border-white/10 p-5 shadow-2xl space-y-3 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#008751]" />
                    <span className="text-[10px] font-mono font-bold text-[#00E575] uppercase tracking-widest">
                      01 VENUE CONTROL PANEL
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/60 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    LIVE SPECIMEN · VI
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-serif font-black text-white">Nok by Alara</h4>
                      <p className="text-xs text-white/60">Victoria Island, Lagos</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#008751]/15 text-[#008751] border border-[#008751]/30">
                      ● VERIFIED SPOT
                    </span>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-white/40 uppercase block">PRICE FRESHNESS</span>
                      <span className="text-xs font-bold text-white">Confirmed Current Today</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#00E575] bg-[#008751]/20 px-2.5 py-1 rounded-lg border border-[#008751]/40">
                      VALID: 30 DAYS
                    </span>
                  </div>
                </div>
              </div>

              {/* Specimen 2: What Customers See Mirror */}
              <div className="bg-[#18191B] rounded-2xl border border-white/10 p-5 shadow-xl space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">
                    WHAT CUSTOMERS SEE BEFORE LEAVING HOME
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#008751]">
                    LIVE SYNC
                  </span>
                </div>

                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-white/50 uppercase block">Total Outing Cost</span>
                    <span className="text-xl font-mono font-black text-white">₦35,100</span>
                    <span className="text-[11px] text-white/60 block mt-0.5">₦17,550 / person · 2 guests</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-white/50 space-y-0.5">
                    <div>Menu: ₦24,000</div>
                    <div>Transport: ₦7,500</div>
                    <div className="text-[#008751]">VAT + Service: ₦3,600</div>
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

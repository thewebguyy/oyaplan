"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Calculator,
  Receipt,
  Car,
  Check,
  RotateCcw,
} from "lucide-react";
import { triggerHaptic } from "@/lib/ui/haptics";

export function BusinessHero() {
  const [includeServiceCharge, setIncludeServiceCharge] = useState(true);
  const [dishDelta, setDishDelta] = useState(0); // -2000, 0, +2000

  // Calculation Math
  const baseFood = 21000 + dishDelta;
  const vat = Math.round(baseFood * 0.075); // 7.5% VAT
  const serviceCharge = includeServiceCharge ? Math.round(baseFood * 0.10) : 0;
  const rides = 9000;
  const totalCost = baseFood + vat + serviceCharge + rides;
  const perPerson = Math.round(totalCost / 2);
  const targetBudget = 35000;
  const budgetDifference = targetBudget - totalCost;
  const isInsideBudget = budgetDifference >= 0;

  const handleToggleService = () => {
    triggerHaptic("selection");
    setIncludeServiceCharge((prev) => !prev);
  };

  const handleDishChange = (delta: number) => {
    triggerHaptic("selection");
    setDishDelta(delta);
  };

  return (
    <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden bg-[#141210] text-[#F5F1E8]">
      {/* Subtle Architectural Ledger Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,154,40,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,154,40,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Operator Value Proposition ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E59A28]/15 border border-[#E59A28]/35 text-[#E59A28]">
              <span className="w-2 h-2 rounded-full bg-[#E59A28] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
                OYAPLAN FOR VENUES · VERIFIED OUTING MATH
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F1E8] tracking-tight leading-[1.1] font-serif">
              Control what your spot actually costs{" "}
              <span className="text-[#E59A28]">in people&apos;s heads.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#A0978C] leading-relaxed max-w-xl">
              Lagosians don&apos;t skip your venue because they hate the vibe—they skip it because they&apos;re afraid of surprise billing. Publish your real menu prices, 7.5% VAT, service charges, and house rules upfront so squads plan their outing around your spot before leaving home.
            </p>

            {/* Structured CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
                <Link
                  href="/business/claim"
                  className="h-13 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-950/40 tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <span>Audit &amp; Claim Your Spot →</span>
                </Link>

                <Link
                  href="/login/business"
                  className="h-13 px-5 bg-[#1E1B18] hover:bg-[#26221E] text-[#F5F1E8] border border-[#2D2823] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="w-4 h-4 text-[#12A165]" />
                  <span>Open Venue Ledger</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/login/business"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#A0978C] hover:text-[#E59A28] transition-colors pt-1"
                >
                  <span>Already claimed? Access your Till Slip Studio →</span>
                </Link>
              </div>
            </div>

            {/* 3 Operational Proof Strip Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#2D2823] font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-[#1E1B18] border border-[#2D2823]">
                <p className="text-[#12A165] font-black text-sm uppercase">100% Transparent</p>
                <p className="text-[#A0978C] text-[11px] leading-snug mt-1">Dishes + 7.5% VAT + Service Charge itemized upfront</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E1B18] border border-[#2D2823]">
                <p className="text-[#E59A28] font-black text-sm uppercase">Zone-Modeled</p>
                <p className="text-[#A0978C] text-[11px] leading-snug mt-1">Mainland &amp; Island ride surges factored into guest budgets</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E1B18] border border-[#2D2823]">
                <p className="text-white font-black text-sm uppercase">Zero Bill Drama</p>
                <p className="text-[#A0978C] text-[11px] leading-snug mt-1">Guests arrive already knowing the damage per head</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive "Till Slip Mirror" Simulator ── */}
          <div className="lg:col-span-6 relative">
            <div className="space-y-3 font-sans">
              
              {/* Widget Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#12A165] animate-pulse" />
                  <span className="text-[11px] font-mono font-black text-[#12A165] uppercase tracking-wider">
                    LIVE OUTING MATH SIMULATOR · SEE HOW PLANNERS PRICE YOU
                  </span>
                </div>
              </div>

              {/* Scenario Context Pill */}
              <div className="p-3 rounded-xl bg-[#1E1B18] border border-[#2D2823] text-xs font-mono text-[#A0978C]">
                <span className="text-[#F5F1E8] font-bold">Target Outing: </span>
                <span>Date / +1 from Ikeja · Budget: ₦35,000 Total (₦17,500/person)</span>
              </div>

              {/* ── THE VISUAL RECEIPT CARD (Rendered on #F7F4EC Ivory Receipt Paper) ── */}
              <div className="bg-[#F7F4EC] text-[#141210] rounded-3xl border-4 border-[#2D2823] p-5 sm:p-6 shadow-2xl space-y-4 font-mono relative overflow-hidden">
                {/* Decorative Receipt Tear Line Top */}
                <div className="border-b-2 border-dashed border-[#141210]/20 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#12A165] uppercase tracking-widest block">
                      OYAPLAN VETTED VENUE
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#141210]">
                      VERIFIED TILL SLIP PREVIEW
                    </h3>
                  </div>
                  <Receipt className="w-5 h-5 text-[#141210]/40 shrink-0" />
                </div>

                {/* Receipt Line Items */}
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#141210]/80 font-medium">2x Signature Mains + 2x Cocktails</span>
                    <span className="font-bold">₦{baseFood.toLocaleString('en-NG')}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-[#141210]/10">
                    <span className="text-[#141210]/80">
                      VAT (7.5%): ₦{vat.toLocaleString('en-NG')} {includeServiceCharge ? `+ Service (10%): ₦${serviceCharge.toLocaleString('en-NG')}` : '(No Service Charge)'}
                    </span>
                    <span className="font-bold">₦{(vat + serviceCharge).toLocaleString('en-NG')}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-[#141210]/10">
                    <span className="text-[#141210]/70 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#141210]/60" />
                      <span>Est. Round-Trip Ride (Ikeja Corridor)</span>
                    </span>
                    <span className="font-bold">₦{rides.toLocaleString('en-NG')}</span>
                  </div>
                </div>

                {/* Receipt Divider */}
                <div className="text-center text-[#141210]/30 font-bold select-none">
                  ----------------------------------------
                </div>

                {/* Receipt Total */}
                <div className="flex items-center justify-between bg-[#141210]/5 p-3.5 rounded-2xl border border-[#141210]/10">
                  <div>
                    <span className="text-[10px] uppercase text-[#141210]/60 font-bold block">Total Outing Cost</span>
                    <span className="text-xl sm:text-2xl font-black text-[#141210]">
                      ~₦{totalCost.toLocaleString('en-NG')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#141210]/60 font-bold block">Per Person Split</span>
                    <span className="text-sm sm:text-base font-bold text-[#141210]">
                      ~₦{perPerson.toLocaleString('en-NG')} / head
                    </span>
                  </div>
                </div>

                {/* Verdict Badge */}
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isInsideBudget
                      ? "bg-[#12A165]/15 border-[#12A165] text-[#12A165]"
                      : "bg-[#E85C33]/15 border-[#E85C33] text-[#E85C33]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isInsideBudget
                      ? `✓ INSIDE BUDGET — ₦${budgetDifference.toLocaleString('en-NG')} left for bad decisions`
                      : `⚠️ OVER BUDGET — ₦${Math.abs(budgetDifference).toLocaleString('en-NG')} above target ceiling`}
                  </span>
                </div>

                {/* Interactive Controls Overlay */}
                <div className="pt-3 border-t-2 border-dashed border-[#141210]/20 space-y-2.5 text-xs text-[#141210]">
                  <span className="text-[10px] font-bold text-[#141210]/60 uppercase tracking-widest block">
                    Interactive Controls · Calibrate Your Outing Math
                  </span>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Toggle Service Charge */}
                    <button
                      type="button"
                      onClick={handleToggleService}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer tap-feedback ${
                        includeServiceCharge
                          ? "bg-[#141210] text-[#F5F1E8] border-[#141210]"
                          : "bg-transparent text-[#141210] border-[#141210]/40"
                      }`}
                    >
                      {includeServiceCharge ? "✓ 10% Service Charge Active" : "+ Add 10% Service Charge"}
                    </button>

                    {/* Adjust Prices */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDishChange(-2000)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === -2000 ? "bg-[#141210] text-[#F5F1E8]" : "bg-white/60 border-[#141210]/30"
                        }`}
                      >
                        -₦2k Dish
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDishChange(0)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === 0 ? "bg-[#141210] text-[#F5F1E8]" : "bg-white/60 border-[#141210]/30"
                        }`}
                      >
                        Base
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDishChange(2000)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === 2000 ? "bg-[#141210] text-[#F5F1E8]" : "bg-white/60 border-[#141210]/30"
                        }`}
                      >
                        +₦2k Dish
                      </button>
                    </div>
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

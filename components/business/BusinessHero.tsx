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
  const [includeVat, setIncludeVat] = useState(true);
  const [dishDelta, setDishDelta] = useState(0); // -2000, 0, +2000
  const [partySize, setPartySize] = useState<2 | 4 | 6>(2);

  // Calculation Math
  const baseFoodPerPerson = 12500 + dishDelta;
  const totalBaseFood = baseFoodPerPerson * partySize;
  const vat = includeVat ? Math.round(totalBaseFood * 0.075) : 0; // 7.5% VAT
  const serviceCharge = includeServiceCharge ? Math.round(totalBaseFood * 0.10) : 0;
  const rides = partySize === 2 ? 8000 : 14000; // Estimated corridor surge rides
  const totalCost = totalBaseFood + vat + serviceCharge + rides;
  const perPerson = Math.round(totalCost / partySize);
  const targetBudget = partySize === 2 ? 40000 : 75000;
  const budgetDifference = targetBudget - totalCost;
  const isInsideBudget = budgetDifference >= 0;

  const handleToggleService = () => {
    triggerHaptic("selection");
    setIncludeServiceCharge((prev) => !prev);
  };

  const handleToggleVat = () => {
    triggerHaptic("selection");
    setIncludeVat((prev) => !prev);
  };

  const handleDishChange = (delta: number) => {
    triggerHaptic("selection");
    setDishDelta(delta);
  };

  const handlePartyChange = (size: 2 | 4 | 6) => {
    triggerHaptic("selection");
    setPartySize(size);
  };

  return (
    <section className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 overflow-hidden bg-[#0D0E11] text-[#F5F2EA]">
      {/* Subtle Architectural Ledger Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,154,40,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,154,40,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Warm Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E59A28]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#10B981]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ── Left Column: Value Proposition & Direct Copy ── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E59A28]/10 border border-[#E59A28]/30 text-[#E59A28]">
              <span className="w-2 h-2 rounded-full bg-[#E59A28] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
                OYAPLAN FOR VENUES · HONEST OUTING PRICING
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-[#F5F2EA] tracking-tight leading-[1.08] font-serif">
              Control what your venue costs{" "}
              <span className="text-[#E59A28]">in people&apos;s heads.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#9EA3B0] leading-relaxed max-w-xl">
              Lagosians don&apos;t skip your venue because they hate the vibe—they skip it because they&apos;re afraid of bill shock. Publish your real menu prices, 7.5% VAT, and house rules upfront so squads plan their night around your tables.
            </p>

            {/* Direct & Simplified Action CTAs */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
                <Link
                  href="/business/claim"
                  className="h-12 sm:h-13 px-6 bg-[#E59A28] hover:bg-[#D48B1B] active:scale-[0.98] text-[#0D0E11] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/30 tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <span>Claim Your Venue →</span>
                </Link>

                <Link
                  href="/login/business"
                  className="h-12 sm:h-13 px-5 bg-[#17191E] hover:bg-[#20232A] active:scale-[0.98] text-[#F5F2EA] border border-[#272B35] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Open Dashboard</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/login/business"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#8A90A0] hover:text-[#E59A28] transition-colors pt-1"
                >
                  <span>Already listed? Edit your menus and house rules →</span>
                </Link>
              </div>
            </div>

            {/* 3 Clear Operating Proof Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#232733] font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-[#14161C] border border-[#232733]">
                <p className="text-[#10B981] font-black text-sm uppercase">100% Direct Deposits</p>
                <p className="text-[#8A90A0] text-[11px] leading-snug mt-1">Paid straight to your Moniepoint, Providus, or Zenith</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14161C] border border-[#232733]">
                <p className="text-[#E59A28] font-black text-sm uppercase">Ride-Aware Math</p>
                <p className="text-[#8A90A0] text-[11px] leading-snug mt-1">Surge pricing accounted for so budgets don&apos;t blow up</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14161C] border border-[#232733]">
                <p className="text-[#F5F2EA] font-black text-sm uppercase">No Door Drama</p>
                <p className="text-[#8A90A0] text-[11px] leading-snug mt-1">Guests arrive already knowing the split per head</p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive "Outing Math Simulator" (Tactile Widget) ── */}
          <div className="lg:col-span-6 relative">
            <div className="space-y-3 font-sans">
              
              {/* Widget Header with Status */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[11px] font-mono font-black text-[#10B981] uppercase tracking-wider">
                    LIVE OUTING MATH SIMULATOR
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#8A90A0] uppercase hidden sm:inline-block">
                  Click controls to test
                </span>
              </div>

              {/* Party Size Selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#17191E] border border-[#272B35] text-xs font-mono">
                <span className="text-[#9EA3B0] text-[11px]">Select Squad Size:</span>
                <div className="flex items-center gap-1.5">
                  {[2, 4, 6].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePartyChange(size as 2 | 4 | 6)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer tap-feedback ${
                        partySize === size
                          ? "bg-[#E59A28] text-[#0D0E11]"
                          : "bg-[#20232A] text-[#9EA3B0] hover:text-white"
                      }`}
                    >
                      {size} People
                    </button>
                  ))}
                </div>
              </div>

              {/* ── THE VISUAL RECEIPT CARD (Ivory Paper on Dark Tech Base) ── */}
              <div className="bg-[#FAF8F2] text-[#14161C] rounded-3xl border-2 border-[#2F3442] p-5 sm:p-6 shadow-2xl space-y-4 font-mono relative overflow-hidden">
                {/* Decorative Receipt Tear Line Top */}
                <div className="border-b-2 border-dashed border-[#14161C]/20 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest block">
                      VERIFIED DIGITAL TILL SLIP
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#14161C]">
                      GUEST OUTING ESTIMATE
                    </h3>
                  </div>
                  <Receipt className="w-5 h-5 text-[#14161C]/40 shrink-0" />
                </div>

                {/* Receipt Line Items with Live Updates */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#14161C]/80 font-medium">
                      {partySize}x Mains &amp; Drinks (~₦{baseFoodPerPerson.toLocaleString("en-NG")}/head)
                    </span>
                    <span className="font-bold">₦{totalBaseFood.toLocaleString("en-NG")}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-[#14161C]/10">
                    <span className="text-[#14161C]/80 text-[11px] sm:text-xs">
                      {includeVat ? "VAT (7.5%)" : "VAT (Excluded)"}
                      {includeServiceCharge ? " + Service Charge (10%)" : ""}
                    </span>
                    <span className="font-bold">₦{(vat + serviceCharge).toLocaleString("en-NG")}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-[#14161C]/10">
                    <span className="text-[#14161C]/70 flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <Car className="w-3.5 h-3.5 text-[#14161C]/60" />
                      <span>Est. Corridor Rides (Ikeja ↔ VI / Lekki)</span>
                    </span>
                    <span className="font-bold">₦{rides.toLocaleString("en-NG")}</span>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="text-center text-[#14161C]/25 font-bold tracking-widest select-none text-xs">
                  - - - - - - - - - - - - - - - - - - - - - - - -
                </div>

                {/* Receipt Total Block */}
                <div className="flex items-center justify-between bg-[#14161C]/5 p-3.5 rounded-2xl border border-[#14161C]/10">
                  <div>
                    <span className="text-[10px] uppercase text-[#14161C]/60 font-bold block">Total Outing Math</span>
                    <span className="text-xl sm:text-2xl font-black text-[#14161C]">
                      ~₦{totalCost.toLocaleString("en-NG")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#14161C]/60 font-bold block">Each Person Pays</span>
                    <span className="text-sm sm:text-base font-black text-[#E59A28]">
                      ~₦{perPerson.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>

                {/* Verdict Badge */}
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isInsideBudget
                      ? "bg-[#10B981]/15 border-[#10B981] text-[#047857]"
                      : "bg-[#EF4444]/15 border-[#EF4444] text-[#B91C1C]"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isInsideBudget
                      ? `✓ Inside target budget — ₦${budgetDifference.toLocaleString("en-NG")} safety buffer`
                      : `⚠️ Over target budget — ₦${Math.abs(budgetDifference).toLocaleString("en-NG")} above threshold`}
                  </span>
                </div>

                {/* ── Interactive Controls Box (Tactile Buttons) ── */}
                <div className="pt-3 border-t-2 border-dashed border-[#14161C]/20 space-y-2 text-xs text-[#14161C]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#14161C]/70 uppercase tracking-wider">
                      Interactive Controls (Test Your Venue):
                    </span>
                  </div>

                  {/* Toggle Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleService}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer tap-feedback ${
                        includeServiceCharge
                          ? "bg-[#14161C] text-[#FAF8F2] border-[#14161C]"
                          : "bg-white/80 text-[#14161C] border-[#14161C]/30 hover:bg-white"
                      }`}
                    >
                      {includeServiceCharge ? "✓ 10% Service Charge ON" : "+ 10% Service Charge OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleVat}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer tap-feedback ${
                        includeVat
                          ? "bg-[#14161C] text-[#FAF8F2] border-[#14161C]"
                          : "bg-white/80 text-[#14161C] border-[#14161C]/30 hover:bg-white"
                      }`}
                    >
                      {includeVat ? "✓ 7.5% VAT Active" : "+ 7.5% VAT Inactive"}
                    </button>
                  </div>

                  {/* Price Adjusters */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-[#14161C]/70">Dish Adjust:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDishChange(-2000)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === -2000 ? "bg-[#14161C] text-[#FAF8F2]" : "bg-white/70 border-[#14161C]/30"
                        }`}
                      >
                        -₦2,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDishChange(0)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === 0 ? "bg-[#14161C] text-[#FAF8F2]" : "bg-white/70 border-[#14161C]/30"
                        }`}
                      >
                        Base Menu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDishChange(2000)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer tap-feedback ${
                          dishDelta === 2000 ? "bg-[#14161C] text-[#FAF8F2]" : "bg-white/70 border-[#14161C]/30"
                        }`}
                      >
                        +₦2,000
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

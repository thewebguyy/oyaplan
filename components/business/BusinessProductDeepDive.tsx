"use client";

import React from "react";
import { Tag, ShieldCheck, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BusinessProductDeepDive() {
  return (
    <section className="py-16 sm:py-24 bg-[#0D0E11] text-[#F5F2EA] border-t border-[#232733]" id="why-outside-math">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E59A28]/10 border border-[#E59A28]/30 text-[#E59A28] text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28]" />
            <span>RUMOR VS. REALITY</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-serif leading-tight">
            Rumors kill walk-ins. Clarity fills tables.
          </h2>
          
          <p className="text-sm sm:text-base text-[#9EA3B0] leading-relaxed">
            In Lagos, one group chat rumor about &quot;secret service fees&quot; or inflated minimum spends can make hundreds of guests assume your spot is too expensive. OyaPlan replaces WhatsApp guesswork with your verified pricing.
          </p>
        </div>

        {/* ── Visual Comparison: Group Chat Rumor vs. Verified Till Slip (Mobile-First Stack) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Card A: The Chaotic WhatsApp Rumor */}
          <div className="bg-[#17191E] rounded-3xl border border-[#EF4444]/30 p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-full border border-[#EF4444]/30">
                  WITHOUT OYAPLAN · THE RUMOR MILL
                </span>
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Squad group chats guessing your prices
              </h3>
              <p className="text-xs sm:text-sm text-[#9EA3B0] leading-relaxed">
                Someone claims a cocktail was ₦18,000, someone else heard tables require a ₦200,000 minimum spend, and the squad goes somewhere else.
              </p>
            </div>

            {/* Simulated WhatsApp Chat Interface */}
            <div className="bg-[#111B21] rounded-2xl p-4 space-y-3 font-sans text-xs border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-[#25D366]" />
                <span className="text-white/80 font-bold text-[11px]">Friday Night Outing 🍸</span>
              </div>

              {/* Chat Bubble 1 */}
              <div className="bg-[#202C33] text-white/90 p-2.5 rounded-xl rounded-tl-none max-w-[85%] space-y-1">
                <p className="text-[10px] text-[#00A884] font-bold">Tobi</p>
                <p>Are we still doing RSVP or that new rooftop in VI?</p>
                <span className="text-[9px] text-white/40 block text-right">8:14 PM</span>
              </div>

              {/* Chat Bubble 2 */}
              <div className="bg-[#202C33] text-white/90 p-2.5 rounded-xl rounded-tl-none max-w-[85%] space-y-1">
                <p className="text-[10px] text-[#53BDEB] font-bold">Nneka</p>
                <p>Abeg o, my friend said their service charge is 20% and 4 of them spent almost ₦350k just for drinks! 😭</p>
                <span className="text-[9px] text-white/40 block text-right">8:16 PM</span>
              </div>

              {/* Chat Bubble 3 (Lead Drop) */}
              <div className="bg-[#005C4B] text-white p-2.5 rounded-xl rounded-tr-none max-w-[85%] ml-auto space-y-1">
                <p>Omo let&apos;s just go somewhere cheaper then...</p>
                <span className="text-[9px] text-white/60 block text-right">8:18 PM</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-mono font-bold">
              Result: Lost booking &amp; zero table deposit.
            </div>
          </div>

          {/* Card B: The Clear Verified OyaPlan Ledger */}
          <div className="bg-[#17191E] rounded-3xl border border-[#10B981]/40 p-6 sm:p-8 space-y-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/30">
                  WITH OYAPLAN · VERIFIED CLARITY
                </span>
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Squad sends 1 link with verified totals
              </h3>
              <p className="text-xs sm:text-sm text-[#9EA3B0] leading-relaxed">
                The squad lead shares your verified OyaPlan link. Dishes, VAT, 10% service charge, and corridor rides are locked in. Everyone knows their share.
              </p>
            </div>

            {/* Simulated Verified OyaPlan Till Slip Card */}
            <div className="bg-[#FAF8F2] text-[#14161C] rounded-2xl p-4 font-mono text-xs space-y-2.5 border border-[#272B35] shadow-md">
              <div className="flex justify-between items-center pb-2 border-b border-[#14161C]/15">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="font-bold text-[#14161C]">OYAPLAN VERIFIED TILL SLIP</span>
                </div>
                <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                  ✓ VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] sm:text-xs">
                <div className="flex justify-between">
                  <span>Squad of 4 (4 Mains + Cocktails)</span>
                  <span className="font-bold">₦64,000</span>
                </div>
                <div className="flex justify-between text-[#14161C]/75">
                  <span>VAT (7.5%) + Service Charge (10%)</span>
                  <span className="font-bold">₦11,200</span>
                </div>
                <div className="flex justify-between text-[#14161C]/75">
                  <span>Corridor Transport (Est. Mainland ↔ VI)</span>
                  <span className="font-bold">₦14,000</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#14161C]/10 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#14161C]/60 block uppercase font-bold">Total Planned Spend</span>
                  <span className="text-base font-black text-[#14161C]">₦89,200</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#14161C]/60 block uppercase font-bold">Per Person Split</span>
                  <span className="text-base font-black text-[#10B981]">₦22,300 / head</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-mono font-bold">
              Result: Table reserved &amp; deposit sent directly to your bank.
            </div>
          </div>

        </div>

        {/* 3 Operational Proof Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-[#14161C] border border-[#232733] space-y-2">
            <span className="text-xs font-mono font-bold text-[#E59A28] uppercase">Price Perception</span>
            <h4 className="text-sm font-bold text-white">Date Night is ₦30k, not ₦100k</h4>
            <p className="text-xs text-[#9EA3B0] leading-relaxed">
              Planners often overestimate high-end spots. Showing verified splits brings in customers who used to scroll past.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161C] border border-[#232733] space-y-2">
            <span className="text-xs font-mono font-bold text-[#10B981] uppercase">Zero Surprise Billing</span>
            <h4 className="text-sm font-bold text-white">No arguments at the table</h4>
            <p className="text-xs text-[#9EA3B0] leading-relaxed">
              Taxes, service charges, and corkage policies are agreed on in the group chat before guests leave their house.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14161C] border border-[#232733] space-y-2">
            <span className="text-xs font-mono font-bold text-[#E59A28] uppercase">Corridor Math</span>
            <h4 className="text-sm font-bold text-white">Mainland to Island Surges</h4>
            <p className="text-xs text-[#9EA3B0] leading-relaxed">
              Guests factor in ₦10k–₦14k Uber/Bolt fares so their whole evening stays inside budget.
            </p>
          </div>
        </div>

        {/* Section Bottom CTA */}
        <div className="pt-4 border-t border-[#232733] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <span className="text-[#9EA3B0]">
            Take charge of what people think your spot costs.
          </span>

          <Link
            href="/business/claim"
            className="h-11 px-5 bg-[#E59A28] hover:bg-[#D48B1B] text-[#0D0E11] font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all tap-feedback shrink-0 cursor-pointer"
          >
            <span>Claim Your Venue Free →</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

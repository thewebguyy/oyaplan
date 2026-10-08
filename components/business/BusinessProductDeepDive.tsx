"use client";

import React from "react";
import { Tag, ShieldCheck, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BusinessProductDeepDive() {
  return (
    <section className="py-20 sm:py-28 bg-[#141210] text-[#F5F1E8] border-t border-[#2D2823]" id="why-outside-math">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E59A28]/15 border border-[#E59A28]/35 text-[#E59A28] text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E59A28]" />
            <span>WHY THE OUTSIDE MATH MATTERS</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-serif leading-tight">
            Rumors kill walk-ins. Clarity fills tables.
          </h2>
          
          <p className="text-base sm:text-lg text-[#A0978C] leading-relaxed">
            In Lagos, one tweet about &quot;secret service charges&quot; or outdated menu prices can make thousands of people think your spot is unaffordable. OyaPlan replaces group-chat guesswork with your verified numbers.
          </p>
        </div>

        {/* 3 Core Problem Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 01: Price Perception */}
          <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-7 space-y-6 flex flex-col justify-between hover:border-[#E59A28]/40 transition-all shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#E59A28] bg-[#E59A28]/10 px-3 py-1 rounded-full border border-[#E59A28]/25">
                  PRICE PERCEPTION
                </span>
                <Tag className="w-5 h-5 text-[#E59A28]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight leading-snug">
                Show them a Date Night is ₦30k, not ₦100k.
              </h3>

              <p className="text-xs sm:text-sm text-[#A0978C] leading-relaxed">
                Planners often overestimate what your spot costs. By locking in verified packages for Solo Waka, Date Night (2 pax), and Squad Linkups (4+ pax), you capture budgets that used to scroll past you.
              </p>
            </div>

            {/* Simulated Receipt Component */}
            <div className="bg-[#F7F4EC] text-[#141210] rounded-2xl p-4 font-mono text-xs space-y-2 border border-[#2D2823]">
              <div className="flex justify-between items-center pb-1.5 border-b border-[#141210]/15">
                <span className="font-bold">VERIFIED DATE NIGHT</span>
                <span className="text-[10px] font-bold text-[#12A165]">✓ LOCKED</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>2x Mains + Drinks:</span>
                <span className="font-bold">₦22,000</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#12A165]">
                <span>Taxes &amp; Service Included:</span>
                <span className="font-bold">₦3,850</span>
              </div>
            </div>
          </div>

          {/* Card 02: Zero Surprise Billing */}
          <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-7 space-y-6 flex flex-col justify-between hover:border-[#12A165]/40 transition-all shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#12A165] bg-[#12A165]/10 px-3 py-1 rounded-full border border-[#12A165]/25">
                  ZERO SURPRISE BILLING
                </span>
                <ShieldCheck className="w-5 h-5 text-[#12A165]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight leading-snug">
                No more &quot;Where did 7.5% VAT come from?&quot; at the table.
              </h3>

              <p className="text-xs sm:text-sm text-[#A0978C] leading-relaxed">
                When guests build their plan on OyaPlan, your 7.5% VAT, 10% service charge, corkage rules, and terrace minimums are already calculated into their per-person split before they step outside.
              </p>
            </div>

            {/* Simulated Receipt Component */}
            <div className="bg-[#F7F4EC] text-[#141210] rounded-2xl p-4 font-mono text-xs space-y-2 border border-[#2D2823]">
              <div className="flex justify-between items-center pb-1.5 border-b border-[#141210]/15">
                <span className="font-bold">ITEMIZED BREAKDOWN</span>
                <span className="text-[10px] font-bold text-[#141210]">PRE-AGREED</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>VAT (7.5%):</span>
                <span className="font-bold">Calculated</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Service Charge (10%):</span>
                <span className="font-bold">Calculated</span>
              </div>
            </div>
          </div>

          {/* Card 03: Zone-Modeled Demand */}
          <div className="bg-[#1E1B18] rounded-3xl border border-[#2D2823] p-7 space-y-6 flex flex-col justify-between hover:border-[#E85C33]/40 transition-all shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#E85C33] bg-[#E85C33]/10 px-3 py-1 rounded-full border border-[#E85C33]/25">
                  ZONE-MODELED DEMAND
                </span>
                <MapPin className="w-5 h-5 text-[#E85C33]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight leading-snug">
                Price your packages for where guests are coming from.
              </h3>

              <p className="text-xs sm:text-sm text-[#A0978C] leading-relaxed">
                A squad coming from Yaba or Ikeja to Lekki Phase 1 has ₦10,000–₦14,000 of transport built into their outing budget. See how ride surges impact your total per-head cost and create bundles that make the trip worth it.
              </p>
            </div>

            {/* Simulated Transport Buffer Component */}
            <div className="bg-[#F7F4EC] text-[#141210] rounded-2xl p-4 font-mono text-xs space-y-2 border border-[#2D2823]">
              <div className="flex justify-between items-center pb-1.5 border-b border-[#141210]/15">
                <span className="font-bold">CORRIDOR BUFFER</span>
                <span className="text-[10px] font-bold text-[#E85C33]">IKEJA ↔ LEKKI</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Round-Trip Ride:</span>
                <span className="font-bold">~₦12,000</span>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Footer Callout */}
        <div className="pt-6 border-t border-[#2D2823] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <span className="text-[#A0978C]">
            Ready to control the math people see before they step out?
          </span>

          <Link
            href="/business/claim"
            className="h-11 px-6 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all tap-feedback shrink-0"
          >
            <span>Inspect Your Till Slip →</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

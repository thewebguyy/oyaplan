"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export function VerifiedReceiptCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-md mx-auto transition-all duration-300 transform select-none"
    >
      {/* Golden / Emerald Halo Glow Behind Slip */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#F9E828]/20 via-[#008751]/20 to-[#F9E828]/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Perforated Till Slip Container */}
      <div className="relative bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#111111] font-mono overflow-hidden">
        
        {/* Top Perforated Receipt Cut Line */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-[#111111]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#111111]">
              Lagos Reality Check
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#666666] tracking-wider">
            POS #OY-7402
          </span>
        </div>

        {/* Receipt Header */}
        <div className="py-4 text-center border-b border-[#E5E5DE] space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-[#111111] font-display">
            The Outside Math Till Slip
          </p>
          <p className="text-[10px] text-[#777777] font-medium">
            Saturday Night Outing • Island Corridor
          </p>
        </div>

        {/* Itemized Outing Costs */}
        <div className="py-4 space-y-3.5 text-xs text-[#111111]">
          {/* Item 1 */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-bold">Asun &amp; Cocktails for 2</p>
              <p className="text-[10px] text-[#777777]">Actual audited menu pricing</p>
            </div>
            <span className="font-black tabular-nums shrink-0">₦35,000</span>
          </div>

          {/* Item 2 */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-bold">Mainland to Island Transport</p>
              <p className="text-[10px] text-[#777777]">Third Mainland traffic buffer</p>
            </div>
            <span className="font-black tabular-nums shrink-0">₦5,000</span>
          </div>

          {/* Item 3 */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-bold text-[#C2410C]">The Dreaded 7.5% VAT + 10% Service</p>
              <p className="text-[10px] text-[#777777]">No surprise bill at checkout</p>
            </div>
            <span className="font-black text-[#C2410C] tabular-nums shrink-0">₦4,000</span>
          </div>
        </div>

        {/* Bottom Perforated Divider */}
        <div className="border-t-2 border-dashed border-[#111111] my-2" />

        {/* Total Peace of Mind */}
        <div className="pt-3 pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-black text-[#111111] block font-display">
              Total Peace of Mind
            </span>
            <span className="text-[10px] text-[#008751] font-bold">
              ₦22,000 per head locked in advance
            </span>
          </div>
          <span className="text-2xl font-black text-[#111111] tabular-nums">
            ₦44,000
          </span>
        </div>

        {/* The Green "OyaPlan Verified - No Surprises" Stamp */}
        <div className="relative pt-2 pb-1 flex justify-center">
          <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008751] text-white border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider font-display">
                OyaPlan Verified — No Surprises
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Barcode Motif */}
        <div className="pt-4 border-t border-[#E5E5DE] flex flex-col items-center gap-1.5 opacity-60">
          <div className="flex items-center gap-1 h-5 w-48 justify-center">
            {[2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 4, 2, 5, 1, 3, 2, 4].map((h, i) => (
              <span
                key={i}
                className="bg-[#111111] rounded-xs"
                style={{ width: `${h}px`, height: "100%" }}
              />
            ))}
          </div>
          <span className="text-[9px] text-[#777777] uppercase tracking-widest font-mono">
            Zero Mystery Billing • Pocket Protected
          </span>
        </div>
      </div>
    </div>
  );
}

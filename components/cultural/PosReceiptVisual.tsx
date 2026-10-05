"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/lib/ui/haptics";

interface PosReceiptVisualProps {
  className?: string;
  venueName?: string;
  totalCost?: number;
  perPerson?: number;
  squadSize?: number;
  onTearOff?: () => void;
}

/**
 * POS Approved Tear-Off Visual:
 * A realistic, tactile matte black Lagos POS terminal illustration.
 * When a plan is finalized, the terminal screen lights up with "PLAN READY",
 * feeds a till slip upward, and lets the user tear it off with a physical snap.
 * Never implies an actual bank charge or financial transaction occurred.
 */
export function PosReceiptVisual({
  className = "",
  venueName = "Lagos Outing",
  totalCost = 35000,
  perPerson = 17500,
  squadSize = 2,
  onTearOff,
}: PosReceiptVisualProps) {
  const [isTorn, setIsTorn] = useState(false);

  const handleTear = () => {
    if (isTorn) return;
    triggerHaptic("heavy");
    setIsTorn(true);
    onTearOff?.();
  };

  return (
    <div className={`relative flex flex-col items-center select-none font-mono ${className}`}>
      {/* Till Slip (Feeds Upward from Terminal Slot) */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={isTorn ? { y: -30, opacity: 0.9, rotate: -3 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={handleTear}
        className={`w-56 bg-white text-[#111111] border border-[#E5E5DE] rounded-t-lg p-3.5 shadow-md cursor-pointer transition-shadow hover:shadow-lg ${
          isTorn ? "border-dashed border-[#111111]/40" : ""
        }`}
        title="Tap to tear off plan receipt"
      >
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-dashed border-gray-300 pb-1.5">
          <span>THE OUTSIDE MATH</span>
          <span>PLAN READY</span>
        </div>

        <div className="py-2 space-y-1">
          <p className="text-xs font-black uppercase truncate text-[#111111]">{venueName}</p>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Squad ({squadSize}x):</span>
            <span className="font-bold text-[#111111]">₦{perPerson.toLocaleString("en-NG")}/head</span>
          </div>
          <div className="flex justify-between text-xs font-black pt-1 border-t border-gray-200">
            <span>TOTAL:</span>
            <span className="text-[#111111]">₦{totalCost.toLocaleString("en-NG")}</span>
          </div>
        </div>

        {/* Perforated Tear Line Edge */}
        <div className="border-b-2 border-dashed border-gray-400 pt-1 -mx-3.5 flex justify-center">
          <span className="text-[8px] uppercase tracking-wider text-gray-400 bg-white px-1 -mb-2">
            {isTorn ? "TORN ✓" : "TEAR OFF ✂"}
          </span>
        </div>
      </motion.div>

      {/* POS Terminal Hardware Body */}
      <div className="relative z-10 w-64 bg-[#141619] rounded-2xl border-2 border-[#2A2E35] p-4 shadow-2xl space-y-3 -mt-1 text-white">
        {/* Paper Feed Slot */}
        <div className="w-full h-2.5 bg-[#0A0B0D] rounded-full mx-auto border border-black shadow-inner" />

        {/* Illuminated Terminal Screen */}
        <div className="bg-[#1C2026] rounded-xl p-3 border border-white/10 shadow-inner space-y-1">
          <div className="flex items-center justify-between text-[9px] text-[#A0AEC0]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>ONLINE</span>
            </span>
            <span>LAGOS LEISURE</span>
          </div>
          <div className="text-center py-1">
            <span className="text-sm font-black text-[#F9E828] uppercase tracking-wider">
              PLAN CONFIRMED
            </span>
            <span className="text-[10px] text-gray-400 block font-sans">Zero bill shock ready</span>
          </div>
        </div>

        {/* Tactile Keypad Details */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 opacity-70">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "✕", 0, "OK"].map((key, i) => (
            <div
              key={i}
              className={`h-5 rounded-md flex items-center justify-center text-[10px] font-bold border border-white/5 ${
                key === "OK" ? "bg-[#10B981]/20 text-[#10B981]" : key === "✕" ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#20242C] text-gray-400"
              }`}
            >
              {key}
            </div>
          ))}
        </div>

        {/* Status Footnote */}
        <p className="text-[9px] text-center text-gray-500 uppercase tracking-widest pt-1">
          BUDGET ENGINE • OYAPLAN
        </p>
      </div>
    </div>
  );
}

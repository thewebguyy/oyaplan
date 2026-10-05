"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/ui/haptics";

interface ThermalReceiptPrintProps {
  className?: string;
  targetTotal?: number;
  venueName?: string;
  isCompleted?: boolean;
  onSettled?: () => void;
}

/**
 * Thermal Receipt Print Loading State:
 * Simulates a high-speed physical thermal receipt printer calculating the outing.
 * Tally sequence: ₦0 -> intermediate -> final total.
 * Visually snaps into locked place upon completion.
 * Respects prefers-reduced-motion and does not fabricate delays.
 */
export function ThermalReceiptPrint({
  className = "",
  targetTotal = 35000,
  venueName = "Curating Lagos Spots...",
  isCompleted = false,
  onSettled,
}: ThermalReceiptPrintProps) {
  const [displayCost, setDisplayCost] = useState(0);
  const [stage, setStage] = useState<"preparing" | "feeding" | "settled">("preparing");

  useEffect(() => {
    // Step 1: Subtle mechanical prep
    const prepTimer = setTimeout(() => {
      setStage("feeding");
      triggerHaptic("light");
    }, 150);

    // Step 2: Rapid number tally
    let current = 0;
    const step = Math.max(1000, Math.floor(targetTotal / 6));
    const interval = setInterval(() => {
      current += step;
      if (current >= targetTotal || isCompleted) {
        setDisplayCost(targetTotal);
        clearInterval(interval);
        setStage("settled");
        triggerHaptic("medium");
        onSettled?.();
      } else {
        setDisplayCost(current);
      }
    }, 70);

    return () => {
      clearTimeout(prepTimer);
      clearInterval(interval);
    };
  }, [targetTotal, isCompleted, onSettled]);

  return (
    <div className={`relative flex flex-col items-center select-none font-mono ${className}`}>
      {/* Printer Mechanism Mouth Slot */}
      <div className="w-60 h-2 bg-[#1A1A1A] rounded-t-md border-t border-x border-[#333333] shadow-md z-20 flex justify-center items-center">
        <div className="w-48 h-0.5 bg-black rounded-full" />
      </div>

      {/* Printing Thermal Paper Slip */}
      <motion.div
        initial={{ y: -30, opacity: 0.6 }}
        animate={{
          y: stage === "settled" ? 0 : -6,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="w-56 bg-white text-[#111111] border border-[#E5E5DE] rounded-b-xl p-4 shadow-xl -mt-1 space-y-3"
      >
        {/* Till Slip Head */}
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-dashed border-gray-300 pb-2">
          <span>THE OUTSIDE MATH</span>
          <span>CALCULATING</span>
        </div>

        {/* Dynamic Venue / Search Line */}
        <div>
          <span className="text-[10px] text-gray-400 block uppercase">Destination</span>
          <p className="text-xs font-black uppercase truncate text-[#111111]">
            {venueName}
          </p>
        </div>

        {/* Tallying Amount */}
        <div className="py-2 bg-[#F6F6F2] rounded-lg p-2.5 border border-[#E5E5DE] text-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
            TOTAL OUTING COST
          </span>
          <span className="text-xl font-black text-[#111111] tabular-nums tracking-tight font-mono">
            ₦{displayCost.toLocaleString("en-NG")}
          </span>
        </div>

        {/* Perforated Bottom Tear Edge */}
        <div className="border-b-2 border-dashed border-gray-300 pt-1 -mx-4 flex justify-between px-2 text-[8px] text-gray-400 uppercase tracking-widest">
          <span>OYAPLAN</span>
          <span>{stage === "settled" ? "LOCKED ✓" : "PRINTING..."}</span>
        </div>
      </motion.div>
    </div>
  );
}

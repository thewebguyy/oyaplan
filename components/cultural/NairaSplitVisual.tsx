"use client";

import React from "react";
import { motion } from "framer-motion";

interface NairaSplitVisualProps {
  className?: string;
  totalCost: number;
  squadSize: number;
}

/**
 * Crisp Naira Bill Splitter:
 * Visualizes total spend splitting cleanly among the squad like stacked crisp notes.
 * Explains per-person arithmetic with a tactile dealing metaphor.
 * Values are strictly tied to canonical planning calculations.
 */
export function NairaSplitVisual({
  className = "",
  totalCost,
  squadSize,
}: NairaSplitVisualProps) {
  const safeSquad = Math.max(1, squadSize);
  const perPerson = Math.round(totalCost / safeSquad);

  // Show up to 5 visual stacks
  const displayStacks = Math.min(5, safeSquad);

  return (
    <div className={`bg-[#F6F6F2] border border-[#E5E5DE] rounded-2xl p-5 font-mono space-y-4 text-left ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2 text-xs">
        <span className="font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
          <span>The Math Split ({safeSquad} {safeSquad === 1 ? "Person" : "People"})</span>
        </span>
        <span className="text-[10px] text-gray-500 font-bold uppercase">
          Clean Division
        </span>
      </div>

      {/* Visual Currency Note Stacks */}
      <div className="py-2 flex items-center justify-center gap-3 overflow-x-auto">
        {Array.from({ length: displayStacks }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 12, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              delay: idx * 0.08,
            }}
            className="flex-1 min-w-[70px] max-w-[110px] bg-white border border-[#111111]/20 rounded-xl p-2.5 shadow-sm text-center relative group"
          >
            {/* Note Stack Edge Effect */}
            <div className="absolute -top-1 inset-x-2 h-1 bg-[#E5E5DE] rounded-t-sm border border-[#111111]/10 -z-10" />

            <span className="text-[9px] font-bold text-gray-400 block uppercase">
              {safeSquad === 1 ? "Solo" : `Member 0${idx + 1}`}
            </span>
            <span className="text-xs font-black text-[#111111] block tabular-nums mt-0.5">
              ₦{perPerson.toLocaleString("en-NG")}
            </span>
            <span className="text-[8px] font-bold text-[#111111] bg-[#F9E828] px-1 py-0.2 rounded inline-block mt-1">
              CLEAN
            </span>
          </motion.div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E5E5DE] text-xs">
        <span className="text-gray-500 text-[11px]">Total Outing Cost:</span>
        <span className="font-black text-[#111111] tabular-nums">
          ₦{totalCost.toLocaleString("en-NG")}
        </span>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface OwambeSuccessVisualProps {
  className?: string;
  squadCount?: number;
  message?: string;
}

/**
 * Owambe High-Joy Success Visual:
 * Sophisticated Nigerian celebration metaphor inspired by graceful currency sprays at high-end Owambes.
 * Uses realistic paper physics, gold foil accents, and warm ambient glow.
 * Reserved strictly for genuine completion moments: squad fully assembled or verified visit pass unlocked.
 */
export function OwambeSuccessVisual({
  className = "",
  squadCount = 4,
  message = "Squad Confirmed & Locked",
}: OwambeSuccessVisualProps) {
  // 6 restrained, elegant floating paper notes
  const notes = [
    { x: -50, y: -20, rotate: -15, delay: 0 },
    { x: 45, y: -30, rotate: 18, delay: 0.1 },
    { x: -70, y: 30, rotate: 22, delay: 0.2 },
    { x: 60, y: 35, rotate: -12, delay: 0.15 },
    { x: -20, y: -50, rotate: 8, delay: 0.25 },
    { x: 25, y: 55, rotate: -25, delay: 0.3 },
  ];

  return (
    <div className={`relative bg-[#111111] text-[#F6F6F2] rounded-2xl p-6 border-2 border-[#F9E828]/40 overflow-hidden shadow-2xl font-mono text-center select-none ${className}`}>
      {/* Warm Golden Celebration Aura */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(249, 232, 40, 0.35), transparent 70%)",
        }}
      />

      {/* Floating Crisp Notes Stage */}
      <div className="relative h-28 flex items-center justify-center">
        {notes.map((n, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: 1,
              opacity: [0, 1, 0.85],
              x: n.x,
              y: n.y,
              rotate: n.rotate,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: n.delay,
            }}
            className="absolute w-16 h-9 rounded bg-[#F9E828] text-[#111111] font-mono font-black text-[8px] flex flex-col justify-between p-1 border border-white shadow-lg"
          >
            <div className="flex justify-between items-center text-[6px]">
              <span>₦</span>
              <span>OYAPLAN</span>
            </div>
            <div className="text-center font-bold text-[7px] tracking-widest">
              LAGOS
            </div>
            <div className="text-right text-[6px]">✓</div>
          </motion.div>
        ))}

        {/* Centerpiece Trophy/Trophy Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
          className="relative z-10 w-14 h-14 rounded-2xl bg-black border-2 border-[#F9E828] flex items-center justify-center text-[#F9E828] text-xl font-black shadow-xl"
        >
          ✓
        </motion.div>
      </div>

      {/* Headline & Details */}
      <div className="space-y-1 relative z-10 mt-2">
        <h3 className="text-lg font-black font-display uppercase tracking-tight text-white">
          {message}
        </h3>
        <p className="text-xs text-[#F9E828] font-bold">
          {squadCount} people on the same page. Zero bill surprises.
        </p>
      </div>
    </div>
  );
}

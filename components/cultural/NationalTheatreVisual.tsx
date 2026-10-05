"use client";

import React from "react";
import { motion } from "framer-motion";

interface NationalTheatreVisualProps {
  className?: string;
  venueName?: string;
  genre?: string;
}

/**
 * National Theatre Cultural Music Visual:
 * Minimal, architectural representation of Lagos's iconic National Arts Theatre (Iganmu),
 * inspired by the military peaked-cap concrete structure.
 * Outlines subtly pulse with acoustic resonance. Used for Live Music, Afrobeats, and Cultural events.
 */
export function NationalTheatreVisual({
  className = "",
  venueName = "Live Afrobeats Venue",
  genre = "Live Music & Sound",
}: NationalTheatreVisualProps) {
  return (
    <div className={`relative bg-[#0E0F12] text-white rounded-2xl p-5 border border-white/10 overflow-hidden shadow-xl font-mono ${className}`}>
      {/* Deep Stage Light Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 60%, rgba(249, 232, 40, 0.25), transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <span className="font-bold text-[#F9E828] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828]" />
          <span>Cultural Sound Stage</span>
        </span>
        <span className="text-[10px] text-gray-400 font-mono uppercase">{genre}</span>
      </div>

      {/* National Theatre Iconic Peaked Cap Vector */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 340 120"
          className="w-full max-w-[320px] h-auto overflow-visible select-none"
          aria-hidden="true"
        >
          {/* Base Plinth */}
          <line x1="20" y1="95" x2="320" y2="95" stroke="#2D333F" strokeWidth="3" />

          {/* Soundwave Concentric Resonant Rings */}
          <motion.ellipse
            cx="170"
            cy="55"
            rx="75"
            ry="30"
            fill="none"
            stroke="#F9E828"
            strokeWidth="1"
            strokeDasharray="4 6"
            animate={{
              scale: [0.95, 1.08, 0.95],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Iconic Flared Crown Outline */}
          <path
            d="M 60 85 L 110 35 Q 170 15 230 35 L 280 85 Z"
            fill="#161A22"
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* Crown Peak Dent Center */}
          <path
            d="M 120 38 Q 170 48 220 38"
            fill="none"
            stroke="#F9E828"
            strokeWidth="2"
          />

          {/* Concrete Ribs */}
          {[95, 125, 155, 185, 215, 245].map((x, i) => (
            <line
              key={`rib-${i}`}
              x1={x}
              y1={85}
              x2={x + (x < 170 ? 10 : x > 170 ? -10 : 0)}
              y2={35}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
          ))}

          {/* Acoustic Central Pulse */}
          <motion.circle
            cx="170"
            cy="60"
            r="6"
            fill="#F9E828"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </svg>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="font-bold text-white truncate">{venueName}</span>
        <span className="text-[#F9E828] text-[11px] font-bold">Acoustic Soul</span>
      </div>
    </div>
  );
}

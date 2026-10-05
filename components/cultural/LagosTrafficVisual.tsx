"use client";

import React from "react";
import { motion } from "framer-motion";

interface LagosTrafficVisualProps {
  className?: string;
  roadName?: string;
  surgeMultiplier?: number;
  isRushHour?: boolean;
}

/**
 * Ozumba Go-Slow Traffic Visual:
 * Premium isometric/top-down Lagos road scene with animated waves of red tail lights.
 * Used when transport assumptions/scenarios indicate peak Lagos bridge/corridor delays.
 * Strictly labeled as a planning scenario, never claiming live GPS telematics.
 */
export function LagosTrafficVisual({
  className = "",
  roadName = "Ozumba Mbadiwe Corridor",
  surgeMultiplier = 1.3,
  isRushHour = true,
}: LagosTrafficVisualProps) {
  return (
    <div className={`relative bg-[#0A0C0E] text-white rounded-2xl p-5 border border-white/10 overflow-hidden shadow-xl font-mono ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E54D2E] animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[#E54D2E]">Transit Surge Scenario</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">SCENARIO MATH</span>
      </div>

      {/* Isometric/Top-Down Highway Scene */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 380 120"
          className="w-full max-w-[360px] h-auto overflow-visible select-none"
          aria-hidden="true"
        >
          {/* Asphalt Road Surface */}
          <rect x="10" y="20" width="360" height="80" rx="8" fill="#181B20" stroke="#282C35" strokeWidth="2" />

          {/* Lane Divider Lines */}
          <line x1="20" y1="60" x2="360" y2="60" stroke="#F9E828" strokeWidth="1.5" strokeDasharray="10 12" opacity="0.4" />

          {/* Lane 1 (Eastbound / Flowing Ahead) */}
          {[40, 110, 190, 270].map((x, i) => (
            <g key={`car1-${i}`}>
              {/* Car Body */}
              <rect x={x} y={32} width={28} height={14} rx="3" fill="#2E3440" stroke="#4C566A" strokeWidth="1" />
              {/* Headlights */}
              <circle cx={x + 28} cy={35} r={1.5} fill="#FFF9D2" opacity="0.9" />
              <circle cx={x + 28} cy={43} r={1.5} fill="#FFF9D2" opacity="0.9" />
              {/* Red Tail Lights */}
              <motion.circle
                cx={x}
                cy={35}
                r={2}
                fill="#FF3B30"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
              <motion.circle
                cx={x}
                cy={43}
                r={2}
                fill="#FF3B30"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            </g>
          ))}

          {/* Lane 2 (Heavy Go-Slow Wave / Packed Traffic) */}
          {[30, 75, 125, 175, 230, 280, 330].map((x, i) => (
            <g key={`car2-${i}`}>
              {/* Car Body */}
              <rect x={x} y={74} width={26} height={14} rx="3" fill={i % 2 === 0 ? "#21252D" : "#2B303A"} stroke="#3F4654" strokeWidth="1" />
              {/* Braking Red Tail Lights Wave */}
              <motion.circle
                cx={x}
                cy={77}
                r={2.5}
                fill="#FF3333"
                animate={{
                  opacity: [0.4, 1, 0.4],
                  filter: ["drop-shadow(0 0 2px #FF3333)", "drop-shadow(0 0 6px #FF0000)", "drop-shadow(0 0 2px #FF3333)"],
                }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
              <motion.circle
                cx={x}
                cy={85}
                r={2.5}
                fill="#FF3333"
                animate={{
                  opacity: [0.4, 1, 0.4],
                  filter: ["drop-shadow(0 0 2px #FF3333)", "drop-shadow(0 0 6px #FF0000)", "drop-shadow(0 0 2px #FF3333)"],
                }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Corridor Description */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-white block">{roadName}</span>
          <span className="text-[10px] text-gray-400">Peak hours buffer accounted for</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-[#F9E828]">+{Math.round((surgeMultiplier - 1) * 100)}% Surge Buffer</span>
          <span className="text-[10px] text-gray-400 block font-mono">No surprise bills</span>
        </div>
      </div>
    </div>
  );
}

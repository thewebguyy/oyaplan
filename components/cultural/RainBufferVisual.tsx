"use client";

import React from "react";
import { motion } from "framer-motion";

interface RainBufferVisualProps {
  className?: string;
  isRainActive?: boolean;
  onToggleRain?: () => void;
  additionalBuffer?: number;
}

/**
 * Rain Buffer / Lekki Puddle Visual:
 * Isometric Lagos street scene illustrating the impact of wet-weather traffic on ride fares.
 * Copy: "Rain changes the maths. Lagos rain tax. Plan for it."
 * Strictly distinguishes scenario planning from real-time meteorological or Bolt surge APIs.
 */
export function RainBufferVisual({
  className = "",
  isRainActive = false,
  onToggleRain,
  additionalBuffer = 3500,
}: RainBufferVisualProps) {
  return (
    <div className={`relative bg-[#0D1117] text-white rounded-2xl p-5 border border-white/10 overflow-hidden shadow-xl font-mono ${className}`}>
      {/* Cool Wet Ambient Sheen */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: isRainActive
            ? "radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.25), transparent 75%)"
            : "none",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <span className="font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          <span>Wet-Weather Scenario</span>
        </span>
        <span className="text-[10px] text-gray-400 font-mono">SCENARIO PLANNING</span>
      </div>

      {/* Isometric Street Scene */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 320 120"
          className="w-full max-w-[300px] h-auto overflow-visible select-none"
          aria-hidden="true"
        >
          {/* Asphalt Road Surface */}
          <polygon points="40,90 280,90 260,35 60,35" fill="#1C2128" stroke="#30363D" strokeWidth="1.5" />

          {/* Concrete Curb */}
          <line x1="38" y1="92" x2="282" y2="92" stroke="#484F58" strokeWidth="4" />

          {/* Expanding Lekki Puddle */}
          <motion.ellipse
            cx="160"
            cy="68"
            rx={isRainActive ? 55 : 20}
            ry={isRainActive ? 18 : 6}
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth={isRainActive ? 1.5 : 0.5}
            animate={{
              scale: isRainActive ? [1, 1.04, 1] : 1,
              opacity: isRainActive ? [0.8, 1, 0.8] : 0.3,
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Rain Streaks (Only active when scenario is enabled) */}
          {isRainActive && (
            <g stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
              {[80, 120, 150, 190, 230].map((x, i) => (
                <motion.line
                  key={`rain-${i}`}
                  x1={x}
                  y1={10}
                  x2={x - 12}
                  y2={35}
                  animate={{ y: [0, 20, 0], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </g>
          )}

          {/* Vehicle Silhouette Negotiating the Puddle */}
          <g>
            <rect x="180" y="48" width="34" height="18" rx="4" fill="#333A44" stroke="#6E7681" strokeWidth="1" />
            <circle cx="187" cy="66" r="3.5" fill="#0D1117" />
            <circle cx="207" cy="66" r="3.5" fill="#0D1117" />
            {/* Water Spray Particle Ripples */}
            {isRainActive && (
              <circle cx="178" cy="66" r="2" fill="#38BDF8" opacity="0.7" />
            )}
          </g>
        </svg>
      </div>

      {/* Copy & Optional Scenario Toggle */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-white block">
            {isRainActive ? "Rain changes the maths." : "Standard dry-weather buffer"}
          </span>
          <span className="text-[10px] text-gray-400 block">Lagos rain tax. Plan for it.</span>
        </div>

        {onToggleRain && (
          <button
            type="button"
            onClick={onToggleRain}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isRainActive
                ? "bg-[#38BDF8] text-[#0A0D12] shadow-xs"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {isRainActive ? `+₦${additionalBuffer.toLocaleString("en-NG")} Active` : "+ Simulate Rain"}
          </button>
        )}
      </div>
    </div>
  );
}

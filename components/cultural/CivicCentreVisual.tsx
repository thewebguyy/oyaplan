"use client";

import React from "react";
import { motion } from "framer-motion";

interface CivicCentreVisualProps {
  className?: string;
  venueName?: string;
  categoryName?: string;
}

/**
 * Civic Centre Waterfront Architecture Visual:
 * Sophisticated architectural study of Lagos Island modern waterfront facades.
 * Features illuminated glass pylons, reflections in the lagoon, and progressive ambient lighting.
 * Used for Premium, Rooftop, and Elevated Nightlife categories.
 */
export function CivicCentreVisual({
  className = "",
  venueName = "Island Rooftop",
  categoryName = "VIP & Premium Lounge",
}: CivicCentreVisualProps) {
  return (
    <div className={`relative bg-[#0E1116] text-white rounded-2xl p-5 border border-white/10 overflow-hidden shadow-2xl font-mono ${className}`}>
      {/* Night Sky & Waterfront Ambient Glow */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(249, 232, 40, 0.2), transparent 75%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <span className="font-bold text-[#F9E828] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828]" />
          <span>Lagos Waterfront Vibe</span>
        </span>
        <span className="text-[10px] text-gray-400 font-mono uppercase">{categoryName}</span>
      </div>

      {/* Architectural Waterfront Skyline */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 360 120"
          className="w-full max-w-[340px] h-auto overflow-visible select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lagoonWater" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1A202C" />
              <stop offset="100%" stopColor="#0B0D11" />
            </linearGradient>
            <linearGradient id="glassFacade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D3748" />
              <stop offset="100%" stopColor="#1A202C" />
            </linearGradient>
          </defs>

          {/* Water Surface Base */}
          <rect x="0" y="90" width="360" height="30" fill="url(#lagoonWater)" />
          <line x1="0" y1="90" x2="360" y2="90" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

          {/* Background Distant Towers */}
          <rect x="40" y="45" width="35" height="45" fill="#1A1E24" />
          <rect x="290" y="38" width="40" height="52" fill="#171A20" />

          {/* Civic Centre Cantilever Geometric Shell */}
          <path
            d="M 100 90 L 120 25 L 240 25 L 260 90 Z"
            fill="url(#glassFacade)"
            stroke="#4A5568"
            strokeWidth="1.5"
          />

          {/* Glass Ribs & Louvers */}
          {[135, 155, 180, 205, 225].map((x, i) => (
            <line
              key={`rib-${i}`}
              x1={x}
              y1={25}
              x2={x + (x < 180 ? -8 : x > 180 ? 8 : 0)}
              y2={90}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
          ))}

          {/* Warm Illuminated Floor Slabs */}
          {[42, 58, 74].map((y, i) => (
            <motion.line
              key={`slab-${i}`}
              x1={115 + i * 2}
              y1={y}
              x2={245 - i * 2}
              y2={y}
              stroke="#F9E828"
              strokeWidth="2"
              animate={{
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Waterfront Lagoon Reflection Ripple */}
          <motion.ellipse
            cx="180"
            cy="102"
            rx="60"
            ry="4"
            fill="#F9E828"
            opacity="0.15"
            animate={{
              scaleX: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Subtitle */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="font-bold text-white truncate">{venueName}</span>
        <span className="text-[#F9E828] text-[11px] font-bold">Curated Atmosphere</span>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface SuyaWrapVisualProps {
  className?: string;
  venueName?: string;
  pricePerPerson?: number;
}

/**
 * Suya Wrap Street Food Visual:
 * Sophisticated material study of late-night Lagos street dining:
 * folded newspaper parcel, translucent black nylon bag, grilled texture, sliced onions.
 * Respectful, atmospheric, and realistic — never cartoonish or generic.
 */
export function SuyaWrapVisual({
  className = "",
  venueName = "Lagos Street Chop",
  pricePerPerson = 4500,
}: SuyaWrapVisualProps) {
  return (
    <div className={`relative bg-[#121110] text-[#F6F6F2] rounded-2xl p-5 border border-[#2D2A26] overflow-hidden shadow-xl font-mono ${className}`}>
      {/* Warm Sodium Street-Light Ambient Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 60% 20%, rgba(249, 140, 40, 0.25), transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2D2A26] pb-3 text-xs">
        <span className="font-bold text-[#F9A825] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F9A825]" />
          <span>Street Food &amp; Lowkey Grill</span>
        </span>
        <span className="text-[10px] text-gray-400 font-mono">AFFORDABLE EXCELLENCE</span>
      </div>

      {/* Realistic Newspaper & Parcel Study */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 280 120"
          className="w-full max-w-[260px] h-auto overflow-visible select-none"
          aria-hidden="true"
        >
          {/* Black Translucent Nylon Base */}
          <path
            d="M 40 100 Q 20 60 70 30 Q 140 15 210 30 Q 260 60 240 100 Q 140 115 40 100 Z"
            fill="#1E1C1A"
            stroke="#38332E"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Folded Newspaper Layers */}
          <path
            d="M 60 85 L 85 35 L 205 38 L 225 85 Z"
            fill="#EAE6DF"
            stroke="#C5BFB5"
            strokeWidth="1"
          />
          {/* Newsprint Faux Columns */}
          {[48, 56, 64, 72].map((y, i) => (
            <line
              key={`news-${i}`}
              x1="90"
              y1={y}
              x2="195"
              y2={y}
              stroke="#666158"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.5"
            />
          ))}

          {/* Hot Grilled Skewers / Suya Pieces with Yaji Spice */}
          <g>
            {/* Wooden Skewer Sticks */}
            <line x1="70" y1="92" x2="210" y2="40" stroke="#B89772" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="96" x2="220" y2="44" stroke="#B89772" strokeWidth="2.5" strokeLinecap="round" />

            {/* Suya Slices */}
            {[100, 130, 160, 185].map((cx, i) => (
              <rect
                key={`suya-${i}`}
                x={cx - 10}
                y={68 - i * 8}
                width="20"
                height="12"
                rx="3"
                fill="#5A2E16"
                stroke="#843E19"
                strokeWidth="1.5"
              />
            ))}

            {/* Sliced Purple/White Onion Rings */}
            <motion.ellipse
              cx="135"
              cy="58"
              rx="9"
              ry="5"
              fill="none"
              stroke="#C084FC"
              strokeWidth="2"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <ellipse cx="160" cy="50" rx="8" ry="4" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          </g>

          {/* Warm Grilling Vapor / Aroma Micro-wisps */}
          <motion.path
            d="M 140 45 Q 135 30 145 20 T 140 8"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={{
              opacity: [0.1, 0.4, 0.1],
              y: [-2, -8, -2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Footer Details */}
      <div className="pt-2 border-t border-[#2D2A26] flex items-center justify-between text-xs">
        <span className="font-bold text-white truncate">{venueName}</span>
        <span className="text-[#F9A825] font-bold tabular-nums">~₦{pricePerPerson.toLocaleString("en-NG")} / person</span>
      </div>
    </div>
  );
}

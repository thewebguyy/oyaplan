"use client";

import React from "react";
import { motion } from "framer-motion";

interface LinkBridgeVisualProps {
  className?: string;
  originName?: string;
  destinationName?: string;
  transportEstimate?: string;
  isSimulated?: boolean;
}

/**
 * Lekki–Ikoyi Link Bridge Transit Visual:
 * Architectural isometric representation of the cable-stayed pylon,
 * tension cables, lagoon reflections, and a transit light moving across the deck.
 * Represents Lagos transit calculation without claiming live GPS telematics.
 */
export function LinkBridgeVisual({
  className = "",
  originName = "Island Hub",
  destinationName = "Venue",
  transportEstimate,
  isSimulated = false,
}: LinkBridgeVisualProps) {
  return (
    <div className={`relative bg-[#0D0F12] text-white rounded-2xl p-5 border border-white/10 overflow-hidden shadow-xl font-mono ${className}`}>
      {/* Background Architectural Grid & Lagoon Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 30%, rgba(249, 232, 40, 0.15), transparent 70%)",
        }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F9E828] animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[#F9E828]">Transit Calculation</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          {isSimulated ? "SCENARIO ESTIMATE" : "TYPICAL LAGOS ROUTE"}
        </span>
      </div>

      {/* Vector Bridge Graphic */}
      <div className="py-4 flex justify-center items-center">
        <svg
          viewBox="0 0 400 140"
          className="w-full max-w-[360px] h-auto text-white overflow-visible select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pylonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A4E57" />
              <stop offset="50%" stopColor="#7B828F" />
              <stop offset="100%" stopColor="#2A2E35" />
            </linearGradient>
            <linearGradient id="waterReflect" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(249, 232, 40, 0.25)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Water Lagoon Level */}
          <path d="M 10 115 Q 100 118 200 115 T 390 115" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" fill="none" />
          <path d="M 170 115 L 200 135 L 230 115 Z" fill="url(#waterReflect)" opacity="0.4" />

          {/* Road Deck */}
          <line x1="20" y1="95" x2="380" y2="95" stroke="#2D3139" strokeWidth="6" strokeLinecap="round" />
          <line x1="20" y1="95" x2="380" y2="95" stroke="#F9E828" strokeWidth="1" strokeDasharray="6 8" opacity="0.6" />

          {/* Iconic A-Frame Link Bridge Pylon */}
          {/* Left leg */}
          <line x1="170" y1="110" x2="197" y2="15" stroke="url(#pylonGrad)" strokeWidth="6" strokeLinecap="round" />
          {/* Right leg */}
          <line x1="230" y1="110" x2="203" y2="15" stroke="url(#pylonGrad)" strokeWidth="6" strokeLinecap="round" />
          {/* Cross brace */}
          <line x1="184" y1="65" x2="216" y2="65" stroke="#4A4E57" strokeWidth="3" />
          {/* Pylon Crown beacon */}
          <circle cx="200" cy="14" r="3" fill="#E54D2E" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="200" cy="14" r="2.5" fill="#E54D2E" />

          {/* Stay Cables (Left Side) */}
          <line x1="200" y1="30" x2="60" y2="93" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="200" y1="42" x2="100" y2="93" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
          <line x1="200" y1="54" x2="140" y2="93" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

          {/* Stay Cables (Right Side) */}
          <line x1="200" y1="30" x2="340" y2="93" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          <line x1="200" y1="42" x2="300" y2="93" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
          <line x1="200" y1="54" x2="260" y2="93" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

          {/* Moving Transit Light (Vehicle across bridge) */}
          <motion.circle
            cx="40"
            cy="93"
            r="4"
            fill="#F9E828"
            animate={{ cx: [40, 360] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="40"
            cy="93"
            r="8"
            fill="#F9E828"
            opacity="0.3"
            animate={{ cx: [40, 360] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Origin -> Destination Route Details */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono text-[11px]">{originName}</span>
          <span className="text-[#F9E828]">→</span>
          <span className="font-bold text-white text-[11px] truncate max-w-[120px]">{destinationName}</span>
        </div>
        {transportEstimate && (
          <span className="text-[#F9E828] font-bold font-mono text-xs tabular-nums">
            {transportEstimate}
          </span>
        )}
      </div>
    </div>
  );
}

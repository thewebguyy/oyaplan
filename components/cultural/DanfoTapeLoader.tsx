"use client";

import React from "react";

interface DanfoTapeLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Danfo Tape Loader:
 * A bold, tactile, black-and-yellow diagonal safety stripe moving decisively.
 * Inspired by the iconic Lagos yellow-and-black transit hazard stripes.
 */
export function DanfoTapeLoader({
  className = "",
  label = "Calculating Lagos Transit & Rates...",
  size = "md",
}: DanfoTapeLoaderProps) {
  const heightClass = size === "sm" ? "h-2.5" : size === "lg" ? "h-5" : "h-3.5";

  return (
    <div className={`w-full space-y-2 text-left font-mono ${className}`} role="status" aria-live="polite">
      {/* Decisive Moving Danfo Stripe */}
      <div className={`w-full ${heightClass} rounded-full overflow-hidden bg-[#111111] border border-black/40 relative shadow-inner`}>
        <div
          className="absolute inset-0 w-[200%] h-full animate-danfo-stripe"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              #F9E828,
              #F9E828 14px,
              #111111 14px,
              #111111 28px
            )`,
          }}
          aria-hidden="true"
        />
      </div>

      {label && (
        <div className="flex items-center justify-between text-[11px] text-[#555555]">
          <span className="font-bold uppercase tracking-wider text-[#111111]">{label}</span>
          <span className="text-[10px] text-[#888888] font-mono">0 LAGOS SURPRISES</span>
        </div>
      )}
    </div>
  );
}

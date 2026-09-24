"use client";

import React from "react";

interface PatternedBorderProps {
  className?: string;
  variant?: "wave" | "chevron" | "dots";
}

/**
 * Afro-modern geometric patterned accent border inspired by Chowdeck's signature decorative lips.
 * Used on the top borders of cards, banners, and modals to inject rich brand character.
 */
export function PatternedBorder({ className = "", variant = "wave" }: PatternedBorderProps) {
  if (variant === "chevron") {
    return (
      <div className={`w-full h-3 overflow-hidden ${className}`}>
        <svg
          className="w-full h-full text-brand-green"
          preserveAspectRatio="none"
          viewBox="0 0 120 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 12L6 0L12 12L18 0L24 12L30 0L36 12L42 0L48 12L54 0L60 12L66 0L72 12L78 0L84 12L90 0L96 12L102 0L108 12L114 0L120 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Default: Wavy geometric rhythm
  return (
    <div className={`w-full h-3 sm:h-3.5 overflow-hidden ${className}`}>
      <svg
        className="w-full h-full text-brand-green"
        preserveAspectRatio="none"
        viewBox="0 0 240 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 7C15 1 25 13 40 7C55 1 65 13 80 7C95 1 105 13 120 7C135 1 145 13 160 7C175 1 185 13 200 7C215 1 225 13 240 7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 12C15 6 25 18 40 12C55 6 65 18 80 12C95 6 105 18 120 12C135 6 145 18 160 12C175 6 185 18 200 12C215 6 225 18 240 12"
          stroke="#FF7A00"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

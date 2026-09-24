"use client";

import React from "react";

/**
 * Oversized Corner Graphic inspired by Chowdeck's signature off-screen hero illustrations.
 * Anchored to the right side of the hero, partially bleeding off-screen to communicate
 * dining, cocktails, and Lagos weekend outings dynamically without cluttering the copy.
 */
export function OversizedHeroGraphic() {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -right-16 sm:-right-24 md:-right-28 lg:-right-16 xl:-right-6 w-[320px] sm:w-[440px] md:w-[520px] lg:w-[580px] h-[320px] sm:h-[440px] md:h-[520px] lg:h-[580px] pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#008751]/20 via-[#FF7A00]/15 to-amber-200/10 rounded-full blur-3xl opacity-75 transform scale-90" />

      {/* Main SVG Vector Composition: Stylized Cocktail Coupe Glass & Badges */}
      <svg
        viewBox="0 0 540 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)] transform rotate-[-4deg] hover:rotate-[0deg] transition-transform duration-700 ease-out"
      >
        {/* ── Foreground Stylized Cocktail Coupe Glass ── */}
        <g transform="translate(10, 10)">
          {/* Stem & Base */}
          <path
            d="M260 460 C260 475 210 485 210 490 L350 490 C350 485 300 475 300 460 L300 350 L260 350 Z"
            fill="url(#stemGradient)"
          />
          <line x1="280" y1="350" x2="280" y2="475" stroke="#E5E0D8" strokeWidth="10" strokeLinecap="round" />

          {/* Coupe Bowl (Glass Contour) */}
          <path
            d="M160 210 C160 330 400 330 400 210 Z"
            fill="#FAF7F2"
            fillOpacity="0.4"
            stroke="#DCD5CA"
            strokeWidth="5"
          />

          {/* Cocktail Liquid (Sunset Aperol / Passionfruit) */}
          <path
            d="M172 225 C185 315 375 315 388 225 Z"
            fill="url(#cocktailLiquid)"
          />

          {/* Liquid Surface Highlight */}
          <ellipse cx="280" cy="225" rx="108" ry="14" fill="#FF8A3D" />
          <ellipse cx="280" cy="225" rx="96" ry="9" fill="#FFA559" />

          {/* Glass Rim Shimmer */}
          <path
            d="M160 210 C195 219 365 219 400 210"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Citrus Wheel Garnish */}
          <g transform="translate(145, 170) rotate(-25)">
            <circle cx="38" cy="38" r="38" fill="#FF7A00" />
            <circle cx="38" cy="38" r="34" fill="#FFC72C" />
            <circle cx="38" cy="38" r="30" fill="#FFA500" stroke="#FFF" strokeWidth="2.5" />
            {/* Citrus Segments */}
            <line x1="38" y1="8" x2="38" y2="68" stroke="#FFF" strokeWidth="2.5" />
            <line x1="8" y1="38" x2="68" y2="38" stroke="#FFF" strokeWidth="2.5" />
            <line x1="17" y1="17" x2="59" y2="59" stroke="#FFF" strokeWidth="2.5" />
            <line x1="17" y1="59" x2="59" y2="17" stroke="#FFF" strokeWidth="2.5" />
          </g>

          {/* Floating Cocktail Bubble Accents */}
          <circle cx="250" cy="265" r="5.5" fill="#FFE5A3" opacity="0.7" />
          <circle cx="295" cy="280" r="4" fill="#FFE5A3" opacity="0.8" />
          <circle cx="315" cy="250" r="4.5" fill="#FFE5A3" opacity="0.6" />
        </g>

        {/* ── Floating Outing Badges ── */}
        {/* Verified Spend Badge */}
        <g transform="translate(320, 110) rotate(10)">
          <rect width="138" height="44" rx="22" fill="#008751" filter="url(#badgeShadow)" />
          <circle cx="24" cy="22" r="10" fill="#A3F3C6" />
          <path d="M20 22L23 25L28 19" stroke="#0A7C3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="44" y="27" fill="white" fontSize="12" fontWeight="900" letterSpacing="0.5">
            ₦25k SPEND
          </text>
        </g>

        {/* Squad Vibe Pill */}
        <g transform="translate(80, 360) rotate(-6)">
          <rect width="130" height="42" rx="21" fill="#1A1F1D" filter="url(#badgeShadow)" />
          <text x="65" y="26" textAnchor="middle" fill="#FFC72C" fontSize="11" fontWeight="800">
            🥂 SQUAD OF 6
          </text>
        </g>

        {/* ── Gradients & Filters ── */}
        <defs>
          <linearGradient id="cocktailLiquid" x1="172" y1="225" x2="388" y2="315" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF4D00" />
            <stop offset="0.5" stopColor="#FF6B35" />
            <stop offset="1" stopColor="#E63900" />
          </linearGradient>

          <linearGradient id="stemGradient" x1="280" y1="350" x2="280" y2="490" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5F0E8" />
            <stop offset="1" stopColor="#E5DFD5" />
          </linearGradient>

          <filter id="badgeShadow" x="-10" y="-10" width="170" height="74" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.14" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

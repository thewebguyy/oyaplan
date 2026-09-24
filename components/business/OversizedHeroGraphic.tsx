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
      className="absolute top-1/2 -translate-y-1/2 -right-16 sm:-right-24 md:-right-32 lg:-right-20 xl:-right-10 w-[340px] sm:w-[480px] md:w-[580px] lg:w-[640px] h-[340px] sm:h-[480px] md:h-[580px] lg:h-[640px] pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#008751]/20 via-[#FF7A00]/15 to-amber-200/10 rounded-full blur-3xl opacity-70 transform scale-90" />

      {/* Main SVG Vector Composition */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)] transform rotate-[-8deg] hover:rotate-[-4deg] transition-transform duration-700 ease-out"
      >
        {/* ── Background Vinyl Record ── */}
        <g opacity="0.95">
          {/* Vinyl Outer Rim */}
          <circle cx="280" cy="240" r="190" fill="#1A1F1D" />
          <circle cx="280" cy="240" r="186" stroke="#2D3632" strokeWidth="2" />
          
          {/* Grooves */}
          <circle cx="280" cy="240" r="160" stroke="#252E2A" strokeWidth="1.5" strokeDasharray="6 3" />
          <circle cx="280" cy="240" r="135" stroke="#252E2A" strokeWidth="1.5" />
          <circle cx="280" cy="240" r="110" stroke="#252E2A" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="280" cy="240" r="85" stroke="#2F3B36" strokeWidth="1" />

          {/* Vinyl Sheen Highlight */}
          <path
            d="M170 130 C220 90 340 90 390 130 L280 240 Z"
            fill="white"
            fillOpacity="0.04"
          />
          <path
            d="M390 350 C340 390 220 390 170 350 L280 240 Z"
            fill="white"
            fillOpacity="0.04"
          />

          {/* Center Record Label */}
          <circle cx="280" cy="240" r="62" fill="#008751" />
          <circle cx="280" cy="240" r="54" fill="#0A7C3F" stroke="#A3F3C6" strokeWidth="1.5" />
          <circle cx="280" cy="240" r="14" fill="#1A1F1D" />
          <circle cx="280" cy="240" r="6" fill="#FAF7F2" />
          
          {/* Label Text Rhythm */}
          <text
            x="280"
            y="218"
            textAnchor="middle"
            fill="#FFF"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="2"
            opacity="0.9"
          >
            LAGOS NIGHTS
          </text>
          <text
            x="280"
            y="270"
            textAnchor="middle"
            fill="#A3F3C6"
            fontSize="7"
            fontWeight="900"
            letterSpacing="1"
          >
            OYAPLAN 33 RPM
          </text>
        </g>

        {/* ── Foreground Stylized Cocktail Coupe Glass ── */}
        <g transform="translate(40, 20)">
          {/* Stem & Base */}
          <path
            d="M260 480 C260 495 210 505 210 510 L350 510 C350 505 300 495 300 480 L300 370 L260 370 Z"
            fill="url(#stemGradient)"
          />
          <line x1="280" y1="370" x2="280" y2="495" stroke="#E5E0D8" strokeWidth="10" strokeLinecap="round" />

          {/* Coupe Bowl (Liquid Base) */}
          <path
            d="M170 230 C170 340 390 340 390 230 Z"
            fill="#FAF7F2"
            fillOpacity="0.3"
            stroke="#DCD5CA"
            strokeWidth="5"
          />

          {/* Cocktail Liquid (Sunset Aperol / Passionfruit) */}
          <path
            d="M182 245 C195 325 365 325 378 245 Z"
            fill="url(#cocktailLiquid)"
          />

          {/* Liquid Surface Highlight */}
          <ellipse cx="280" cy="245" rx="98" ry="12" fill="#FF8A3D" />
          <ellipse cx="280" cy="245" rx="88" ry="8" fill="#FFA559" />

          {/* Glass Rim Shimmer */}
          <path
            d="M170 230 C200 238 360 238 390 230"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Citrus Wheel Garnish */}
          <g transform="translate(160, 195) rotate(-25)">
            <circle cx="35" cy="35" r="35" fill="#FF7A00" />
            <circle cx="35" cy="35" r="31" fill="#FFC72C" />
            <circle cx="35" cy="35" r="28" fill="#FFA500" stroke="#FFF" strokeWidth="2" />
            {/* Citrus Segments */}
            <line x1="35" y1="7" x2="35" y2="63" stroke="#FFF" strokeWidth="2" />
            <line x1="7" y1="35" x2="63" y2="35" stroke="#FFF" strokeWidth="2" />
            <line x1="15" y1="15" x2="55" y2="55" stroke="#FFF" strokeWidth="2" />
            <line x1="15" y1="55" x2="55" y2="15" stroke="#FFF" strokeWidth="2" />
          </g>

          {/* Floating Cocktail Bubble Accents */}
          <circle cx="260" cy="275" r="5" fill="#FFE5A3" opacity="0.6" />
          <circle cx="295" cy="290" r="3.5" fill="#FFE5A3" opacity="0.7" />
          <circle cx="310" cy="265" r="4" fill="#FFE5A3" opacity="0.5" />
        </g>

        {/* ── Floating Neon Outing Badges ── */}
        {/* Verified Price Tag */}
        <g transform="translate(360, 140) rotate(12)">
          <rect width="130" height="42" rx="21" fill="#008751" filter="url(#badgeShadow)" />
          <circle cx="22" cy="21" r="9" fill="#A3F3C6" />
          <path d="M18 21L21 24L26 18" stroke="#0A7C3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="40" y="26" fill="white" fontSize="12" fontWeight="900" letterSpacing="0.5">
            ₦25k SPEND
          </text>
        </g>

        {/* Vibe Pill */}
        <g transform="translate(100, 360) rotate(-8)">
          <rect width="115" height="38" rx="19" fill="#1A1F1D" filter="url(#badgeShadow)" />
          <text x="58" y="24" textAnchor="middle" fill="#FFC72C" fontSize="11" fontWeight="800">
            🥂 SQUAD OF 6
          </text>
        </g>

        {/* ── Gradients & Filters ── */}
        <defs>
          <linearGradient id="cocktailLiquid" x1="180" y1="245" x2="380" y2="325" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF4D00" />
            <stop offset="0.5" stopColor="#FF6B35" />
            <stop offset="1" stopColor="#E63900" />
          </linearGradient>

          <linearGradient id="stemGradient" x1="280" y1="370" x2="280" y2="510" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5F0E8" />
            <stop offset="1" stopColor="#E5DFD5" />
          </linearGradient>

          <filter id="badgeShadow" x="-10" y="-10" width="160" height="70" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

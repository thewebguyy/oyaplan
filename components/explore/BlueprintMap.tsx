"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface BlueprintMapProps {
  half: "top" | "bottom";
}

const AREAS = [
  // Top Half Areas (Mainland/Northern)
  {
    name: "Ikeja",
    slug: "ikeja",
    points: "80,60 260,60 260,180 80,180",
    textX: 170,
    textY: 120,
    half: "top"
  },
  {
    name: "Surulere",
    slug: "surulere",
    points: "60,200 180,200 180,310 60,310",
    textX: 120,
    textY: 255,
    half: "top"
  },
  {
    name: "Yaba",
    slug: "yaba",
    points: "200,200 320,200 320,310 200,310",
    textX: 260,
    textY: 255,
    half: "top"
  },
  {
    name: "Lagos Island",
    slug: "lagos-island",
    points: "340,230 460,230 440,320 320,320",
    textX: 390,
    textY: 275,
    half: "top"
  },
  {
    name: "Ikoyi",
    slug: "ikoyi",
    points: "480,210 620,210 600,310 460,310",
    textX: 540,
    textY: 260,
    half: "top"
  },
  // Bottom Half Areas (Island/Southern)
  {
    name: "Victoria Island",
    slug: "vi",
    points: "360,330 580,330 560,440 340,440",
    textX: 460,
    textY: 385,
    half: "bottom"
  },
  {
    name: "Lekki",
    slug: "lekki-phase-1",
    points: "600,330 760,330 740,440 580,440",
    textX: 670,
    textY: 385,
    half: "bottom"
  }
];

export default function BlueprintMap({ half }: BlueprintMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clickedSlug, setClickedSlug] = useState<string | null>(null);

  const handleAreaClick = (slug: string) => {
    setClickedSlug(slug);
    
    // 100ms flash before navigating
    setTimeout(() => {
      setClickedSlug(null);
      
      const nextParams = new URLSearchParams(searchParams.toString());
      router.push(`/explore/${slug}?${nextParams.toString()}`);
    }, 100);
  };

  return (
    <div className="w-full max-w-[900px] aspect-[900/500] px-4 md:px-8 relative select-none">
      <svg 
        viewBox="0 0 900 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full border border-black/10 shadow-sm bg-[#F5F5F5]"
      >
        {/* Halftone Dot Pattern for Water */}
        <defs>
          <pattern id="halftone-pattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="2.5" fill="#000000" opacity="0.12" />
          </pattern>
        </defs>

        {/* Water background */}
        <rect width="900" height="500" fill="url(#halftone-pattern)" />

        {/* Draw all polygons. We render all of them so visual connectivity is preserved, but only enable pointers on the active half's nodes */}
        {AREAS.map((area) => {
          const isClicked = clickedSlug === area.slug;
          const isActiveHalf = area.half === half;

          return (
            <g 
              key={area.slug} 
              className={`map-group ${isActiveHalf ? "cursor-pointer" : "pointer-events-none"}`}
              onClick={isActiveHalf ? () => handleAreaClick(area.slug) : undefined}
            >
              <polygon
                points={area.points}
                className="transition-all duration-150"
                style={{
                  fill: isClicked ? "#F6C642" : "#FAFAFA",
                  stroke: "#000000",
                  strokeWidth: "2",
                  strokeLinejoin: "miter"
                }}
              />
              {/* Massive white typography */}
              <text
                x={area.textX}
                y={area.textY}
                className="map-text select-none text-2xl font-black tracking-tighter"
              >
                {area.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

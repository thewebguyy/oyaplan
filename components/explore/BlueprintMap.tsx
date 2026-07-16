"use client";

import { useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AREAS } from "@/lib/config/areas";

export default function BlueprintMap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activeSlug = pathname === "/explore" ? null : pathname.replace("/explore/", "");

  useEffect(() => {
    // Auto-center the map scroll position on mount so it doesn't start at the top-left edge
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    }
  }, []);

  const handleAreaClick = (slug: string, isActive: boolean, areaName: string) => {
    if (!isActive) {
      toast.info(`We don't have spots in ${areaName} yet!`, {
        description: "Know a hidden gem here? Suggest it to us!",
        action: {
          label: "Suggest",
          onClick: () => router.push("/suggest-a-spot"),
        },
      });
      return;
    }
    const nextParams = new URLSearchParams(searchParams.toString());
    router.push(`/explore/${slug}?${nextParams.toString()}`);
  };

  return (
    <div 
      ref={scrollRef}
      className="w-full h-[55vh] md:h-auto md:aspect-[1200/800] max-w-[1000px] relative select-none mx-auto my-0 md:my-8 md:rounded-[32px] overflow-auto md:border-2 md:border-border-default md:shadow-float bg-[#F8FAFC] scrollbar-hide touch-pan-x touch-pan-y"
    >
      <svg 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid meet"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-[200%] sm:w-[150%] md:w-full h-auto min-w-[800px] md:min-w-0 pointer-events-auto"
      >
        <defs>
          <style>
            {`
              @keyframes radar-pulse {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(2.5); opacity: 0; }
              }
              .animate-radar {
                transform-origin: center;
                animation: radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
              .route-line {
                stroke-dasharray: 8 8;
                animation: dash-scroll 20s linear infinite;
              }
              @keyframes dash-scroll {
                to { stroke-dashoffset: -1000; }
              }
              @keyframes pin-select {
                0%   { transform: scale(1); }
                40%  { transform: scale(1.14); }
                70%  { transform: scale(1.05); }
                100% { transform: scale(1.08); }
              }
              .map-pin-group.is-active > g {
                animation: pin-select 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}
          </style>
          <filter id="map-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* The Puzzle Board Landmass */}
        <g filter="url(#map-shadow)">
          {AREAS.map((area) => (
            <path
              key={`path-${area.slug}`}
              d={area.path}
              className={`transition-colors duration-300 ${area.isActive ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
              onClick={() => handleAreaClick(area.slug, area.isActive, area.name)}
              style={{
                fill: area.isActive ? area.neonColor : "#E2E8F0",
                stroke: "#FFFFFF",
                strokeWidth: "4",
                strokeLinejoin: "round",
              }}
            />
          ))}
        </g>

        {/* Commute Route (Dotted Line connecting Ikeja -> Yaba -> VI -> Lekki) */}
        <path 
          id="commute-route"
          d="M 460 220 Q 520 280 500 340 T 590 550 Q 690 500 790 500" 
          fill="none" 
          stroke="#94A3B8" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="route-line"
          style={{ opacity: 0.5 }}
        />

        {/* Animated Moving Danfo on the Route */}
        <g>
          <rect x="-15" y="-8" width="30" height="16" rx="4" fill="#FFC107" stroke="#212121" strokeWidth="1.5" />
          <rect x="-10" y="-5" width="6" height="10" fill="#E0F7FA" />
          <rect x="0" y="-5" width="6" height="10" fill="#E0F7FA" />
          <animateMotion 
            dur="15s" 
            repeatCount="indefinite" 
            rotate="auto"
          >
            <mpath href="#commute-route" />
          </animateMotion>
        </g>

        {/* Render Map Pins & Labels */}
        {AREAS.map((area) => {
          if (!area.isActive) {
            // Render muted label for context zones
            return (
              <text 
                key={`label-${area.slug}`}
                x={area.textX} 
                y={area.textY} 
                textAnchor="middle" 
                className="text-sm font-bold uppercase tracking-widest fill-slate-400 pointer-events-none"
              >
                {area.name}
              </text>
            );
          }

          const isActive = activeSlug === area.slug;
          const hasActive = activeSlug !== null;
          const isInactive = hasActive && !isActive;
          
          const pinColor = isInactive ? "#E5E5E5" : area.neonColor;

          return (
            <g 
              key={area.slug} 
              className={`cursor-pointer map-pin-group${isActive ? ' is-active' : ''}`}
              onClick={() => handleAreaClick(area.slug, area.isActive, area.name)}
              data-testid={`pin-${area.slug}`}
            >
              {/* Radar Pulse (Only on active/neutral pins) */}
              {!isInactive && (
                <circle 
                  cx={area.textX} 
                  cy={area.textY - 24} 
                  r="16" 
                  fill={pinColor} 
                  className="animate-radar pointer-events-none"
                />
              )}

              {/* Teardrop Pin */}
              <g 
                transform={`translate(${area.textX}, ${area.textY}) scale(${isActive ? 1.08 : 1})`}
                style={{ transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)", transformOrigin: "center" }}
              >
                <path 
                  d="M0 0 C-6 -8 -12 -16 -12 -24 C-12 -31 -6 -36 0 -36 C6 -36 12 -31 12 -24 C12 -16 6 -8 0 0 Z" 
                  fill={pinColor}
                  stroke="#000000"
                  strokeWidth="3"
                  style={{ opacity: isInactive ? 0.6 : 1, transition: "all 0.2s ease" }}
                />
                <circle 
                  cx="0" 
                  cy="-24" 
                  r="4" 
                  fill="#000000" 
                  style={{ opacity: isInactive ? 0.6 : 1, transition: "all 0.2s ease" }} 
                />
              </g>
              
              {/* Neo-brutalist Sticker Label */}
              <foreignObject
                x={area.textX - 100}
                y={area.textY - 76}
                width="200"
                height="50"
                className="overflow-visible"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <div 
                    className={`inline-flex items-center justify-center bg-white border-[3px] border-black shadow-[4px_4px_0_rgba(0,0,0,1)] px-3 py-1.5 hover:scale-105 active:scale-95`}
                    style={{
                      transform: `rotate(${area.name.length % 2 === 0 ? -4 : 3}deg) ${isActive ? "scale(1.08)" : "scale(1)"}`,
                      transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)",
                      opacity: isInactive ? 0.6 : 1,
                    }}
                  >
                    <span 
                      className="text-xs sm:text-sm font-black tracking-tighter uppercase whitespace-nowrap pt-[2px]" 
                      style={{ color: pinColor === "#E5E5E5" ? "#000" : pinColor }}
                    >
                      {area.name}
                    </span>
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

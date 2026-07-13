"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AREAS } from "@/lib/config/areas";

export default function BlueprintMap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const activeSlug = pathname === "/explore" ? null : pathname.replace("/explore/", "");

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
    <div className="w-full max-w-[1000px] aspect-[1200/800] relative select-none mx-auto my-8 rounded-[32px] overflow-hidden border-2 border-border-default shadow-float bg-[#F8FAFC]">
      <svg 
        viewBox="0 0 1200 800" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
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
              className="cursor-pointer map-pin-group"
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
                transform={`translate(${area.textX}, ${area.textY}) scale(${isActive ? 1.1 : 1})`}
                style={{ transition: "transform 0.2s ease" }}
              >
                <path 
                  d="M0 0 C-6 -8 -12 -16 -12 -24 C-12 -31 -6 -36 0 -36 C6 -36 12 -31 12 -24 C12 -16 6 -8 0 0 Z" 
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ opacity: isInactive ? 0.6 : 1, transition: "all 0.2s ease" }}
                />
                <circle 
                  cx="0" 
                  cy="-24" 
                  r="4" 
                  fill="#FFFFFF" 
                  style={{ opacity: isInactive ? 0.6 : 1, transition: "all 0.2s ease" }} 
                />
              </g>
              
              {/* Pill Label */}
              <foreignObject
                x={area.textX - 100}
                y={area.textY - 76}
                width="200"
                height="40"
                className="overflow-visible"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <div 
                    className="inline-flex items-center gap-2 bg-white border-2 border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-full px-3 py-1"
                    style={{
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      opacity: isInactive ? 0.6 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pinColor, transition: "background-color 0.2s ease" }} />
                    <span className="text-xs sm:text-sm font-black tracking-tighter text-black uppercase whitespace-nowrap pt-[2px]">
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

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
  
  const zoneParam = searchParams.get("zone");
  const activeSlug = pathname === "/explore" 
    ? (zoneParam || null) 
    : pathname.replace("/explore/", "");

  const activeArea = AREAS.find((a) => a.slug === activeSlug && a.isActive);

  // Viewport Camera calculations (Lagos is the product)
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (activeArea) {
    scale = 2.4;
    translateX = 600 - activeArea.textX * scale;
    translateY = 400 - activeArea.textY * scale;
  }

  useEffect(() => {
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
      className="w-full h-[55vh] md:h-auto md:aspect-[1200/800] max-w-[1000px] relative select-none mx-auto my-0 md:my-8 md:rounded-[32px] overflow-hidden md:border-2 md:border-border-default/80 md:shadow-float bg-[#E3EAEF] scrollbar-hide touch-pan-x touch-pan-y"
    >
      <svg 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid meet"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-auto pointer-events-auto"
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
                animation: dash-scroll 24s linear infinite;
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
          <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Outer Camera Viewport */}
        <g 
          id="map-camera-viewport"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: "600px 400px",
            transition: "transform 850ms cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          className="transition-transform duration-700"
        >
          {/* Water Backing */}
          <rect width="1200" height="800" fill="#E3EAEF" />

          {/* Water Grid details */}
          <path d="M 0,100 L 1200,100 M 0,300 L 1200,300 M 0,500 L 1200,500 M 0,700 L 1200,700" stroke="#D3DAE0" strokeWidth="0.5" strokeDasharray="5 20" opacity="0.3" />
          <path d="M 200,0 L 200,800 M 500,0 L 500,800 M 800,0 L 800,800 M 1100,0 L 1100,800" stroke="#D3DAE0" strokeWidth="0.5" strokeDasharray="5 20" opacity="0.3" />

          {/* Cartography Water Labels */}
          <text x="760" y="310" className="font-serif italic text-[11px] tracking-[0.25em] fill-[#94A3B8] opacity-50 select-none">
            LAGOS LAGOON
          </text>
          <text x="680" y="730" className="font-serif italic text-xs tracking-[0.3em] fill-[#94A3B8] opacity-50 select-none">
            ATLANTIC OCEAN
          </text>
          <text x="250" y="160" className="font-sans font-bold text-[9px] tracking-[0.2em] fill-[#B8C4CC] opacity-60 select-none">
            MAINLAND DISTRICT
          </text>
          <text x="820" y="600" className="font-sans font-bold text-[9px] tracking-[0.2em] fill-[#B8C4CC] opacity-60 select-none">
            ISLANDS DISTRICT
          </text>

          {/* Lagos Bridges */}
          {/* Third Mainland Bridge */}
          <path d="M 505,370 C 515,405 525,415 542,438" stroke="#B8C4CC" strokeWidth="6" strokeLinecap="round" />
          <path d="M 505,370 C 515,405 525,415 542,438" stroke="#FCFAF7" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          
          {/* Eko Bridge */}
          <path d="M 435,420 Q 480,455 520,442" stroke="#B8C4CC" strokeWidth="5" strokeLinecap="round" />
          <path d="M 435,420 Q 480,455 520,442" stroke="#FCFAF7" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />

          {/* Lekki-Ikoyi Link Bridge */}
          <path d="M 685,465 Q 730,468 765,482" stroke="#B8C4CC" strokeWidth="4" strokeLinecap="round" />
          <path d="M 685,465 Q 730,468 765,482" stroke="#FCFAF7" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M 725,435 L 721,473 L 729,473 Z" fill="#64748B" />
          <line x1="725" y1="435" x2="700" y2="466" stroke="#94A3B8" strokeWidth="0.6" />
          <line x1="725" y1="435" x2="710" y2="467" stroke="#94A3B8" strokeWidth="0.6" />
          <line x1="725" y1="435" x2="740" y2="471" stroke="#94A3B8" strokeWidth="0.6" />
          <line x1="725" y1="435" x2="750" y2="475" stroke="#94A3B8" strokeWidth="0.6" />

          {/* Geographic Identity Layers */}
          {/* Yaba clusters (density dots) */}
          <g opacity={activeSlug === "yaba" ? 0.7 : 0.2} className="transition-opacity duration-300">
            <circle cx="485" cy="330" r="2" fill="#E91E63" />
            <circle cx="490" cy="350" r="2.5" fill="#E91E63" />
            <circle cx="515" cy="335" r="2" fill="#E91E63" />
            <circle cx="520" cy="355" r="3" fill="#E91E63" />
          </g>
          {/* Lekki waves */}
          <g opacity={activeSlug === "lekki-phase-1" ? 0.6 : 0.2} className="transition-opacity duration-300">
            <path d="M 740,560 Q 745,558 750,560 T 760,560" stroke="#00BCD4" strokeWidth="1" />
            <path d="M 780,570 Q 785,568 790,570 T 800,570" stroke="#00BCD4" strokeWidth="1" />
          </g>
          {/* Ikoyi large open spaces (spaciousness indicator circle rings) */}
          <g opacity={activeSlug === "ikoyi" ? 0.3 : 0.05} className="transition-opacity duration-300">
            <circle cx="650" cy="420" r="50" stroke="#AB47BC" strokeWidth="1" strokeDasharray="6 6" />
          </g>

          {/* Landmass shapes */}
          <g filter="url(#map-shadow)">
            {AREAS.map((area) => {
              const isSelected = activeSlug === area.slug;
              return (
                <path
                  key={`path-${area.slug}`}
                  d={area.path}
                  className={`transition-all duration-300 ${area.isActive ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                  onClick={() => handleAreaClick(area.slug, area.isActive, area.name)}
                  style={{
                    fill: area.isActive 
                      ? (isSelected ? area.neonColor : "#FCFAF7") 
                      : "#EFECE6",
                    stroke: isSelected ? area.neonColor : "#D3CBBF",
                    strokeWidth: isSelected ? "3.5" : "2",
                    strokeLinejoin: "round",
                  }}
                />
              );
            })}
          </g>

          {/* Commuter Route line */}
          <path 
            id="commute-route"
            d="M 460 220 Q 520 280 500 340 T 590 550 Q 690 500 790 500" 
            fill="none" 
            stroke="#94A3B8" 
            strokeWidth="2" 
            strokeLinecap="round"
            className="route-line"
            style={{ opacity: 0.35 }}
          />

          {/* Animating Danfo on the Route */}
          <g className={`transition-opacity duration-500 ${activeArea ? 'opacity-15' : 'opacity-85'}`}>
            <rect x="-10" y="-5" width="20" height="10" rx="2.5" fill="#FFC107" stroke="#212121" strokeWidth="1" />
            <rect x="-6" y="-3" width="4" height="6" fill="#E0F7FA" />
            <rect x="1" y="-3" width="4" height="6" fill="#E0F7FA" />
            <animateMotion 
              dur="18s" 
              repeatCount="indefinite" 
              rotate="auto"
            >
              <mpath href="#commute-route" />
            </animateMotion>
          </g>

          {/* Animating Sailboat on the Lagoon */}
          <g className={`transition-opacity duration-500 ${activeArea ? 'opacity-10' : 'opacity-70'}`}>
            <path d="M 710,380 C 760,370 820,390 850,380" id="boat-route" fill="none" />
            <g>
              <polygon points="-6,3 6,3 4,-1 -3,-1" fill="#475569" />
              <polygon points="-1,-1 1,-5 3,-1" fill="#F8FAFC" />
              <animateMotion dur="26s" repeatCount="indefinite" rotate="auto">
                <mpath href="#boat-route" />
              </animateMotion>
            </g>
          </g>

          {/* Render Map Pins & Labels */}
          {AREAS.map((area) => {
            if (!area.isActive) {
              return (
                <text 
                  key={`label-${area.slug}`}
                  x={area.textX} 
                  y={area.textY} 
                  textAnchor="middle" 
                  className="text-[9px] font-sans font-bold uppercase tracking-widest fill-slate-400 pointer-events-none"
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
                {/* Radar Pulse */}
                {!isInactive && (
                  <circle 
                    cx={area.textX} 
                    cy={area.textY - 24} 
                    r="12" 
                    fill={pinColor} 
                    className="animate-radar pointer-events-none"
                  />
                )}

                {/* Teardrop Pin */}
                <g 
                  transform={`translate(${area.textX}, ${area.textY}) scale(${isActive ? 1.05 : 1})`}
                  style={{ transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)", transformOrigin: "center" }}
                >
                  <path 
                    d="M0 0 C-4 -6 -8 -12 -8 -18 C-8 -23 -4 -27 0 -27 C4 -27 8 -23 8 -18 C8 -12 4 -6 0 0 Z" 
                    fill={pinColor}
                    stroke="#000000"
                    strokeWidth="2"
                    style={{ opacity: isInactive ? 0.5 : 1, transition: "all 0.2s ease" }}
                  />
                  <circle 
                    cx="0" 
                    cy="-18" 
                    r="2.5" 
                    fill="#000000" 
                    style={{ opacity: isInactive ? 0.5 : 1, transition: "all 0.2s ease" }} 
                  />
                </g>
                
                {/* Sticker Label */}
                <foreignObject
                  x={area.textX - 70}
                  y={area.textY - 60}
                  width="140"
                  height="40"
                  className="overflow-visible"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <div 
                      className="inline-flex items-center justify-center bg-white border-[2px] border-black shadow-[2px_2px_0_rgba(0,0,0,1)] px-2 py-1 hover:scale-105 active:scale-95"
                      style={{
                        transform: `rotate(${area.name.length % 2 === 0 ? -3 : 2}deg) ${isActive ? "scale(1.05)" : "scale(1)"}`,
                        transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)",
                        opacity: isInactive ? 0.5 : 1,
                      }}
                    >
                      <span 
                        className="text-[10px] font-black tracking-tight uppercase whitespace-nowrap pt-[1px]" 
                        style={{ color: pinColor === "#E5E5E5" ? "#777" : pinColor }}
                      >
                        {area.name}
                      </span>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Progressive Information Density Overlay Card */}
      {activeArea && (
        <div 
          className="absolute bottom-4 left-4 z-30 bg-[#FCFAF7]/95 backdrop-blur-md border-[2px] border-black shadow-[3px_3px_0_rgba(0,0,0,1)] p-4 w-60 animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col gap-2.5 font-mono text-[10px] text-text-secondary"
        >
          <div className="border-b border-black pb-1.5 flex justify-between items-center">
            <span className="font-sans font-black text-xs uppercase tracking-tight text-midnight-lagoon">{activeArea.name}</span>
            <span className="bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider">Verified</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Verified Spots:</span>
              <span className="font-bold text-text-primary">
                {activeArea.slug === 'yaba' ? '12 spots' : activeArea.slug === 'lekki-phase-1' ? '34 spots' : activeArea.slug === 'ikoyi' ? '18 spots' : '22 spots'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Outing Cost:</span>
              <span className="font-bold text-text-primary">
                {activeArea.slug === 'yaba' ? '₦12k – ₦25k' : activeArea.slug === 'lekki-phase-1' ? '₦35k – ₦75k' : activeArea.slug === 'ikoyi' ? '₦40k – ₦90k' : '₦25k – ₦50k'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Popular Vibes:</span>
              <span className="font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]" title={activeArea.slug === 'yaba' ? 'Tech Hangouts, Cheap Eats' : activeArea.slug === 'lekki-phase-1' ? 'Date Nights, Brunch' : 'Quiet Luxury, Lounges'}>
                {activeArea.slug === 'yaba' ? 'Tech Meets, Cheap Eats' : activeArea.slug === 'lekki-phase-1' ? 'Date Nights, Brunch' : activeArea.slug === 'ikoyi' ? 'Quiet Luxury, Lounges' : 'Dining, Socials'}
              </span>
            </div>
          </div>
          <div className="border-t border-dashed border-border-default/80 pt-1.5 text-[9px] text-text-muted italic font-serif">
            {activeArea.slug === 'yaba' && "Dense tech district. Warm, quick-paced campus energy."}
            {activeArea.slug === 'lekki-phase-1' && "Coastal breeze. Trendy brunch, beach clubs, cafe culture."}
            {activeArea.slug === 'ikoyi' && "Spacious estates. Premium, calm, quiet luxury rhythm."}
            {!['yaba', 'lekki-phase-1', 'ikoyi'].includes(activeArea.slug) && "Lagos local outing district."}
          </div>
        </div>
      )}
    </div>
  );
}

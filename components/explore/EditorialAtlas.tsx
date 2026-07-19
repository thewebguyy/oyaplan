"use client";

import { useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AREAS } from "@/lib/config/areas";

export default function EditorialAtlas() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const zoneParam = searchParams.get("zone");
  const activeSlug = pathname === "/explore" 
    ? (zoneParam || null) 
    : pathname.replace("/explore/", "");

  const activeArea = AREAS.find((a) => a.slug === activeSlug && a.isActive);

  // Viewport Camera calculations
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (activeArea) {
    scale = 1.8;
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
      className="w-full h-full min-h-[50vh] relative select-none bg-[#F9F8F6] overflow-hidden flex items-center justify-center touch-pan-x touch-pan-y"
    >
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <svg 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid meet"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full max-w-[1400px] pointer-events-auto origin-center transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
        }}
      >
        <defs>
          <filter id="paper-edge" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.04" floodColor="#000000" />
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.02" floodColor="#000000" />
          </filter>
        </defs>

        {/* Global Context Labels (Fixed behind the scaling/moving layer) */}
        <text x="100" y="100" className="font-serif italic text-sm tracking-[0.3em] fill-text-muted opacity-30 select-none">
          THE LAGOS INDEX
        </text>

        {/* Map Elements */}
        <g>
          {/* Subtle connecting lines (Bridges abstract) */}
          <path d="M 505,370 C 515,405 525,415 542,438" stroke="#000000" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />
          <path d="M 435,420 Q 480,455 520,442" stroke="#000000" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />
          <path d="M 685,465 Q 730,468 765,482" stroke="#000000" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2" />

          {/* Landmass Shapes */}
          <g filter="url(#paper-edge)">
            {AREAS.map((area) => {
              const isActiveRoute = activeSlug === area.slug;
              const hasSelection = activeSlug !== null;
              const isFaded = hasSelection && !isActiveRoute;

              return (
                <path
                  key={`path-${area.slug}`}
                  d={area.path}
                  onClick={() => handleAreaClick(area.slug, area.isActive, area.name)}
                  className={`transition-all duration-700 ease-out ${area.isActive ? 'cursor-pointer hover:fill-[#F0EBE1]' : 'cursor-default'}`}
                  style={{
                    fill: area.isActive 
                      ? (isActiveRoute ? "#EAE5D9" : "#FFFFFF") 
                      : "#FAFAFA",
                    stroke: isActiveRoute ? "#000000" : "#E5E0D8",
                    strokeWidth: isActiveRoute ? "1.5" : "1",
                    opacity: isFaded ? 0.6 : 1,
                  }}
                />
              );
            })}
          </g>

          {/* Labels and abstract markers */}
          {AREAS.map((area) => {
            const isActiveRoute = activeSlug === area.slug;
            const hasSelection = activeSlug !== null;
            const isFaded = hasSelection && !isActiveRoute;

            if (!area.isActive) {
              return (
                <text 
                  key={`label-${area.slug}`}
                  x={area.textX} 
                  y={area.textY} 
                  textAnchor="middle" 
                  className="text-[9px] font-sans font-medium uppercase tracking-[0.2em] fill-text-muted opacity-40 pointer-events-none"
                >
                  {area.name}
                </text>
              );
            }

            return (
              <g 
                key={`marker-${area.slug}`}
                className={`cursor-pointer transition-opacity duration-700 ${isFaded ? 'opacity-40' : 'opacity-100'}`}
                onClick={() => handleAreaClick(area.slug, area.isActive, area.name)}
              >
                {/* Minimalist dot indicator instead of teardrop pin */}
                <circle 
                  cx={area.textX} 
                  cy={area.textY - 20} 
                  r={isActiveRoute ? "3" : "2"} 
                  fill={isActiveRoute ? "#000000" : "#888888"} 
                  className="transition-all duration-500"
                />
                
                {/* Editorial Label */}
                <text 
                  x={area.textX} 
                  y={area.textY} 
                  textAnchor="middle" 
                  className={`transition-all duration-500 pointer-events-none ${
                    isActiveRoute 
                      ? "text-[14px] font-serif italic fill-black" 
                      : "text-[10px] font-sans font-bold uppercase tracking-widest fill-text-secondary"
                  }`}
                >
                  {area.name}
                </text>

                {/* Subtitle / Volume number (abstract editorial detail) */}
                {isActiveRoute && (
                  <text
                    x={area.textX}
                    y={area.textY + 16}
                    textAnchor="middle"
                    className="text-[7px] font-mono uppercase tracking-[0.3em] fill-text-muted pointer-events-none animate-in fade-in zoom-in duration-700"
                  >
                    Vol. 0{Math.abs(area.name.length % 9) + 1}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

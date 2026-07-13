"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { AREAS } from "@/lib/config/areas";

export default function BlueprintMap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const activeSlug = pathname === "/explore" ? null : pathname.replace("/explore/", "");

  const handleAreaClick = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    router.push(`/explore/${slug}?${nextParams.toString()}`);
  };

  return (
    <div className="w-full max-w-[900px] aspect-[900/500] relative select-none mx-auto my-8 rounded-[24px] overflow-hidden border-2 border-black shadow-float bg-[var(--color-pastel-cream)]">
      <svg 
        viewBox="0 0 900 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        {/* Render grid lines / block outlines */}
        {AREAS.map((area) => (
          <polygon
            key={`poly-${area.slug}`}
            points={area.points}
            style={{
              fill: "#FFFFFF",
              stroke: "#000000",
              strokeWidth: "2",
              strokeLinejoin: "round",
              opacity: 1
            }}
          />
        ))}

        {/* Render Map Pins */}
        {AREAS.map((area) => {
          const isActive = activeSlug === area.slug;
          const hasActive = activeSlug !== null;
          const isInactive = hasActive && !isActive;
          
          const pinColor = isInactive ? "#E5E5E5" : area.neonColor;

          return (
            <g 
              key={area.slug} 
              className="cursor-pointer map-pin-group"
              onClick={() => handleAreaClick(area.slug)}
              data-testid={`pin-${area.slug}`}
            >
              {/* Teardrop Pin */}
              <g 
                transform={`translate(${area.textX}, ${area.textY}) scale(${isActive ? 1.1 : 1})`}
                style={{ transition: "transform 0.2s ease" }}
              >
                <path 
                  d="M0 0 C-6 -8 -12 -16 -12 -24 C-12 -31 -6 -36 0 -36 C6 -36 12 -31 12 -24 C12 -16 6 -8 0 0 Z" 
                  fill={pinColor}
                  stroke="#000000"
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
                    className="inline-flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1 shadow-sm"
                    style={{
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      opacity: isInactive ? 0.6 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full border border-black flex-shrink-0" style={{ backgroundColor: pinColor, transition: "background-color 0.2s ease" }} />
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

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
    <div className="w-full max-w-[900px] aspect-[900/500] px-4 md:px-8 relative select-none">
      <svg 
        viewBox="0 0 900 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full bg-[#FAFAFA]"
      >
        {/* Render grid lines / block outlines */}
        {AREAS.map((area) => (
          <polygon
            key={`poly-${area.slug}`}
            points={area.points}
            style={{
              fill: "none",
              stroke: "#000000",
              strokeWidth: "1",
              strokeLinejoin: "miter",
              opacity: 0.1
            }}
          />
        ))}

        {/* Render Map Pins */}
        {AREAS.map((area) => {
          const isActive = activeSlug === area.slug;
          const hasActive = activeSlug !== null;
          const isInactive = hasActive && !isActive;
          
          const pinColor = isInactive ? "#E5E5E5" : area.neonColor;
          const pinScale = isActive ? "scale(1.5)" : "scale(1)";
          const strokeWidth = isActive ? "4" : "0";

          return (
            <g 
              key={area.slug} 
              className="cursor-pointer map-pin-group"
              onClick={() => handleAreaClick(area.slug)}
              data-testid={`pin-${area.slug}`}
            >
              {/* Neon Pin */}
              <circle
                cx={area.textX}
                cy={area.textY}
                r="12"
                className={isActive ? "animate-map-lurch" : ""}
                style={{
                  fill: pinColor,
                  stroke: "#000000",
                  strokeWidth: strokeWidth,
                  transformOrigin: `${area.textX}px ${area.textY}px`,
                  transition: isActive ? "none" : "all 0.2s ease"
                }}
              />
              
              {/* Massive label */}
              <text
                x={area.textX}
                y={area.textY + 28}
                className="select-none text-base sm:text-xl font-black tracking-tighter"
                style={{
                  fill: isInactive ? "#A0A0A0" : "#0A0A0A",
                  textAnchor: "middle",
                  dominantBaseline: "middle",
                  textTransform: "uppercase",
                  transition: "fill 0.2s ease"
                }}
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

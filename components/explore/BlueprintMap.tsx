"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const AREAS = [
  {
    name: "Ikeja",
    slug: "ikeja",
    points: "80,60 260,60 260,180 80,180",
    textX: 170,
    textY: 120,
    neonColor: "#6B0F1A" // Deep Oxblood/Maroon
  },
  {
    name: "Surulere",
    slug: "surulere",
    points: "60,200 180,200 180,310 60,310",
    textX: 120,
    textY: 255,
    neonColor: "#5A00FF" // Ultra Violet
  },
  {
    name: "Yaba",
    slug: "yaba",
    points: "200,200 320,200 320,310 200,310",
    textX: 260,
    textY: 255,
    neonColor: "#FF1493" // Vivid Pink
  },
  {
    name: "Lagos Island",
    slug: "lagos-island",
    points: "340,230 460,230 440,320 320,320",
    textX: 390,
    textY: 275,
    neonColor: "#E0115F" // Bright Fuchsia
  },
  {
    name: "Ikoyi",
    slug: "ikoyi",
    points: "480,210 620,210 600,310 460,310",
    textX: 540,
    textY: 260,
    neonColor: "#FF00FF" // Hot Magenta
  },
  {
    name: "Victoria Island",
    slug: "vi",
    points: "360,330 580,330 560,440 340,440",
    textX: 460,
    textY: 385,
    neonColor: "#0047FF" // Electric Cobalt
  },
  {
    name: "Lekki",
    slug: "lekki-phase-1",
    points: "600,330 760,330 740,440 580,440",
    textX: 670,
    textY: 385,
    neonColor: "#00FFFF" // Neon Cyan
  }
];

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
                style={{
                  fill: pinColor,
                  stroke: "#000000",
                  strokeWidth: strokeWidth,
                  transformOrigin: `${area.textX}px ${area.textY}px`,
                  transform: pinScale,
                  transition: "all 0.2s ease"
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AREAS } from "@/lib/config/areas";

type TimeOfDay = "morning" | "afternoon" | "golden-hour" | "night";

export default function LivingLagosScene() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  
  const zoneParam = searchParams.get("zone");
  const activeSlug = pathname === "/explore" 
    ? (zoneParam || null) 
    : pathname.replace("/explore/", "");

  useEffect(() => {
    // Living City System: Set temporal state based on local time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setTimeOfDay("morning");
    else if (hour >= 11 && hour < 16) setTimeOfDay("afternoon");
    else if (hour >= 16 && hour < 19) setTimeOfDay("golden-hour");
    else setTimeOfDay("night");
  }, []);

  const handleAreaClick = (slug: string, isActive: boolean) => {
    if (!isActive) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    router.push(`/explore/${slug}?${nextParams.toString()}`);
  };

  // Cinematic Camera
  // The SVG canvas is 2400x1600. Center is 1200x800.
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  // Define hardcoded camera targets for the major districts to create the "zooming in" effect
  const cameraTargets: Record<string, { x: number, y: number, scale: number }> = {
    "yaba": { x: 1000, y: 600, scale: 2.2 },
    "surulere": { x: 800, y: 700, scale: 2.2 },
    "ikeja": { x: 900, y: 300, scale: 2.0 },
    "vi": { x: 1200, y: 1100, scale: 2.4 },
    "lagos-island": { x: 1100, y: 900, scale: 2.4 },
    "ikoyi": { x: 1400, y: 800, scale: 2.2 },
    "lekki-phase-1": { x: 1700, y: 1000, scale: 2.0 },
  };

  if (activeSlug && cameraTargets[activeSlug]) {
    const target = cameraTargets[activeSlug];
    scale = target.scale;
    // We want the target to be slightly offset to the left on desktop so the right panel doesn't cover it
    translateX = 1200 - target.x * scale;
    translateY = 800 - target.y * scale;
  }

  // Theme palettes based on time
  const palettes = {
    "morning": { bg: "#E3F2FD", water: "#B3E5FC", bridge: "#ECEFF1", text: "#37474F", highlight: "#FFF9C4" },
    "afternoon": { bg: "#E8F5E9", water: "#C8E6C9", bridge: "#CFD8DC", text: "#263238", highlight: "#FFECB3" },
    "golden-hour": { bg: "#FFF3E0", water: "#FFE0B2", bridge: "#D7CCC8", text: "#3E2723", highlight: "#FFCC80" },
    "night": { bg: "#1A237E", water: "#0D47A1", bridge: "#283593", text: "#E8EAF6", highlight: "#FBC02D" }
  };
  const theme = palettes[timeOfDay];

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: theme.bg }}
    >
      <svg 
        viewBox="0 0 2400 1600" 
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full origin-center pointer-events-auto transition-transform ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
          transitionDuration: "1200ms"
        }}
      >
        <defs>
          {/* Soft ambient light source */}
          <radialGradient id="sunlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.highlight} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.highlight} stopOpacity="0" />
          </radialGradient>
          
          <style>
            {`
              @keyframes shimmer {
                0% { opacity: 0.6; }
                50% { opacity: 0.8; }
                100% { opacity: 0.6; }
              }
              .water-shimmer { animation: shimmer 8s ease-in-out infinite; }
              
              @keyframes drive {
                0% { transform: translateX(-200px) translateY(100px); }
                100% { transform: translateX(2600px) translateY(-200px); }
              }
              .danfo-loop { animation: drive 25s linear infinite; }
            `}
          </style>
        </defs>

        {/* Ambient Lighting Layer */}
        <rect x="0" y="0" width="2400" height="1600" fill="url(#sunlight)" />

        {/* --- SCENE GEOMETRY --- */}
        {/* We use highly stylized, modern vector geometry. Not literal coordinates, but emotional placement. */}

        {/* The Lagoon (Water) */}
        <path 
          d="M 0 1000 Q 600 800 1200 900 T 2400 700 L 2400 1600 L 0 1600 Z" 
          fill={theme.water} 
          className="water-shimmer transition-colors duration-1000" 
        />

        {/* Third Mainland Bridge (Iconic Vector Arc) */}
        <path 
          d="M 400 600 Q 1000 800 1400 1000" 
          fill="none" 
          stroke={theme.bridge} 
          strokeWidth="12" 
          strokeLinecap="round" 
          className="transition-colors duration-1000"
        />
        <path 
          d="M 400 600 Q 1000 800 1400 1000" 
          fill="none" 
          stroke={timeOfDay === 'night' ? '#FFF' : '#FFF'} 
          strokeWidth="2" 
          strokeDasharray="20 40" 
          opacity={timeOfDay === 'night' ? 0.8 : 0.4}
        />

        {/* Motion: Danfo on Third Mainland */}
        <g className="danfo-loop">
          <rect x="0" y="-10" width="40" height="20" rx="4" fill="#FFC107" />
          <rect x="0" y="-2" width="40" height="4" fill="#212121" />
        </g>

        {/* --- DISTRICT CHAPTERS --- */}
        {/* Each group represents a curated emotional scene. */}

        {/* YABA: The Builders (Campus, Cafes, Tech) */}
        <g 
          transform="translate(1000, 600)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "yaba" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("yaba", true)}
        >
          {/* Stylized architecture */}
          <rect x="-40" y="-60" width="80" height="60" fill={timeOfDay === 'night' ? '#3949AB' : '#E57373'} rx="4" />
          <rect x="-20" y="-30" width="40" height="30" fill={timeOfDay === 'night' ? '#FFF59D' : '#FFCDD2'} />
          <circle cx="0" cy="-80" r="20" fill={theme.highlight} opacity="0.6" />
          <text x="0" y="30" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Yaba</text>
          <text x="0" y="50" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">The Builders</text>
        </g>

        {/* VICTORIA ISLAND: The Skyline (Business, Rooftops) */}
        <g 
          transform="translate(1200, 1100)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "vi" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("vi", true)}
        >
          {/* Civic Centre / Skyline Abstract */}
          <rect x="-30" y="-120" width="60" height="120" fill={timeOfDay === 'night' ? '#1E88E5' : '#0288D1'} />
          <rect x="40" y="-90" width="40" height="90" fill={timeOfDay === 'night' ? '#1565C0' : '#4FC3F7'} />
          <rect x="-80" y="-70" width="40" height="70" fill={timeOfDay === 'night' ? '#1565C0' : '#4FC3F7'} />
          <text x="0" y="40" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Victoria Island</text>
          <text x="0" y="60" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">The Skyline</text>
        </g>

        {/* IKOYI: Quiet Luxury (Dense Canopy, Tall White Towers) */}
        <g 
          transform="translate(1400, 800)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "ikoyi" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("ikoyi", true)}
        >
          {/* Dense trees */}
          <circle cx="-30" cy="-40" r="40" fill={timeOfDay === 'night' ? '#1B5E20' : '#2E7D32'} />
          <circle cx="30" cy="-30" r="35" fill={timeOfDay === 'night' ? '#1B5E20' : '#388E3C'} />
          <rect x="-10" y="-100" width="20" height="100" fill={timeOfDay === 'night' ? '#CFD8DC' : '#FFFFFF'} />
          <text x="0" y="30" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Ikoyi</text>
          <text x="0" y="50" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">Quiet Confidence</text>
        </g>

        {/* LEKKI: Coastal Weekend (Palm Trees, Water) */}
        <g 
          transform="translate(1700, 1000)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "lekki-phase-1" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("lekki-phase-1", true)}
        >
          <path d="M -20 0 Q -10 -40 -30 -80" fill="none" stroke="#795548" strokeWidth="4" />
          <path d="M 20 0 Q 10 -30 30 -60" fill="none" stroke="#795548" strokeWidth="4" />
          <circle cx="-30" cy="-80" r="20" fill={timeOfDay === 'night' ? '#004D40' : '#00897B'} />
          <circle cx="30" cy="-60" r="15" fill={timeOfDay === 'night' ? '#004D40' : '#00897B'} />
          <rect x="-50" y="-20" width="100" height="20" fill={timeOfDay === 'night' ? '#FFF' : '#FAFAFA'} />
          <text x="0" y="40" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Lekki</text>
          <text x="0" y="60" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">Weekend Energy</text>
        </g>
        
        {/* SURULERE: Local Soul */}
        <g 
          transform="translate(800, 700)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "surulere" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("surulere", true)}
        >
          <path d="M -40 0 Q 0 -60 40 0" fill="none" stroke={timeOfDay === 'night' ? '#9E9E9E' : '#757575'} strokeWidth="6" />
          <rect x="-60" y="-10" width="120" height="10" fill={timeOfDay === 'night' ? '#424242' : '#9E9E9E'} />
          <text x="0" y="30" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Surulere</text>
          <text x="0" y="50" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">Mainland Soul</text>
        </g>

        {/* LAGOS ISLAND: History */}
        <g 
          transform="translate(1100, 900)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "lagos-island" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("lagos-island", true)}
        >
          <rect x="-30" y="-50" width="60" height="50" fill={theme.bridge} />
          <polygon points="-40,-50 40,-50 0,-80" fill={timeOfDay === 'night' ? '#D32F2F' : '#F44336'} />
          <text x="0" y="30" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Lagos Island</text>
          <text x="0" y="50" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">The Roots</text>
        </g>

        {/* IKEJA: The Capital */}
        <g 
          transform="translate(900, 300)" 
          className={`cursor-pointer transition-opacity duration-700 ${activeSlug && activeSlug !== "ikeja" ? "opacity-30" : "opacity-100 hover:opacity-90"}`}
          onClick={() => handleAreaClick("ikeja", true)}
        >
          <rect x="-40" y="-40" width="80" height="40" fill={timeOfDay === 'night' ? '#FF8F00' : '#FFCA28'} />
          <rect x="-20" y="-80" width="40" height="40" fill={timeOfDay === 'night' ? '#FF6F00' : '#FFB300'} />
          <text x="0" y="30" textAnchor="middle" className="font-serif italic text-2xl" fill={theme.text}>Ikeja</text>
          <text x="0" y="50" textAnchor="middle" className="font-mono uppercase text-[10px] tracking-widest" fill={theme.text} opacity="0.6">The Capital</text>
        </g>

      </svg>
    </div>
  );
}

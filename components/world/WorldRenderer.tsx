"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { lagosScene } from "./data/lagos.scene";
import { useLivingMotion } from "./animation/useLivingMotion";

import SkyLayer from "./layers/SkyLayer";
import CloudLayer from "./layers/CloudLayer";
import WaterLayer from "./layers/WaterLayer";
import LandmarkLayer from "./layers/LandmarkLayer";
import DistrictLayer from "./layers/DistrictLayer";
import TransportLayer from "./layers/TransportLayer";
import AtmosphereLayer from "./layers/AtmosphereLayer";

interface WorldRendererProps {
  sceneId: string;
  activeSlug: string | null;
}

type TimeOfDay = "morning" | "afternoon" | "golden-hour" | "night";

export default function WorldRenderer({ sceneId, activeSlug }: WorldRendererProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parallax = useLivingMotion();

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");

  // Get active query attributes to drive atmosphere reactivity
  const budgetParam = searchParams.get("budget");
  const vibeParam = searchParams.get("vibe");
  const budget = budgetParam ? parseInt(budgetParam) : null;
  const vibe = vibeParam || null;

  useEffect(() => {
    // Living City System: Set temporal state based on local time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setTimeOfDay("morning");
    else if (hour >= 11 && hour < 16) setTimeOfDay("afternoon");
    else if (hour >= 16 && hour < 19) setTimeOfDay("golden-hour");
    else setTimeOfDay("night");
  }, []);

  const handleDistrictClick = (slug: string, isActive: boolean) => {
    if (!isActive) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    router.push(`/explore/${slug}?${nextParams.toString()}`);
  };

  // Resolve camera focus translations based on the selected district
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const activeDistrict = lagosScene.districts.find((d) => d.slug === activeSlug);

  if (activeSlug && activeDistrict) {
    scale = activeDistrict.scale;
    // Target coordinate offset to center it in the left-hand column
    translateX = 1200 - activeDistrict.x * scale;
    translateY = 800 - activeDistrict.y * scale;
  }

  // Calculate parallax offsets to coordinate multiplane movement
  const px = parallax.x * 25;
  const py = parallax.y * 12;

  const activeWaterColor = lagosScene.waterColors[timeOfDay] || lagosScene.waterColors.afternoon;

  return (
    <div 
      className="w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-1000 bg-white"
    >
      <svg 
        viewBox="0 0 2400 1600" 
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full origin-center pointer-events-auto transition-transform ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: `scale(${scale}) translate(${(translateX / scale) + px}px, ${(translateY / scale) + py}px)`,
          transitionDuration: "1200ms"
        }}
      >
        {/* Layer Stack */}
        <SkyLayer timeOfDay={timeOfDay} />
        <CloudLayer />
        <WaterLayer color={activeWaterColor} />
        <LandmarkLayer timeOfDay={timeOfDay} />
        <TransportLayer />
        
        {/* Interactive District Layer */}
        <DistrictLayer 
          activeSlug={activeSlug} 
          timeOfDay={timeOfDay} 
          budget={budget}
          onDistrictClick={handleDistrictClick} 
        />
        
        <AtmosphereLayer timeOfDay={timeOfDay} />
      </svg>
    </div>
  );
}

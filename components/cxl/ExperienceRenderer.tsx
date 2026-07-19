"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { lagosCityData } from "./data/lagos.city";
import { lagosThemeData } from "./data/lagos.theme";
import { useLivingMotion } from "./animation/useLivingMotion";

import SkyLayer from "./layers/SkyLayer";
import CloudLayer from "./layers/CloudLayer";
import WaterLayer from "./layers/WaterLayer";
import LandmarkLayer from "./layers/LandmarkLayer";
import DistrictLayer from "./layers/DistrictLayer";
import TransportLayer from "./layers/TransportLayer";
import AtmosphereLayer from "./layers/AtmosphereLayer";

interface ExperienceRendererProps {
  city: string;
  chapter: string | null;
}

type TimeOfDay = "morning" | "afternoon" | "golden-hour" | "night";

export default function ExperienceRenderer({ city, chapter }: ExperienceRendererProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parallax = useLivingMotion();

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");

  const budgetParam = searchParams.get("budget");
  const budget = budgetParam ? parseInt(budgetParam) : null;

  useEffect(() => {
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

  // camera configuration presets resolved cleanly from CXL theme data
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const activeTheme = lagosThemeData.districtThemes.find((t) => t.slug === chapter);

  if (chapter && activeTheme) {
    scale = activeTheme.camera.zoom;
    translateX = 1200 - activeTheme.camera.focusX * scale;
    translateY = 800 - activeTheme.camera.focusY * scale;
  }

  const px = parallax.x * 25;
  const py = parallax.y * 12;

  const activeWaterColor = lagosSceneWaterColor(timeOfDay);

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
        <SkyLayer timeOfDay={timeOfDay} />
        <CloudLayer />
        <WaterLayer color={activeWaterColor} />
        <LandmarkLayer timeOfDay={timeOfDay} />
        <TransportLayer />
        
        <DistrictLayer 
          activeSlug={chapter} 
          timeOfDay={timeOfDay} 
          budget={budget}
          onDistrictClick={handleDistrictClick} 
        />
        
        <AtmosphereLayer timeOfDay={timeOfDay} />
      </svg>
    </div>
  );
}

function lagosSceneWaterColor(time: TimeOfDay) {
  const colors = {
    morning: "#B3E5FC",
    afternoon: "#C8E6C9",
    "golden-hour": "#FFE0B2",
    night: "#0288D1"
  };
  return colors[time] || colors.afternoon;
}

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlannerWidget from "./PlannerWidget";
import LivePreviewCard from "./LivePreviewCard";
import MobileLivePreviewBar from "./MobileLivePreviewBar";
import { Spot } from "@/lib/types";

interface HeroSectionProps {
  spots: Spot[];
}

export const DEFAULT_FALLBACK_SPOT: Spot = {
  id: "fallback-grill",
  name: "Lekki Grill",
  address: "Lekki Phase 1",
  address_slug: "lekki-phase-1",
  area_id: "lekki",
  vibe_tags: ["Dinner", "Romantic", "Date"],
  price_per_person: 12000,
  transport_matrix: {},
  is_featured: true,
  active: true,
};

const PHRASES = [
  "Date night?",
  "Squad linkup?",
  "Solo trip?",
  "Birthday turn up?",
  "Right place • Right price • Right occasion",
];

import { LocationService, Location } from "@/lib/services/LocationService";
import { useRecommendations } from "@/lib/planning/useRecommendations";
import { useOrigin } from "@/lib/location/OriginContext";

export default function HeroSection({ spots }: HeroSectionProps) {
  // Shared state coordinated between inputs and live preview
  const [squadSize, setSquadSize] = useState<number>(3);
  const [budget, setBudget] = useState<number>(50000);
  const [vibe, setVibe] = useState<string | null>(null);
  const [manualArea, setManualArea] = useState<Location | null>(null);

  const { origin } = useOrigin();

  const selectedArea = useMemo(() => {
    if (manualArea) return manualArea;
    if (origin) {
      return LocationService.getVerifiedAreas().find(a => a.id === origin.planningAreaSlug) || null;
    }
    return LocationService.getVerifiedAreas()[0];
  }, [manualArea, origin]);

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const request = useMemo(() => ({
    squadSize,
    budget,
    vibe: vibe || "chill"
  }), [squadSize, budget, vibe]);

  const activeSpots = useMemo(() => {
    return (spots && spots.length > 0) ? spots.filter((s) => s.active) : [];
  }, [spots]);

  const { plans } = useRecommendations({
    spots: activeSpots,
    request
  });

  const recommendedSpots = useMemo(() => {
    const topSpots = plans.slice(0, 3).map((p) => p.spot);
    return topSpots.length > 0 ? topSpots : [DEFAULT_FALLBACK_SPOT];
  }, [plans]);

  const vibePhrase = useMemo(() => {
    if (!vibe) return "a date night";
    if (vibe.toLowerCase().includes("dinner")) return "a date night";
    if (vibe.toLowerCase().includes("chill")) return "a squad linkup";
    if (vibe.toLowerCase().includes("party")) return "a birthday turn up";
    if (vibe.toLowerCase().includes("quick")) return "quick bites";
    if (vibe.toLowerCase().includes("foodie")) return "serious chop";
    if (vibe.toLowerCase().includes("brunch")) return "a brunch vibe";
    return `${vibe.toLowerCase()} hangout`;
  }, [vibe]);

  const squadPhrase = useMemo(() => {
    if (squadSize === 1) return "just me";
    if (squadSize === 2) return "2 people";
    return `${squadSize} people`;
  }, [squadSize]);

  const isNightlifeVibe = useMemo(() => {
    if (!vibe) return false;
    const v = vibe.toLowerCase();
    return v.includes("party") || v.includes("dinner");
  }, [vibe]);

  const perPersonBudget = Math.round(budget / Math.max(1, squadSize));

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
      className="relative w-full bg-[#F6F6F2] pt-16 sm:pt-20 pb-16 px-4 sm:px-8 md:px-16 border-b border-[#E5E5DE] overflow-hidden"
    >
      {/* Subtle hero background */}
      <div className="hero-background" aria-hidden="true" />

      {/* Contextual visual atmosphere: Daylight warm sand vs. Twilight nightlife atmosphere */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
          isNightlifeVibe ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(ellipse 90% 70% at 85% 15%, rgba(20, 24, 38, 0.08), transparent 70%), radial-gradient(ellipse 50% 50% at 10% 90%, rgba(249, 232, 40, 0.04), transparent 60%)"
        }}
        aria-hidden="true"
      />
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
          !isNightlifeVibe ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(ellipse 90% 70% at 85% 15%, rgba(249, 232, 40, 0.10), transparent 70%), radial-gradient(ellipse 50% 50% at 10% 90%, rgba(229, 77, 46, 0.03), transparent 60%)"
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-10 text-left relative z-10">
        {/* Interactive Phrase Header Area */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] text-[#F9E828] text-[11px] font-mono font-bold uppercase tracking-widest shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828] animate-pulse" />
            <span>KNOW THE DAMAGE BEFORE YOU LEAVE HOME</span>
          </div>

          <h1 className="text-[34px] sm:text-[44px] md:text-[54px] font-black text-[#111111] leading-[1.1] tracking-[-1.5px] font-display">
            Plan <span className="underline decoration-[#F9E828] decoration-4 underline-offset-4">{vibePhrase}</span> from{" "}
            <span className="underline decoration-[#111111] decoration-2 underline-offset-4">{selectedArea?.name || "Yaba"}</span> for{" "}
            <span className="underline decoration-[#111111] decoration-2 underline-offset-4">{squadPhrase}</span> under{" "}
            <span className="underline decoration-[#111111] decoration-2 underline-offset-4 font-mono">₦{budget.toLocaleString("en-NG")}</span>.
          </h1>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E5DE] text-xs font-mono font-bold text-[#111111] shadow-xs">
              <span className="text-[#111111]">₦{budget.toLocaleString("en-NG")} TOTAL</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#111111]">₦{perPersonBudget.toLocaleString("en-NG")} EACH</span>
            </div>
            <p className="text-xs sm:text-sm text-[#555555] font-medium">
              Verified menu items, round-trip rides, and zero cover charge surprises.
            </p>
          </div>
        </div>

        {/* Content Area: Side-by-side on desktop, vertical stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 lg:gap-8">
          {/* Left Column: Planner Widget (62% width on desktop) */}
          <div id="planner-widget" className="w-full md:w-[62%]">
            <Suspense fallback={<div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 h-[480px] animate-pulse" />}>
              <PlannerWidget
                squadSize={squadSize}
                setSquadSize={setSquadSize}
                budget={budget}
                setBudget={setBudget}
                vibe={vibe}
                setVibe={setVibe}
                recommendedSpots={recommendedSpots}
                selectedArea={selectedArea}
                setSelectedArea={setManualArea}
              />
            </Suspense>
          </div>

          {/* Right Column: Live Recommendation Card (34% width on desktop) - hidden on mobile */}
          <div className="w-full md:w-[34%] hidden md:block">
            <LivePreviewCard
              squadSize={squadSize}
              budget={budget}
              vibe={vibe}
              recommendedSpots={recommendedSpots}
              topPlan={plans[0] || null}
              startAreaId={selectedArea?.id ?? null}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Live Recommendation Bar & Bottom Sheet */}
      <MobileLivePreviewBar
        squadSize={squadSize}
        budget={budget}
        vibe={vibe}
        recommendedSpots={recommendedSpots}
        startAreaId={selectedArea?.id ?? null}
      />
    </motion.section>
  );
}

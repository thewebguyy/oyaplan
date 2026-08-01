"use client";

import { useState, useEffect, useMemo } from "react";
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

  const { origin } = useOrigin();

  const selectedArea = useMemo(() => {
    const slug = origin?.planningAreaSlug || "surulere";
    return LocationService.getVerifiedAreas().find(a => a.id === slug) || LocationService.getVerifiedAreas()[0];
  }, [origin]);

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
      className="relative w-full bg-[#FAF9F6] pt-20 pb-16 px-4 sm:px-8 md:px-16 border-b border-[#F3F4F6] overflow-hidden"
    >
      {/* Animated breathing gradient background & floating shapes */}
      <div className="hero-background" aria-hidden="true" />
      <div className="floating-element circle-1" aria-hidden="true" />
      <div className="floating-element circle-2" aria-hidden="true" />

      <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-12 text-left relative z-10">
        {/* Header and Subhead Area */}
        <div className="max-w-3xl">
          <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-black text-[#1A1A1A] leading-[1.1] tracking-[-1px]">
            Decide where to go in Lagos with{" "}
            <span className="highlight-green">budget confidence.</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#6B7280] font-semibold max-w-[600px] mt-2">
            Real venue prices. Transport estimated. Zero surprise costs.
          </p>
          <div className="relative flex items-center gap-1.5 text-sm md:text-base text-[#6B7280] font-semibold mt-3 h-[24px] overflow-hidden w-full">
            <span>Planning:</span>
            <div className="relative h-full flex-1">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={phraseIndex}
                  initial={{ y: 8, opacity: 0, filter: "blur(1px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -8, opacity: 0, filter: "blur(1px)" }}
                  transition={{
                    type: "tween",
                    ease: [0.16, 1, 0.3, 1],
                    duration: 0.5,
                  }}
                  className="text-[#008751] font-bold text-sm md:text-base absolute left-0 whitespace-nowrap"
                >
                  {PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content Area: Side-by-side on desktop, vertical stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 lg:gap-8">
          {/* Left Column: Planner Widget (62% width on desktop) */}
          <div id="planner-widget" className="w-full md:w-[62%]">
            <PlannerWidget
              squadSize={squadSize}
              setSquadSize={setSquadSize}
              budget={budget}
              setBudget={setBudget}
              vibe={vibe}
              setVibe={setVibe}
              recommendedSpots={recommendedSpots}
            />
          </div>

          {/* Right Column: Live Recommendation Card (34% width on desktop) - hidden on mobile */}
          <div className="w-full md:w-[34%] hidden md:block">
            <LivePreviewCard
              squadSize={squadSize}
              budget={budget}
              vibe={vibe}
              recommendedSpots={recommendedSpots}
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

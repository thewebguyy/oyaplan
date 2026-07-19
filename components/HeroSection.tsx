"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlannerWidget from "./PlannerWidget";
import LivePreviewCard from "./LivePreviewCard";
import { Spot } from "@/lib/types";

interface HeroSectionProps {
  spots: Spot[];
}

const DEFAULT_FALLBACK_SPOT: Spot = {
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
  "Heading out solo?",
  "A date night?",
  "Gathering the squad?",
  "Checking verified pricing?",
];

export default function HeroSection({ spots }: HeroSectionProps) {
  // Shared state coordinated between inputs and live preview
  const [squadSize, setSquadSize] = useState<number>(3);
  const [budget, setBudget] = useState<number>(50000);
  const [vibe, setVibe] = useState<string | null>(null);

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Client-side deterministic recommendation matching engine
  const recommendedSpot = useMemo(() => {
    const activeSpots = (spots && spots.length > 0)
      ? spots.filter((s) => s.active)
      : [DEFAULT_FALLBACK_SPOT];

    if (activeSpots.length === 0) return DEFAULT_FALLBACK_SPOT;

    // Transport cost rules: Solo planning -> 0; Groups 2-4 -> ₦5k; Groups 5+ -> ₦10k
    const transportEstimate = squadSize === 1 ? 0 : squadSize > 4 ? 10000 : 5000;

    let bestSpot: Spot = DEFAULT_FALLBACK_SPOT;
    let bestScore = -Infinity;

    activeSpots.forEach((spot) => {
      const foodCost = spot.price_per_person * squadSize;
      const taxCost = foodCost * 0.1;
      const totalCost = foodCost + transportEstimate + taxCost;

      // Score 1: Vibe Match
      let vibeScore = 0;
      if (vibe) {
        const matchTags = (spot.vibe_tags || []).map((t) => t.toLowerCase());
        const vibeLower = vibe.toLowerCase();

        if (
          vibeLower === "dinner" &&
          (matchTags.includes("dinner") || matchTags.includes("romantic") || matchTags.includes("date"))
        ) {
          vibeScore = 50;
        } else if (
          vibeLower === "chill" &&
          (matchTags.includes("chill") || matchTags.includes("group") || matchTags.includes("squad") || matchTags.includes("linkup"))
        ) {
          vibeScore = 50;
        } else if (
          vibeLower === "party" &&
          (matchTags.includes("party") || matchTags.includes("celebration") || matchTags.includes("turn up"))
        ) {
          vibeScore = 50;
        } else if (
          vibeLower === "quick" &&
          (matchTags.includes("quick") || matchTags.includes("bites") || matchTags.includes("cafe") || matchTags.includes("express"))
        ) {
          vibeScore = 50;
        } else if (
          vibeLower === "foodie" &&
          (matchTags.includes("foodie") || matchTags.includes("restaurant") || matchTags.includes("chop"))
        ) {
          vibeScore = 50;
        } else if (
          vibeLower === "brunch" &&
          (matchTags.includes("brunch") || matchTags.includes("garden"))
        ) {
          vibeScore = 50;
        }
      }

      // Score 2: Budget Fit (prefer close matches under budget, penalize overshoot)
      let budgetScore = 0;
      if (totalCost <= budget) {
        budgetScore = 50 * (totalCost / budget);
      } else {
        budgetScore = -200 * ((totalCost - budget) / budget);
      }

      const totalScore = vibeScore + budgetScore;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSpot = spot;
      }
    });

    return bestSpot;
  }, [spots, squadSize, budget, vibe]);

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
          <p className="text-lg leading-relaxed text-[#6B7280] font-medium max-w-[600px] mt-3">
            Know what you&apos;ll spend before you leave home. Plan your next Lagos outing with verified venue prices, transport estimates, and zero surprise costs.
          </p>
          <div className="relative flex items-center gap-1.5 text-sm md:text-base text-[#6B7280] font-semibold mt-3 h-[24px] overflow-hidden">
            <span>Planning:</span>
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
                className="text-[#008751] font-bold text-sm md:text-base absolute left-[65px] whitespace-nowrap"
              >
                {PHRASES[phraseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Content Area: Side-by-side on desktop, vertical stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12">
          {/* Left Column: Planner Widget (65% width on desktop) */}
          <div className="w-full md:w-[63%] shrink-0">
            <PlannerWidget
              squadSize={squadSize}
              setSquadSize={setSquadSize}
              budget={budget}
              setBudget={setBudget}
              vibe={vibe}
              setVibe={setVibe}
              recommendedSpot={recommendedSpot}
            />
          </div>

          {/* Right Column: Live Recommendation Card (35% width on desktop) - hidden on mobile */}
          <div className="w-full md:w-[33%] shrink-0 hidden md:block">
            <LivePreviewCard
              squadSize={squadSize}
              budget={budget}
              vibe={vibe}
              recommendedSpot={recommendedSpot}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

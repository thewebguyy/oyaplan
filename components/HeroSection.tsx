"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlanningFlowIllustration from "./PlanningFlowIllustration";
import PlannerWidget from "./PlannerWidget";
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

const renderPhrase = (index: number) => {
  switch (index) {
    case 0:
      return (
        <>
          Where you wan <span className="text-[#008751]">go</span>?
        </>
      );
    case 1:
      return (
        <>
          How much is the <span className="text-[#FCC630]">damage</span>?
        </>
      );
    case 2:
      return (
        <>
          Na only <span className="text-[#008751]">you</span>?
        </>
      );
    case 3:
      return (
        <>
          Is it a full <span className="text-[#FCC630]">squad</span>?
        </>
      );
    default:
      return null;
  }
};

export default function HeroSection({ spots }: HeroSectionProps) {
  // Shared state coordinated between the input planner and the sequential narrative panels
  const [squadSize, setSquadSize] = useState<number>(3);
  const [budget, setBudget] = useState<number>(50000);
  const [vibe, setVibe] = useState<string | null>(null);

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % 4);
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
      className="relative w-full bg-[#FAF9F6] pt-20 pb-12 px-4 sm:px-8 md:px-16 border-b border-[#F3F4F6]"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-12 text-left">
        {/* Header and Subhead Area */}
        <div className="max-w-2xl">
          <div className="relative overflow-hidden w-full h-[48px] md:h-[68px]">
            <AnimatePresence mode="popLayout">
              <motion.h1
                key={phraseIndex}
                initial={{ y: 12, opacity: 0, filter: "blur(2px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -12, opacity: 0, filter: "blur(2px)" }}
                transition={{
                  type: "tween",
                  ease: [0.16, 1, 0.3, 1],
                  duration: 0.6,
                }}
                className="absolute left-0 text-[32px] sm:text-[40px] md:text-[50px] font-black text-[#1A1A1A] leading-[1.15] tracking-[-1px]"
              >
                {renderPhrase(phraseIndex)}
              </motion.h1>
            </AnimatePresence>
          </div>
          <p className="text-base md:text-lg text-[#6B7280] leading-[1.5] mt-3">
            Get a plan in two minutes
          </p>
        </div>

        {/* Content Area: Side-by-side on desktop, vertical stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 md:gap-16">
          {/* Left Column: Planning Narrative Illustration (40% width on desktop) - stacks underneath on mobile */}
          <div className="w-full md:w-[40%] md:max-w-[280px] shrink-0 order-2 md:order-1">
            <PlanningFlowIllustration
              squadSize={squadSize}
              budget={budget}
              vibe={vibe}
              recommendedSpot={recommendedSpot}
            />
          </div>

          {/* Right Column: Planner Form (60% width on desktop) - stacks on top on mobile */}
          <div className="w-full md:w-[60%] flex justify-center md:justify-end order-1 md:order-2">
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
        </div>
      </div>
    </motion.section>
  );
}

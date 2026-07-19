"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlanningFlowIllustration from "./PlanningFlowIllustration";
import PlannerWidget from "./PlannerWidget";

const PHRASES = [
  "Where you wan go?",
  "How much is your budget?",
  "Na only you?",
  "Is it a full squad?"
];

export default function HeroSection() {
  // Shared state coordinated between the input planner and the sequential narrative panels
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
      className="relative w-full bg-white pt-24 pb-16 px-6 sm:px-12 md:px-20 lg:px-24 border-b border-[#F3F4F6]"
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
                  duration: 0.6
                }}
                className="absolute left-0 text-[32px] md:text-[48px] font-bold text-[#1A1A1A] leading-[1.2] tracking-[-0.5px]"
              >
                {PHRASES[phraseIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <p className="text-base md:text-lg text-[#6B7280] leading-[1.5] mt-3">
            Get a plan in two minutes
          </p>
        </div>

        {/* Content Area: Side-by-side on desktop, vertical stack on mobile */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 md:gap-16">
          {/* Left Column: Planning Narrative Illustration (40% width on desktop) */}
          <div className="w-full md:w-[40%] md:max-w-[280px] shrink-0">
            <PlanningFlowIllustration
              squadSize={squadSize}
              budget={budget}
              vibe={vibe}
            />
          </div>

          {/* Right Column: Planner Form (60% width on desktop) */}
          <div className="w-full md:w-[60%] flex justify-center md:justify-end">
            <PlannerWidget
              squadSize={squadSize}
              setSquadSize={setSquadSize}
              budget={budget}
              setBudget={setBudget}
              vibe={vibe}
              setVibe={setVibe}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PlanningFlowIllustration from "./PlanningFlowIllustration";
import PlannerWidget from "./PlannerWidget";

export default function HeroSection() {
  // Shared state coordinated between the input planner and the sequential narrative panels
  const [squadSize, setSquadSize] = useState<number>(3);
  const [budget, setBudget] = useState<number>(50000);
  const [vibe, setVibe] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full bg-white pt-24 pb-16 px-6 sm:px-12 md:px-20 lg:px-24 border-b border-[#F3F4F6]"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-12 text-left">
        {/* Header and Subhead Area */}
        <div className="max-w-2xl">
          <h1 className="text-[32px] md:text-[48px] font-bold text-[#1A1A1A] leading-[1.2] tracking-[-0.5px]">
            Stop debating what to do tonight.
          </h1>
          <p className="text-base md:text-lg text-[#6B7280] leading-[1.5] mt-3">
            Get a verified outing plan with accurate costs in 2 minutes.
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

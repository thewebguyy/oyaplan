"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { triggerHaptic } from "@/lib/ui/haptics";

export type PhraseField = "vibe" | "area" | "squad" | "budget";

interface KineticPhraseTumblerProps {
  vibeText: string;
  areaText: string;
  squadText: string;
  budgetText: string;
  onFieldClick?: (field: PhraseField) => void;
  className?: string;
}

export function KineticPhraseTumbler({
  vibeText,
  areaText,
  squadText,
  budgetText,
  onFieldClick,
  className = "",
}: KineticPhraseTumblerProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const handleClick = (field: PhraseField) => {
    triggerHaptic("selection");
    onFieldClick?.(field);
  };

  const getTransition = (): Transition => {
    if (prefersReducedMotion) {
      return { duration: 0.15 };
    }
    return {
      type: "spring",
      stiffness: 320,
      damping: 24,
      mass: 0.7,
    };
  };

  const getMotionVariants = () => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
    return {
      initial: { y: "60%", opacity: 0, filter: "blur(2px)" },
      animate: { y: "0%", opacity: 1, filter: "blur(0px)" },
      exit: { y: "-60%", opacity: 0, filter: "blur(2px)" },
    };
  };

  const variants = getMotionVariants();
  const transition = getTransition();

  return (
    <h1
      className={`text-[32px] sm:text-[44px] md:text-[52px] font-black text-[#111111] leading-[1.18] tracking-[-1.5px] font-display select-none ${className}`}
    >
      Plan{" "}
      {/* 1. Vibe Slot */}
      <button
        type="button"
        onClick={() => handleClick("vibe")}
        aria-label={`Change occasion or vibe. Currently ${vibeText}`}
        className="inline-block relative overflow-hidden align-baseline text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 rounded-lg px-1 -mx-1 transition-colors hover:bg-[#F9E828]/25"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={vibeText}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            className="inline-block text-[#111111] underline decoration-[#F9E828] decoration-4 sm:decoration-[5px] underline-offset-4 sm:underline-offset-6 font-black"
          >
            {vibeText}
          </motion.span>
        </AnimatePresence>
      </button>{" "}
      from{" "}
      {/* 2. Area Slot */}
      <button
        type="button"
        onClick={() => handleClick("area")}
        aria-label={`Change starting location. Currently ${areaText}`}
        className="inline-block relative overflow-hidden align-baseline text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 rounded-lg px-1 -mx-1 transition-colors hover:bg-black/5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={areaText}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            className="inline-block text-[#111111] underline decoration-[#111111] decoration-2 sm:decoration-[3px] underline-offset-4 sm:underline-offset-6 font-black"
          >
            {areaText}
          </motion.span>
        </AnimatePresence>
      </button>{" "}
      for{" "}
      {/* 3. Squad Slot */}
      <button
        type="button"
        onClick={() => handleClick("squad")}
        aria-label={`Change squad size. Currently ${squadText}`}
        className="inline-block relative overflow-hidden align-baseline text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 rounded-lg px-1 -mx-1 transition-colors hover:bg-black/5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={squadText}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            className="inline-block text-[#111111] underline decoration-[#111111] decoration-2 sm:decoration-[3px] underline-offset-4 sm:underline-offset-6 font-black"
          >
            {squadText}
          </motion.span>
        </AnimatePresence>
      </button>{" "}
      under{" "}
      {/* 4. Budget Slot */}
      <button
        type="button"
        onClick={() => handleClick("budget")}
        aria-label={`Change target budget. Currently ${budgetText}`}
        className="inline-block relative overflow-hidden align-baseline text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30 rounded-lg px-1 -mx-1 transition-colors hover:bg-black/5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={budgetText}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={transition}
            className="inline-block font-mono text-[#111111] underline decoration-[#111111] decoration-2 sm:decoration-[3px] underline-offset-4 sm:underline-offset-6 font-black tabular-nums"
          >
            {budgetText}
          </motion.span>
        </AnimatePresence>
      </button>
      .
    </h1>
  );
}

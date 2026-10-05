"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/ui/haptics";

interface ShortlistStampProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

/**
 * Shortlist Stamp:
 * Tactile confirmation stamp "✓ SHORTLISTED" with decisive physical impact physics.
 * Communicates that the venue has been added to the user's personal shortlist.
 * Explicitly avoids implying the venue has been verified by OyaPlan.
 */
export function ShortlistStamp({
  isVisible,
  onAnimationComplete,
  className = "",
}: ShortlistStampProps) {
  useEffect(() => {
    if (isVisible) {
      triggerHaptic("heavy");
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: -4 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          onAnimationComplete={onAnimationComplete}
          className={`pointer-events-none select-none z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-[#F9E828] border-2 border-[#F9E828] font-mono font-black text-xs uppercase tracking-widest shadow-2xl ${className}`}
        >
          <span>✓</span>
          <span>SHORTLISTED</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

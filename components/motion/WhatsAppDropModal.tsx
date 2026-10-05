"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/ui/haptics";

interface WhatsAppDropProps {
  isDropping: boolean;
  venueName?: string;
  onDropComplete?: () => void;
}

/**
 * WhatsApp "Drop" Animation:
 * Physical metaphor of the plan folding into an envelope token and shooting outward
 * to the squad chat. Extremely fast (350ms total) and strictly non-blocking.
 */
export function WhatsAppDropModal({
  isDropping,
  venueName = "Lagos Plan",
  onDropComplete,
}: WhatsAppDropProps) {
  useEffect(() => {
    if (isDropping) {
      triggerHaptic("medium");
      const timer = setTimeout(() => {
        onDropComplete?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isDropping, onDropComplete]);

  return (
    <AnimatePresence>
      {isDropping && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center font-mono">
          <motion.div
            initial={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              scale: [1, 0.7, 0.4],
              y: [0, -40, -180],
              opacity: [1, 0.9, 0],
              rotate: [0, 6, 12],
            }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-48 bg-[#111111] text-[#F9E828] border-2 border-[#F9E828] rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center text-center space-y-1"
          >
            <span className="text-[9px] uppercase tracking-widest text-white/60">
              DISPATCHING TO SQUAD
            </span>
            <span className="text-xs font-black truncate max-w-full">
              {venueName}
            </span>
            <div className="w-8 h-1 bg-[#F9E828] rounded-full mt-1" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

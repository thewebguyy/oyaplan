"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "Where you wan go?",
  "How much is your budget?",
  "Na only you?",
  "Is it a full squad?"
];

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-full" style={{ perspective: "1200px" }}>
      <span className="relative flex items-center justify-center w-full min-h-[100px] sm:min-h-[120px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 15,
              mass: 1.2
            }}
            style={{ 
              transformOrigin: "center center",
              transformStyle: "preserve-3d"
            }}
            className="absolute flex items-center justify-center w-fit px-8 py-4 sm:py-5 bg-brand-green text-chow-yellow-100 rounded-[12px] sm:rounded-[16px] shadow-[0_20px_40px_rgba(0,135,81,0.3)] border-b-[6px] border-[#00663C]"
          >
            {/* The physical split-flap line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] sm:h-[4px] bg-[#00663C] z-20" />
            
            {/* The text */}
            <span className="relative z-10 font-black tracking-tight text-[0.8em] sm:text-[0.9em] leading-none uppercase drop-shadow-md">
              {PHRASES[index]}
            </span>
          </motion.div>
        </AnimatePresence>
      </span>
    </span>
  );
}

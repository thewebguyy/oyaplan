"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "Find where to go,",
  "Wetin dey sup?",
  "Ekaabo!"
];

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-full text-brand-green">
      <span className="relative inline-flex items-center justify-center overflow-hidden h-[1.2em] w-full align-top">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={index}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 1
            }}
            className="absolute left-0 right-0 w-full text-center z-10"
          >
            {PHRASES[index]}
          </motion.span>
        </AnimatePresence>

        {/* Highlighter Swish */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={`highlight-${index}`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{
              delay: 0.3, // Wait for text to snap into place
              duration: 0.4,
              ease: "circOut"
            }}
            className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-fit min-w-[300px] h-[30%] bg-chow-yellow-100 z-0 origin-left rounded-sm"
          />
        </AnimatePresence>
      </span>
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHRASES = [
  "Find somewhere that fits your budget.",
  "Plan a date night in seconds.",
  "Discover verified spots in Lagos.",
  "Get accurate price estimates."
];

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-full h-[32px] sm:h-[40px] mt-2 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.5
          }}
          className="absolute left-0 right-0 flex items-center"
        >
          <span className="text-brand-green type-heading tracking-tight text-xl sm:text-2xl font-black">
            {PHRASES[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </span>
  );
}

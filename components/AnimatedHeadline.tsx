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
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-full h-[40px] sm:h-[48px] mt-2 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: 24, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -24, opacity: 0, filter: "blur(2px)" }}
          transition={{
            type: "tween",
            ease: [0.16, 1, 0.3, 1], // standard V2.0 ease
            duration: 0.6
          }}
          className="absolute left-0 right-0 flex items-center justify-center"
        >
          <span className="text-brand-green type-heading tracking-tight text-xl sm:text-2xl font-black">
            {PHRASES[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </span>
  );
}

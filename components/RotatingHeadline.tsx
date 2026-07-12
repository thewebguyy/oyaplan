"use client";

import { useEffect, useState } from "react";

export default function RotatingHeadline() {
  const [step, setStep] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion client-side
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    if (mediaQuery.matches) {
      setStep(3);
      return;
    }

    // Timeline schedule:
    // 0: "Do you know where to go?" (hold 1.2s)
    // 1: "Do you know how much it is going to cost?" (hold 1.2s)
    // 2: "How much dey your hand?" (hold 2.0s)
    // 3: "Only you or na full squad?" (resolve and lock)
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2400),
      setTimeout(() => setStep(3), 4400),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const lines = [
    "Do you know where to go?",
    "Do you know how much it is going to cost?",
    "How much dey your hand?",
    "Only you or na full squad?"
  ];

  if (prefersReducedMotion) {
    return (
      <h1 className="font-sans font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] uppercase leading-[0.9] text-text-primary text-center max-w-5xl mx-auto">
        Only you or na full squad?
      </h1>
    );
  }

  return (
    <h1 className="font-sans font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] uppercase leading-[0.9] text-text-primary text-center max-w-5xl mx-auto relative overflow-hidden h-[2.2em] md:h-[2em] lg:h-[1.1em] flex justify-center items-center">
      {/* Invisible placeholder for height on all screens */}
      <span className="opacity-0 select-none pointer-events-none block py-2">
        Do you know how much it is going to cost?
      </span>
      
      {/* Dynamic line overlay */}
      <span className="absolute inset-0 flex justify-center items-center text-center">
        {lines.map((line, idx) => {
          let className = "hidden";
          
          if (idx === step) {
            className = "absolute animate-slide-up-in px-4 w-full text-center";
          } else if (idx === step - 1) {
            className = "absolute animate-slide-up-out px-4 w-full text-center";
          }
          
          return (
            <span key={idx} className={className}>
              {line}
              {idx === 3 && step === 3 && (
                <span className="text-black font-light animate-cursor-blink ml-1 inline-block">_</span>
              )}
            </span>
          );
        })}
      </span>
    </h1>
  );
}

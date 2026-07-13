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
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4500),
      setTimeout(() => setStep(4), 6000),
      setTimeout(() => setStep(5), 7500),
      setTimeout(() => setStep(6), 9000),
      setTimeout(() => setStep(7), 10500),
      setTimeout(() => setStep(8), 12000),
      setTimeout(() => setStep(9), 13500),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const lines = [
    "Where are we going?",
    "Wetin be the plan?",
    "Date night?",
    "Birthday loading?",
    "Squad link-up?",
    "After-work hangout?",
    "Somewhere new?",
    "Where you wan chop?",
    "Weekend plans?",
    "Let's figure it out."
  ];

  if (prefersReducedMotion) {
    return (
      <h1 className="font-sans font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] uppercase leading-[0.9] text-text-primary text-center max-w-5xl mx-auto">
        Let's figure it out.
      </h1>
    );
  }

  return (
    <h1 className="font-sans font-black text-5xl md:text-7xl lg:text-[5.5rem] tracking-[-0.04em] uppercase leading-[0.9] text-text-primary text-center max-w-5xl mx-auto relative overflow-hidden h-[2.2em] md:h-[2em] lg:h-[1.1em] flex justify-center items-center">
      {/* Invisible placeholder for height on all screens */}
      <span className="opacity-0 select-none pointer-events-none block py-2">
        Let's figure it out.
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
              {idx === lines.length - 1 && step === lines.length - 1 && (
                <span className="text-black font-light animate-cursor-blink ml-1 inline-block">_</span>
              )}
            </span>
          );
        })}
      </span>
    </h1>
  );
}

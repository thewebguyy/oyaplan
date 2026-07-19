"use client";

import { useState, useEffect } from "react";

export default function TimeGreeting() {
  const [greeting, setGreeting] = useState("Hello.");

  useEffect(() => {
    const hour = new Date().getHours();
    let computedGreeting = "Evening, Lagos.";
    if (hour < 12) {
      computedGreeting = "Morning, Lagos.";
    } else if (hour < 17) {
      computedGreeting = "Afternoon, Lagos.";
    }
    const raf = requestAnimationFrame(() => {
      setGreeting(computedGreeting);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
      <p className="font-serif italic text-text-muted text-sm sm:text-base tracking-wide select-none">
        {greeting}
      </p>
      <h2 className="type-display text-midnight-lagoon text-2xl sm:text-3xl font-black tracking-tight leading-none uppercase">
        Lagos Outing Budget
      </h2>
    </div>
  );
}

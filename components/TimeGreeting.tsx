"use client";

import { useState, useEffect } from "react";

export default function TimeGreeting() {
  const [greeting, setGreeting] = useState("Hello.");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning.");
    } else if (hour < 17) {
      setGreeting("Good afternoon.");
    } else {
      setGreeting("Good evening.");
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="type-display text-text-primary tracking-tight">
        {greeting}
      </h1>
      <p className="type-body text-text-muted text-lg md:text-xl">
        Where are we going today?
      </p>
    </div>
  );
}

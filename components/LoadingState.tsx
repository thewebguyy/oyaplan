"use client";

import { useState, useEffect } from "react";

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Calculating realistic costs...",
    "Finding the best fit for your squad...",
    "Finalizing your budget-friendly plan...",
    "Optimizing transport routes...",
    "Verifying spot availability...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center space-y-6 py-20 max-w-[320px] mx-auto text-center animate-in fade-in duration-500"
    >
      {/* Wordmark */}
      <div className="type-heading flex items-center">
        <span>Oya</span>
        <span className="text-brand-green">Plan</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-[3px] bg-brand-green-15 rounded-full overflow-hidden">
        <div className="w-full h-full bg-brand-green animate-progress" />
      </div>

      {/* Rotating Message */}
      <p className="type-body text-text-secondary h-6 transition-all duration-300">
        {messages[messageIndex]}
      </p>
    </div>
  );
}

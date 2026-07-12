"use client";

import { useState, useEffect } from "react";

const messages = [
  "Checking recent prices...",
  "Finding options that fit your budget...",
  "Putting everything together...",
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // ~400ms per message ensures all 3 are seen within the ~1200ms minimum duration.
    // The cross-fade takes 150ms.
    const timer = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center space-y-8 py-32 max-w-[320px] mx-auto text-center animate-in fade-in duration-700 motion-reduce:duration-0"
    >
      {/* Calm, un-animated wordmark */}
      <div className="type-heading flex items-center opacity-70">
        <span>Oya</span>
        <span className="text-brand-green">Plan</span>
      </div>

      {/* Absolute positioned cross-fading text */}
      <div className="h-6 relative w-full flex items-center justify-center">
        {messages.map((msg, idx) => {
          const isActive = idx === messageIndex;
          return (
            <p
              key={idx}
              className={`absolute type-body text-text-secondary transition-opacity duration-150 ease-in-out motion-reduce:transition-none ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {msg}
            </p>
          );
        })}
      </div>
    </div>
  );
}

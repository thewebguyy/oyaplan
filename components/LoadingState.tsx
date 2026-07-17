"use client";

import { useState, useEffect } from "react";

const messages = [
  "Checking verified prices...",
  "Comparing local venues...",
  "Estimating squad transport...",
  "Almost ready...",
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center space-y-8 py-32 max-w-[320px] mx-auto text-center animate-in fade-in duration-700 motion-reduce:duration-0"
    >
      {/* Forge Pulse — editorial heartbeat line */}
      <div className="w-full max-w-[120px] h-[2px] bg-border-default/30 rounded-full overflow-hidden">
        <div className="h-full w-full bg-lasgidi-yellow animate-forge-pulse motion-reduce:animate-none" />
      </div>

      {/* Absolute positioned cross-fading text */}
      <div className="h-6 relative w-full flex items-center justify-center">
        {messages.map((msg, idx) => {
          const isActive = idx === messageIndex;
          return (
            <p
              key={idx}
              className={`absolute type-body text-text-secondary transition-opacity ease-in-out motion-reduce:transition-none ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: "var(--duration-hover)" }}
            >
              {msg}
            </p>
          );
        })}
      </div>
    </div>
  );
}

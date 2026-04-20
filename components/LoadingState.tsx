"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export default function LoadingState() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) return 100;
        return oldProgress + (100 / 3); // 3 seconds total
      });
      setTimeLeft((oldTime) => (oldTime <= 0 ? 0 : oldTime - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const messages = [
    "Calculating realistic costs...",
    "Finding the best fit for your squad...",
    "Finalizing your budget-friendly plan..."
  ];

  const currentMessage = messages[Math.floor(3 - timeLeft)] || messages[messages.length - 1];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 max-w-md mx-auto text-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            className="text-[#008751] transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#008751]">{timeLeft}s</span>
          <span className="text-xs text-gray-500 uppercase font-semibold">Remaining</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Forging your perfect outing...</h2>
        <p className="text-gray-600 animate-pulse">{currentMessage}</p>
        <Progress value={progress} className="h-2 w-full bg-gray-100" />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Calculating realistic costs...",
    "Finding the best fit for your squad...",
    "Finalizing your budget-friendly plan..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 600);

    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 max-w-md mx-auto text-center min-h-[40vh]">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-[#008751] animate-pulse"></div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">OyaPlan</h2>
      </div>
      <p className="text-[15px] text-gray-600 font-medium transition-opacity duration-300">
        {messages[messageIndex]}
      </p>
    </div>
  );
}

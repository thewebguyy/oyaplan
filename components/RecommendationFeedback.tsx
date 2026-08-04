"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";

interface RecommendationFeedbackProps {
  planId: string;
}

export default function RecommendationFeedback({ planId }: RecommendationFeedbackProps) {
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);

  const handleFeedback = (rating: "up" | "down") => {
    setSubmitted(rating);
    AnalyticsService.track("plan_usefulness_rated", {
      session_id: `plan_feedback_${planId}`,
      properties: {
        category: "Trust",
        plan_id: planId,
        rating,
        version: "1.0",
      },
    });
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center animate-in fade-in duration-300">
        <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
          <Check className="w-4 h-4 text-[#008751]" />
          <span>Thanks! Your feedback helps make OyaPlan recommendations better.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-default/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <p className="text-xs font-bold text-midnight-lagoon text-center sm:text-left">
        Was this recommendation useful for your outing?
      </p>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleFeedback("up")}
          className="h-9 px-3.5 bg-surface-grey hover:bg-emerald-50 text-text-primary hover:text-[#008751] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-border-default/50"
          aria-label="Thumbs up"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Yes</span>
        </button>

        <button
          onClick={() => handleFeedback("down")}
          className="h-9 px-3.5 bg-surface-grey hover:bg-red-50 text-text-primary hover:text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-border-default/50"
          aria-label="Thumbs down"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>Not really</span>
        </button>
      </div>
    </div>
  );
}

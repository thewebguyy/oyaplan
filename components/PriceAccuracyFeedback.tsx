"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";

interface PriceAccuracyFeedbackProps {
  venueId: string;
  venueName: string;
}

export default function PriceAccuracyFeedback({ venueId, venueName }: PriceAccuracyFeedbackProps) {
  const [status, setStatus] = useState<"accurate" | "changed" | "outdated" | null>(null);

  const handleReport = (feedback: "accurate" | "changed" | "outdated") => {
    setStatus(feedback);
    AnalyticsService.track("price_accuracy_reported", {
      session_id: `price_feedback_${venueId}`,
      properties: {
        category: "Trust",
        venue_id: venueId,
        venue_name: venueName,
        status: feedback,
        version: "1.0",
      },
    });
  };

  if (status) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-center animate-in fade-in duration-300">
        <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4 text-[#008751]" />
          <span>Thanks! Your feedback keeps Lagos venue pricing reliable.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-grey/80 border border-border-default/50 rounded-2xl p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs font-bold text-midnight-lagoon">
          Were prices at {venueName} accurate?
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleReport("accurate")}
          className="flex-1 h-8 bg-white hover:bg-emerald-50 text-text-primary hover:text-[#008751] border border-border-default rounded-lg text-[11px] font-bold transition-all tap-feedback"
        >
          ✓ Accurate
        </button>

        <button
          onClick={() => handleReport("changed")}
          className="flex-1 h-8 bg-white hover:bg-amber-50 text-text-primary hover:text-amber-700 border border-border-default rounded-lg text-[11px] font-bold transition-all tap-feedback"
        >
          Some Changed
        </button>

        <button
          onClick={() => handleReport("outdated")}
          className="flex-1 h-8 bg-white hover:bg-red-50 text-text-primary hover:text-red-600 border border-border-default rounded-lg text-[11px] font-bold transition-all tap-feedback"
        >
          Outdated
        </button>
      </div>
    </div>
  );
}

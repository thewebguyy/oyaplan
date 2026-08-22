"use client";

import { useState } from "react";
import { Info, Check, ArrowUp, ArrowDown } from "lucide-react";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { TransportDisplayFormatter } from "@/lib/planning/transport";

interface TransportEstimateCardProps {
  minCost?: number;
  maxCost?: number;
  transportCost: number;
  mode?: string;
  confidenceScore?: number;
  confidenceLabel?: string;
  badgeColor?: "green" | "yellow" | "orange";
  assumptions?: string;
  startAreaName?: string;
  originDistrictId?: string;
  destinationDistrictId?: string;
  spotId?: string;
  departureAt?: string;
}

export default function TransportEstimateCard({
  minCost,
  maxCost,
  transportCost,
  mode = "ride-hailing",
  confidenceLabel = "Typical estimate",
  badgeColor = "yellow",
  assumptions,
  startAreaName = "Yaba",
  originDistrictId,
  destinationDistrictId,
  spotId,
  departureAt,
}: TransportEstimateCardProps) {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null);

  const displayMin = minCost ?? Math.max(1000, Math.round((transportCost * 0.85) / 500) * 500);
  const displayMax = maxCost ?? Math.round((transportCost * 1.15) / 500) * 500;
  const rangeCopy = TransportDisplayFormatter.formatRange(displayMin, displayMax);

  const formattedAssumptions = assumptions || `${mode === "public-transit" ? "Public transport" : mode === "driving" ? "Personal car" : "Ride-hailing"} estimate • Leaving from ${startAreaName}`;

  const getBadgeStyle = () => {
    switch (badgeColor) {
      case "green":
        return "bg-[#008751]/10 text-[#008751] border-[#008751]/20";
      case "orange":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "yellow":
      default:
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    }
  };

  const getBadgeDot = () => {
    switch (badgeColor) {
      case "green":
        return "bg-[#008751]";
      case "orange":
        return "bg-orange-500";
      case "yellow":
      default:
        return "bg-amber-500";
    }
  };

  const handleFeedback = (result: "about_right" | "higher" | "lower") => {
    setFeedbackSubmitted(result);
    AnalyticsService.track("transport_actual_feedback", {
      session_id: "00000000-0000-0000-0000-000000000000",
      properties: {
        category: "Feedback",
        mode,
        result,
        estimated_min: displayMin,
        estimated_max: displayMax,
        origin_district_id: originDistrictId,
        destination_district_id: destinationDistrictId,
        spot_id: spotId,
        departure_at: departureAt,
        version: "1.0",
      },
    });
  };

  return (
    <div className="bg-white border border-border-default/70 rounded-[20px] p-5 space-y-4 shadow-xs relative">
      {/* Header with Range and Confidence Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-text-muted tracking-wider">
              Est. Transport Range
            </span>
            <button
              onClick={() => setShowWhyModal(true)}
              className="text-text-muted hover:text-midnight-lagoon transition-colors p-0.5"
              aria-label="Why this estimate?"
              title="Why this estimate?"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-2xl font-black text-midnight-lagoon tracking-tight">{rangeCopy}</p>
        </div>

        <div
          className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 shrink-0 ${getBadgeStyle()}`}
        >
          <span className={`w-2 h-2 rounded-full ${getBadgeDot()}`} />
          <span>{confidenceLabel}</span>
        </div>
      </div>

      {/* Assumptions Pill */}
      <div className="bg-[#FAFAF8] border border-border-default/50 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary flex items-center gap-2">
        <span className="text-base select-none">
          {mode === "public-transit" ? "🚌" : mode === "driving" ? "🚘" : "🚗"}
        </span>
        <span className="truncate">{formattedAssumptions}</span>
      </div>

      {/* 1-Tap Post-Outing Feedback Bar */}
      <div className="pt-2 border-t border-border-default/40 flex items-center justify-between gap-2 text-xs">
        <span className="text-text-muted font-medium">Was transport fare...</span>
        {feedbackSubmitted ? (
          <span className="text-[#008751] font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Feedback saved!
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleFeedback("about_right")}
              className="px-2.5 py-1 bg-surface-grey hover:bg-[#008751]/10 hover:text-[#008751] rounded-lg font-bold transition-colors tap-feedback"
            >
              ✓ About right
            </button>
            <button
              onClick={() => handleFeedback("higher")}
              className="px-2.5 py-1 bg-surface-grey hover:bg-orange-500/10 hover:text-orange-600 rounded-lg font-bold transition-colors tap-feedback flex items-center gap-0.5"
            >
              <ArrowUp className="w-3 h-3" /> Higher
            </button>
            <button
              onClick={() => handleFeedback("lower")}
              className="px-2.5 py-1 bg-surface-grey hover:bg-blue-500/10 hover:text-blue-600 rounded-lg font-bold transition-colors tap-feedback flex items-center gap-0.5"
            >
              <ArrowDown className="w-3 h-3" /> Lower
            </button>
          </div>
        )}
      </div>

      {/* Why This Estimate Modal / Info Sheet */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#008751]" />
                <h3 className="text-lg font-black text-midnight-lagoon">Why this estimate?</h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="w-8 h-8 rounded-full bg-surface-grey flex items-center justify-center font-bold text-text-muted hover:text-midnight-lagoon"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Transport estimates are based on your starting area, selected transport mode, time of day, typical Lagos traffic profiles, and verified venue locations. Actual fares may vary during heavy rush hour traffic or rain.
            </p>
            <div className="bg-[#008751]/5 rounded-xl p-3 border border-[#008751]/15 text-[11px] text-[#008751] font-bold">
              💡 Budget Tip: Round-trip fare estimates include buffers so your outing stays within budget limits.
            </div>
            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 bg-midnight-lagoon text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

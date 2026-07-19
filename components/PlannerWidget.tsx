"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import LivePreviewCard from "./LivePreviewCard";

interface PlannerWidgetProps {
  squadSize: number;
  setSquadSize: (val: number) => void;
  budget: number;
  setBudget: (val: number) => void;
  vibe: string | null;
  setVibe: (val: string | null) => void;
}

const PRIMARY_VIBES = [
  { value: "Dinner", label: "Date Night", emoji: "💕" },
  { value: "Chill", label: "Squad Linkup", emoji: "👥" },
  { value: "Party", label: "Birthday Turn Up", emoji: "🎉" },
  { value: "Quick", label: "Quick Bites", emoji: "⚡" },
];

const EXTENDED_VIBES = [
  { value: "Foodie", label: "Serious Chop", emoji: "🍲" },
  { value: "Brunch", label: "Brunch Vibe", emoji: "🥞" },
];

const VIBE_TO_URL_MAP: Record<string, string> = {
  Dinner: "date-night",
  Chill: "chill",
  Foodie: "foodie",
  Party: "party",
  Quick: "quick-link",
  Brunch: "brunch",
};

export default function PlannerWidget({
  squadSize,
  setSquadSize,
  budget,
  setBudget,
  vibe,
  setVibe,
}: PlannerWidgetProps) {
  const router = useRouter();
  const [showMoreVibes, setShowMoreVibes] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Format currency for labels
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
  };

  // Calculations for sliders CSS backgrounds
  const squadPct = ((squadSize - 2) / 6) * 100;
  const budgetPct = ((budget - 10000) / 90000) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibe) {
      setValidationError("Please select a vibe to generate your plan.");
      return;
    }
    setValidationError(null);

    const params = new URLSearchParams();
    const urlVibe = VIBE_TO_URL_MAP[vibe] || vibe;
    
    params.append("vibe", urlVibe);
    params.append("squad", String(squadSize));
    params.append("budget", String(budget));
    params.append("fresh", "true");

    // Track analytics using local service
    AnalyticsService.track("forge_started", {
      session_id: "00000000-0000-0000-0000-000000000000",
      properties: {
        category: "Activation",
        source: "redesigned_hero_planner",
        budget: Number(budget),
        squad_size: Number(squadSize),
        version: "1.0",
      },
    });

    router.push(`/forge?${params.toString()}`);
  };

  const handleVibeClick = (value: string) => {
    setVibe(vibe === value ? null : value);
    setValidationError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 sm:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.06)] w-full max-w-[500px] flex flex-col gap-8"
      noValidate
    >
      <fieldset className="flex flex-col gap-6 p-0 m-0 border-none">
        <legend className="sr-only">Configure your outing constraints</legend>

        {/* INPUT: Squad Size Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="squad-size-input" className="text-sm font-semibold text-[#6B7280]">
              How many of you?
            </label>
            <span className="text-base font-bold text-[#1A1A1A]">
              {squadSize === 8 ? "8+ people" : `${squadSize} people`}
            </span>
          </div>
          <input
            id="squad-size-input"
            type="range"
            min="2"
            max="8"
            step="1"
            value={squadSize}
            onChange={(e) => setSquadSize(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all
              [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#008751] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:focus-visible:ring-3 [&::-webkit-slider-thumb]:focus-visible:ring-[#008751]/50
              [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#008751] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:focus-visible:ring-3 [&::-moz-range-thumb]:focus-visible:ring-[#008751]/50"
            style={{
              background: `linear-gradient(to right, #008751 ${squadPct}%, #F3F4F6 ${squadPct}%)`,
            }}
            aria-label={`Squad size: current value ${squadSize} people. Choose between 2 and 8+ people.`}
          />
        </div>

        {/* INPUT: Budget Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label htmlFor="budget-input" className="text-sm font-semibold text-[#6B7280]">
                What&apos;s your budget?
              </label>
              <span className="text-[11px] text-[#6B7280] font-normal leading-tight">Total or per person</span>
            </div>
            <span className="text-base font-bold text-[#1A1A1A]">
              {budget === 100000 ? "₦100,000+" : formatCurrency(budget)}
            </span>
          </div>
          <input
            id="budget-input"
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all
              [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#008751] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-none
              [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#008751] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md"
            style={{
              background: `linear-gradient(to right, #008751 ${budgetPct}%, #F3F4F6 ${budgetPct}%)`,
            }}
            aria-label={`Budget: current value ${formatCurrency(budget)}. Choose between ₦10,000 and ₦100,000+`}
          />
        </div>

        {/* INPUT: Vibe Selection Chips */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-[#6B7280]">What vibe?</span>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Select outing vibe">
            {PRIMARY_VIBES.map((item) => {
              const isActive = vibe === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleVibeClick(item.value)}
                  className={`flex items-center gap-2.5 px-4 h-14 rounded-[12px] font-bold text-sm text-left transition-all duration-200 cursor-pointer select-none outline-none
                    ${
                      isActive
                        ? "bg-[#FCC630] text-[#1A1A1A] border-2 border-[#008751]"
                        : "bg-[#F3F4F6] text-[#1A1A1A] border-2 border-transparent hover:bg-[#D1E7DB]"
                    }
                    focus-visible:ring-3 focus-visible:ring-[#008751]/50`}
                  role="button"
                  aria-pressed={isActive}
                  aria-label={`${item.label} vibe selection`}
                >
                  <span className="text-base shrink-0" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Render Extended Vibes inline if More Vibes link toggled */}
            <AnimatePresence>
              {showMoreVibes &&
                EXTENDED_VIBES.map((item) => {
                  const isActive = vibe === item.value;
                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      initial={{ opacity: 0, y: 8, filter: "blur(1.5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, filter: "blur(1.5px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                      onClick={() => handleVibeClick(item.value)}
                      className={`flex items-center gap-2.5 px-4 h-14 rounded-[12px] font-bold text-sm text-left transition-all duration-200 cursor-pointer select-none outline-none
                        ${
                          isActive
                            ? "bg-[#FCC630] text-[#1A1A1A] border-2 border-[#008751]"
                            : "bg-[#F3F4F6] text-[#1A1A1A] border-2 border-transparent hover:bg-[#D1E7DB]"
                        }
                        focus-visible:ring-3 focus-visible:ring-[#008751]/50`}
                      role="button"
                      aria-pressed={isActive}
                      aria-label={`${item.label} vibe selection`}
                    >
                      <span className="text-base shrink-0" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </motion.button>
                  );
                })}
            </AnimatePresence>
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setShowMoreVibes(!showMoreVibes)}
              className="text-sm font-bold text-[#008751] hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008751]/20 rounded px-1 -ml-1 transition-all"
            >
              {showMoreVibes ? "Less vibes" : "More vibes >"}
            </button>
          </div>
        </div>
      </fieldset>

      {/* Validation Message */}
      <AnimatePresence>
        {validationError && (
          <motion.p
            initial={{ opacity: 0, y: -6, filter: "blur(1px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(1px)" }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="text-sm text-red-600 font-semibold -mt-2"
            role="alert"
          >
            {validationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Live Preview Card */}
      <LivePreviewCard squadSize={squadSize} budget={budget} vibe={vibe} />

      {/* Primary CTA Submit Button */}
      <button
        type="submit"
        className="w-full h-14 bg-[#008751] text-white font-bold text-lg rounded-[12px] flex items-center justify-center cursor-pointer shadow-sm hover:brightness-90 active:scale-[0.98] active:shadow-md transition-all duration-150 outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#008751] focus-visible:outline-offset-2"
        aria-label="Generate outing plan based on constraints"
      >
        Generate Plan
      </button>
    </form>
  );
}

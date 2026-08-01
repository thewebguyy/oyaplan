"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";

import { LocationService, Location, UserLocation } from "@/lib/services/LocationService";
import { useTransportCost } from "@/hooks/useTransportCost";
import { OriginStore } from "@/lib/storage/OriginStore";
import { Origin } from "@/lib/location/types";
import { useOrigin } from "@/lib/location/OriginContext";

import { Spot } from "@/lib/types";

import { Loader2 } from "lucide-react";

interface PlannerWidgetProps {
  squadSize: number;
  setSquadSize: (val: number) => void;
  budget: number;
  setBudget: (val: number) => void;
  vibe: string | null;
  setVibe: (val: string | null) => void;
  recommendedSpots: Spot[];
  prefilledLocation?: string;
  selectedArea?: Location | null;
  setSelectedArea?: (area: Location | null) => void;
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
  recommendedSpots,
  prefilledLocation,
  selectedArea: controlledArea,
  setSelectedArea: setControlledArea,
}: PlannerWidgetProps) {
  const router = useRouter();
  const [showMoreVibes, setShowMoreVibes] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // NEW LOCATION STATE & PREFERENCES
  const [internalArea, setInternalArea] = useState<Location | null>(() => {
    if (prefilledLocation) {
      return (
        LocationService.getVerifiedAreas().find(
          (a) => a.id === prefilledLocation || a.name.toLowerCase() === prefilledLocation.toLowerCase()
        ) || null
      );
    }
    return null;
  });

  const selectedArea = controlledArea !== undefined ? controlledArea : internalArea;
  const { origin, status, requestCurrentLocation, setManualOrigin } = useOrigin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!prefilledLocation && origin) {
      const nearest = LocationService.getVerifiedAreas().find(a => a.id === origin.planningAreaSlug) || null;
      if (nearest) {
        setInternalArea(nearest);
        if (setControlledArea) {
          setControlledArea(nearest);
        }
      }
    }
  }, [prefilledLocation, origin, setControlledArea]);

  // Dynamic transport estimate using Location-Aware Hook
  useTransportCost({
    userLocation: origin ? {
      id: origin.planningAreaSlug,
      name: origin.resolvedName,
      coordinates: origin.gpsCoordinates || selectedArea?.coordinates || { lat: 6.4474, lng: 3.4723 },
      type: origin.source === "gps" ? "current" as const : "saved" as const
    } : (selectedArea ? {
      id: selectedArea.id,
      name: selectedArea.name,
      coordinates: selectedArea.coordinates,
      type: "saved",
    } : null),
    venueLocation: recommendedSpots?.[0]?.coordinates ? {
      lat: (recommendedSpots[0].coordinates as { lat: number; lng: number }).lat,
      lng: (recommendedSpots[0].coordinates as { lat: number; lng: number }).lng,
    } : undefined,
    squadSize,
    roundTrip: true,
  });

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
  const squadPct = ((squadSize - 1) / 7) * 100;
  const budgetPct = ((budget - 10000) / 90000) * 100;

  const handleUseCurrentLocation = async () => {
    setValidationError(null);
    try {
      await requestCurrentLocation();
    } catch {
      setValidationError("Could not access current location.");
    }
  };

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
    if (selectedArea) {
      params.append("area", selectedArea.id);
    }
    params.append("fresh", "true");

    // Track analytics using local service
    AnalyticsService.track("forge_started", {
      session_id: "00000000-0000-0000-0000-000000000000",
      properties: {
        category: "Activation",
        source: "redesigned_hero_planner",
        budget: Number(budget),
        squad_size: Number(squadSize),
        area: selectedArea?.id ?? "unselected",
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
      className="bg-white rounded-[16px] border border-[#E5E7EB] p-4 sm:p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)] w-full max-w-[500px] flex flex-col gap-6 sm:gap-8"
      noValidate
    >
      <fieldset className="flex flex-col gap-6 p-0 m-0 border-none">
        <legend className="sr-only">Configure your outing constraints</legend>

        {/* LOCATION SELECTOR LAYER */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="area-selection-input" className="text-sm font-semibold text-[#6B7280]">
              {status === "gps" && selectedArea 
                ? `📍 Near ${selectedArea.name}` 
                : `📍 Starting Location${mounted && selectedArea ? ` (${selectedArea.name})` : ""}`}
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={status === "locating"}
              className="text-xs font-bold text-[#008751] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              {status === "locating" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#008751]" />
                  <span>Locating...</span>
                </>
              ) : (
                "Use My Location"
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
            {LocationService.getVerifiedAreas().map((area) => {
              const isSelected = selectedArea?.id === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    setManualOrigin(area.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-[#008751] text-white shadow-xs"
                      : "bg-[#F3F4F6] text-[#1A1A1A] hover:bg-[#D1E7DB]"
                  }`}
                >
                  {isSelected && <span className="text-[10px]">✓</span>}
                  <span>{area.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* INPUT: Squad Size Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="squad-size-input" className="text-sm font-semibold text-[#6B7280]">
              Who&apos;s going?
            </label>
            <span className="text-base font-bold text-[#1A1A1A]">
              {squadSize === 1 ? "Just me" : squadSize === 8 ? "8+ people" : `${squadSize} people`}
            </span>
          </div>
          <input
            id="squad-size-input"
            type="range"
            min="1"
            max="8"
            step="1"
            value={squadSize}
            onChange={(e) => setSquadSize(Number(e.target.value))}
            className="premium-range-slider"
            style={{
              background: `linear-gradient(to right, #008751 ${squadPct}%, #F3F4F6 ${squadPct}%)`,
            }}
            aria-label={`Squad size: current value ${squadSize === 1 ? "Just me" : squadSize === 8 ? "8+ people" : `${squadSize} people`}. Choose between 1 (Just me) and 8+ people.`}
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
            className="premium-range-slider"
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

      {/* Primary CTA Submit Button */}
      <button
        type="submit"
        className="w-full h-14 bg-[#008751] text-white font-bold text-lg rounded-[12px] flex items-center justify-center cursor-pointer shadow-sm hover:brightness-90 active:scale-[0.98] active:shadow-md transition-all duration-150 outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#008751] focus-visible:outline-offset-2"
        aria-label="Submit criteria and view plan"
      >
        Start Planning
      </button>
    </form>
  );
}

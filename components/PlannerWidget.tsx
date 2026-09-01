"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics/trackClient";

import { LocationService, Location } from "@/lib/services/LocationService";
import { useTransportCost } from "@/hooks/useTransportCost";
import { useOrigin } from "@/lib/location/OriginContext";
import { triggerMoment } from "@/components/ui/moment-of-delight";
import OyaSquadSelector from "@/components/squad/OyaSquadSelector";

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
  setSelectedArea: _setControlledArea,
}: PlannerWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groupId, setGroupId] = useState<string | null>(() => searchParams.get("group"));
  const [showMoreVibes, setShowMoreVibes] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // NEW LOCATION STATE & PREFERENCES
  const [internalArea] = useState<Location | null>(() => {
    if (prefilledLocation) {
      return (
        LocationService.getVerifiedAreas().find(
          (a) => a.id === prefilledLocation || a.name.toLowerCase() === prefilledLocation.toLowerCase()
        ) || null
      );
    }
    return null;
  });

  const { origin, status, requestCurrentLocation, setManualOrigin, resetStatus } = useOrigin();

  const selectedArea = useMemo(() => {
    if (controlledArea !== undefined) return controlledArea;
    if (internalArea) return internalArea;
    if (!prefilledLocation && origin) {
      return LocationService.getVerifiedAreas().find((a) => a.id === origin.planningAreaSlug) || null;
    }
    return null;
  }, [controlledArea, internalArea, prefilledLocation, origin]);

  // Dynamic transport estimate using Location-Aware Hook
  useTransportCost({
    userLocation: origin ? {
      id: origin.planningAreaSlug,
      name: origin.displayArea.name,
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
    if (groupId) {
      params.append("group", groupId);
      trackEvent("group_plan_started", {
        category: "Planning",
        group_id: groupId,
        squad_size: Number(squadSize),
        is_repeat_plan: false,
        version: "1.0",
      });
    }
    params.append("fresh", "true");

    // Track analytics using non-blocking client tracker with real session cookie
    trackEvent("forge_started", {
      category: "Activation",
      source: "redesigned_hero_planner",
      budget: Number(budget),
      squad_size: Number(squadSize),
      area: selectedArea?.id ?? "unselected",
      version: "1.0",
    });

    triggerMoment("outing_planned");

    router.push(`/forge?${params.toString()}`);
  };

  const handleVibeClick = (value: string) => {
    setVibe(vibe === value ? null : value);
    setValidationError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden bg-white rounded-[16px] border border-[#E5E7EB] p-4 sm:p-6 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)] w-full max-w-[500px] flex flex-col gap-6 sm:gap-8"
      noValidate
    >
      <AnimatePresence>
        {status === "unsupported" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-white/98 backdrop-blur-xs rounded-[16px] z-20 flex flex-col items-center justify-center p-6 text-center gap-6"
          >
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <h3 className="text-lg font-black text-text-primary">
                We don&apos;t support your area yet
              </h3>
              <p className="text-xs text-text-muted max-w-[280px] leading-relaxed">
                OyaPlan currently operates in Lagos. Select an area manually to start planning.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <button
                type="button"
                onClick={resetStatus}
                className="w-full bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Choose an area
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <fieldset className="flex flex-col gap-6 p-0 m-0 border-none">
        <legend className="sr-only">Configure your outing constraints</legend>

        {/* LOCATION SELECTOR LAYER */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label htmlFor="area-selection-input" className="text-sm font-semibold text-[#6B7280] flex items-center gap-2 flex-wrap">
              <span>📍 Starting Location{selectedArea ? ` (${selectedArea.name})` : ""}</span>
              {(status === "permission-denied" || status === "unsupported" || status === "error") && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  Defaulted to Surulere (tap to change)
                </span>
              )}
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

          {/* Planning area transparency notice — only shown when display location differs from planning area */}
          {status === "gps" && origin && origin.displayArea.slug !== origin.planningAreaSlug && (
            <p className="text-xs text-text-muted mt-1">
              Planning in <span className="font-bold text-text-secondary">
                {LocationService.getVerifiedAreas().find((a) => a.id === origin.planningAreaSlug)?.name ?? origin.planningAreaSlug}
              </span>
            </p>
          )}
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
          <OyaSquadSelector
            selectedGroupId={groupId}
            onSelectSquad={(gId, count) => {
              setGroupId(gId);
              if (count > 0) setSquadSize(Math.min(8, count));
            }}
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

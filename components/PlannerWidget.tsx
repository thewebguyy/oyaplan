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
import { triggerHaptic } from "@/lib/ui/haptics";

import { 
  Loader2, 
  Heart, 
  Users, 
  PartyPopper, 
  Zap, 
  Utensils, 
  Sun, 
  User, 
  MapPin, 
  AlertTriangle, 
  Check 
} from "lucide-react";

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
  { value: "Dinner", label: "Date Night", icon: Heart },
  { value: "Chill", label: "Squad Linkup", icon: Users },
  { value: "Party", label: "Birthday Turn Up", icon: PartyPopper },
  { value: "Quick", label: "Quick Bites", icon: Zap },
];

const EXTENDED_VIBES = [
  { value: "Foodie", label: "Serious Chop", icon: Utensils },
  { value: "Brunch", label: "Brunch Vibe", icon: Sun },
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
    if (controlledArea !== undefined && controlledArea !== null) return controlledArea;
    if (internalArea) return internalArea;
    if (!prefilledLocation && origin) {
      return LocationService.getVerifiedAreas().find((a) => a.id === origin.planningAreaSlug) || null;
    }
    return LocationService.getVerifiedAreas()[0] || null;
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
    triggerHaptic("selection");
    setVibe(vibe === value ? null : value);
    setValidationError(null);
  };

  const currentVibeLabel = useMemo(() => {
    if (!vibe) return "a date night";
    const found = [...PRIMARY_VIBES, ...EXTENDED_VIBES].find((v) => v.value === vibe);
    return found ? found.label.toLowerCase() : vibe.toLowerCase();
  }, [vibe]);

  const currentSquadLabel = useMemo(() => {
    if (squadSize === 1) return "just me";
    if (squadSize === 2) return "2 people";
    return `${squadSize} people`;
  }, [squadSize]);

  const perPersonAmount = Math.round(budget / Math.max(1, squadSize));

  const getBudgetMicroCopy = (val: number): string => {
    if (val <= 15000) return "Tight search — hunting high-value lowkey spots";
    if (val <= 25000) return "Searching harder within this budget";
    if (val <= 45000) return "Balanced outing";
    if (val <= 75000) return "Comfortable Lagos outing";
    return "Wide open options";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden bg-white rounded-[20px] border border-[#E5E5DE] p-5 sm:p-7 md:p-8 shadow-[0_8px_30px_rgba(17,17,17,0.06)] w-full max-w-[520px] flex flex-col gap-6 sm:gap-7"
      noValidate
    >
      <AnimatePresence>
        {status === "unsupported" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-white/98 backdrop-blur-xs rounded-[20px] z-20 flex flex-col items-center justify-center p-6 text-center gap-6"
          >
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-[#111111]">
                We don&apos;t support your area yet
              </h3>
              <p className="text-xs text-[#555555] max-w-[280px] leading-relaxed">
                OyaPlan currently operates in Lagos. Select an area manually to start planning.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <button
                type="button"
                onClick={resetStatus}
                className="w-full bg-[#111111] hover:bg-black text-[#F9E828] text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
              >
                Choose an area
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Financial Target Bar */}
      <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-xl p-3.5 sm:p-4 text-left flex items-center justify-between font-mono">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
            Target per person
          </span>
          <span className="text-base sm:text-lg font-black text-[#111111] tabular-nums">
            ~₦{perPersonAmount.toLocaleString("en-NG")} / person
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
            Squad of {squadSize}
          </span>
          <span className="text-xs font-bold text-[#111111]">
            ₦{budget.toLocaleString("en-NG")} total
          </span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-6 p-0 m-0 border-none">
        <legend className="sr-only">Configure your outing constraints</legend>

        {/* LOCATION SELECTOR LAYER */}
        <div id="planner-section-area" className="flex flex-col gap-3 scroll-mt-24">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label htmlFor="area-selection-input" className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555] flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#111111]" />
              <span>Starting From{selectedArea ? `: ${selectedArea.name}` : ""}</span>
              {(status === "permission-denied" || status === "unsupported" || status === "error") && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  Defaulted to {selectedArea?.name || "Lagos"}
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={status === "locating"}
              className="text-xs font-bold text-[#111111] hover:underline cursor-pointer flex items-center gap-1.5 min-h-[36px]"
            >
              {status === "locating" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#111111]" />
                  <span>Locating...</span>
                </>
              ) : (
                "Use My GPS"
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
            {LocationService.getVerifiedAreas().map((area) => {
              const isSelected = selectedArea?.id === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setManualOrigin(area.id);
                    if (setControlledArea) {
                      setControlledArea(area);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[32px] ${
                    isSelected
                      ? "bg-[#111111] text-white shadow-xs"
                      : "bg-[#F6F6F2] text-[#111111] hover:bg-[#EAEAE2] border border-[#E5E5DE]"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3] text-[#F9E828]" />}
                  <span>{area.name}</span>
                </button>
              );
            })}
          </div>

          {status === "gps" && origin && origin.displayArea.slug !== origin.planningAreaSlug && (
            <p className="text-xs text-[#6B7280] mt-1 font-mono">
              Planning zone: <span className="font-bold text-[#111111]">
                {LocationService.getVerifiedAreas().find((a) => a.id === origin.planningAreaSlug)?.name ?? origin.planningAreaSlug}
              </span>
            </p>
          )}
        </div>

        {/* INPUT: Progressive Social Presets (Who's going?) */}
        <div id="planner-section-squad" className="flex flex-col gap-2.5 scroll-mt-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555]">
              Who&apos;s Going?
            </span>
            <span className="text-xs font-mono font-bold text-[#111111] bg-[#F6F6F2] border border-[#E5E5DE] px-2.5 py-0.5 rounded-full">
              {squadSize === 1
                ? "Solo"
                : squadSize === 2
                ? "Date / +1"
                : `${squadSize} people`}
            </span>
          </div>

          {/* Top Tier: Solo / Date / Squad */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setSquadSize(1);
                setGroupId(null);
              }}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border tap-feedback min-h-[68px] ${
                squadSize === 1 && !groupId
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-[#F6F6F2] hover:bg-[#EAEAE2] text-[#111111] border-[#E5E5DE]"
              }`}
            >
              <User className={`w-4 h-4 mb-1 ${squadSize === 1 && !groupId ? "text-[#F9E828]" : ""}`} />
              <span>Just Me</span>
              <span className="text-[10px] opacity-75 font-mono">1 person</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setSquadSize(2);
                setGroupId(null);
              }}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border tap-feedback min-h-[68px] ${
                squadSize === 2 && !groupId
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-[#F6F6F2] hover:bg-[#EAEAE2] text-[#111111] border-[#E5E5DE]"
              }`}
            >
              <Heart className={`w-4 h-4 mb-1 ${squadSize === 2 && !groupId ? "text-[#F9E828]" : ""}`} />
              <span>Date / +1</span>
              <span className="text-[10px] opacity-75 font-mono">2 people</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                if (squadSize < 3) setSquadSize(4);
              }}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border tap-feedback min-h-[68px] ${
                squadSize >= 3 || groupId
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-[#F6F6F2] hover:bg-[#EAEAE2] text-[#111111] border-[#E5E5DE]"
              }`}
            >
              <Users className={`w-4 h-4 mb-1 ${squadSize >= 3 || groupId ? "text-[#F9E828]" : ""}`} />
              <span>Squad</span>
              <span className="text-[10px] opacity-75 font-mono">3+ people</span>
            </button>
          </div>

          {/* Secondary Layer: Squad Details (only if squadSize >= 3 or groupId selected) */}
          {(squadSize >= 3 || groupId) && (
            <div className="p-3 bg-[#F6F6F2] rounded-xl border border-[#E5E5DE] space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#555555] uppercase tracking-wider">
                  Squad Headcount
                </span>
                <div className="flex gap-1.5">
                  {[3, 4, 6, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setSquadSize(size);
                        setGroupId(null);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer min-h-[32px] ${
                        squadSize === size && !groupId
                          ? "bg-[#111111] text-[#F9E828] shadow-xs"
                          : "bg-white text-[#111111] hover:bg-gray-100 border border-[#E5E5DE]"
                      }`}
                    >
                      {size === 8 ? "8+" : size}
                    </button>
                  ))}
                </div>
              </div>

              {/* OyaSquad Selector */}
              <OyaSquadSelector
                selectedGroupId={groupId}
                onSelectSquad={(gId, count) => {
                  setGroupId(gId);
                  if (count > 0) setSquadSize(Math.min(8, count));
                }}
              />
            </div>
          )}
        </div>

        {/* INPUT: Budget Slider */}
        <div id="planner-section-budget" className="flex flex-col gap-2.5 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label htmlFor="budget-input" className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555]">
                Squad Target Budget
              </label>
              <span className="text-[11px] text-[#111111] font-mono font-bold leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F9E828]" />
                <span>{getBudgetMicroCopy(budget)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F6F6F2] p-1 rounded-lg border border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.max(10000, budget - 5000);
                    setBudget(nextVal);
                    triggerHaptic("light");
                  }}
                  disabled={budget <= 10000}
                  className="w-7 h-7 flex items-center justify-center rounded-md font-mono text-xs font-bold text-[#111111] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer tap-feedback"
                  aria-label="Decrease budget by ₦5,000"
                >
                  -5k
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = Math.min(100000, budget + 5000);
                    setBudget(nextVal);
                    triggerHaptic("light");
                  }}
                  disabled={budget >= 100000}
                  className="w-7 h-7 flex items-center justify-center rounded-md font-mono text-xs font-bold text-[#111111] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer tap-feedback"
                  aria-label="Increase budget by ₦5,000"
                >
                  +5k
                </button>
              </div>
              <span className="text-lg font-black font-mono text-[#111111] tabular-nums">
                {budget === 100000 ? "₦100,000+" : formatCurrency(budget)}
              </span>
            </div>
          </div>
          <input
            id="budget-input"
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={budget}
            onChange={(e) => {
              const nextVal = Number(e.target.value);
              // Tactile resistance when moving into restricted budget territory
              if (nextVal < budget && nextVal <= 25000) {
                triggerHaptic("medium");
              } else {
                triggerHaptic("light");
              }
              setBudget(nextVal);
            }}
            className="premium-range-slider cursor-pointer"
            style={{
              background: `linear-gradient(to right, #111111 ${budgetPct}%, #E5E5DE ${budgetPct}%)`,
            }}
            aria-label={`Budget: current value ${formatCurrency(budget)}. Choose between ₦10,000 and ₦100,000+`}
          />
          {budget <= 20000 && (
            <p className="text-[11px] font-mono text-[#555555] bg-[#F6F6F2] p-2 rounded-lg border border-[#E5E5DE]">
              Searching harder within this budget — locking onto high-value spots that fit without bill shock.
            </p>
          )}
        </div>

        {/* INPUT: Vibe Selection Chips */}
        <div id="planner-section-vibe" className="flex flex-col gap-2.5 scroll-mt-24">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555]">Outing Vibe</span>
          <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Select outing vibe">
            {PRIMARY_VIBES.map((item) => {
              const isActive = vibe === item.value;
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleVibeClick(item.value)}
                  className={`flex items-center gap-2.5 px-3.5 h-12 rounded-xl font-bold text-xs text-left transition-all duration-150 cursor-pointer select-none outline-none min-h-[48px]
                    ${
                      isActive
                        ? "bg-[#111111] text-white border-2 border-[#111111] shadow-xs"
                        : "bg-[#F6F6F2] text-[#111111] border border-[#E5E5DE] hover:bg-[#EAEAE2]"
                    }
                    focus-visible:ring-2 focus-visible:ring-[#111111]/30`}
                  role="button"
                  aria-pressed={isActive}
                  aria-label={`${item.label} vibe selection`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F9E828]" : "text-[#111111]"}`} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Render Extended Vibes inline if More Vibes link toggled */}
            <AnimatePresence>
              {showMoreVibes &&
                EXTENDED_VIBES.map((item) => {
                  const isActive = vibe === item.value;
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      initial={{ opacity: 0, y: 8, filter: "blur(1.5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, filter: "blur(1.5px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                      onClick={() => handleVibeClick(item.value)}
                      className={`flex items-center gap-2.5 px-3.5 h-12 rounded-xl font-bold text-xs text-left transition-all duration-150 cursor-pointer select-none outline-none min-h-[48px]
                        ${
                          isActive
                            ? "bg-[#111111] text-white border-2 border-[#111111] shadow-xs"
                            : "bg-[#F6F6F2] text-[#111111] border border-[#E5E5DE] hover:bg-[#EAEAE2]"
                        }
                        focus-visible:ring-2 focus-visible:ring-[#111111]/30`}
                      role="button"
                      aria-pressed={isActive}
                      aria-label={`${item.label} vibe selection`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F9E828]" : "text-[#111111]"}`} aria-hidden="true" />
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
              className="text-xs font-bold text-[#111111] hover:underline cursor-pointer focus:outline-none rounded py-1 min-h-[36px] inline-flex items-center transition-all tap-feedback"
            >
              {showMoreVibes ? "← Less vibes" : "+ More vibes"}
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
            className="text-xs font-mono font-bold text-[#E54D2E] bg-red-50 p-2.5 rounded-lg border border-red-200 -mt-2"
            role="alert"
          >
            {validationError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Primary CTA Submit Button — Sticky-aware above mobile keyboard */}
      <button
        id="planner-submit-btn"
        type="submit"
        className="w-full h-14 bg-[#111111] hover:bg-black text-[#F9E828] font-black uppercase tracking-wider text-sm rounded-[14px] flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(17,17,17,0.15)] active:scale-[0.98] transition-all duration-150 outline-none focus-visible:ring-3 focus-visible:ring-[#F9E828] sticky bottom-3 z-10 sm:static sm:bottom-auto tap-feedback"
        aria-label="Submit criteria and view plan"
      >
        Run the Plan →
      </button>
    </form>
  );
}

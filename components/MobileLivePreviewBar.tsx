"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronUp, X, Check, ShieldCheck } from "lucide-react";
import { Spot } from "@/lib/types";
import RouteCard from "./dossier/RouteCard";
import { LocationService } from "@/lib/services/LocationService";
import { calculateTransportTime } from "@/lib/utils/calculateTransportTime";
import { TransportPricingProvider } from "@/lib/planning/transport";
import { trackEvent } from "@/lib/analytics/trackClient";
import { triggerMoment } from "@/components/ui/moment-of-delight";

const VIBE_TO_URL_MAP: Record<string, string> = {
  Dinner: "date-night",
  Chill: "chill",
  Foodie: "foodie",
  Party: "party",
  Quick: "quick-link",
  Brunch: "brunch",
  "date-night": "date-night",
  "chill": "chill",
  "foodie": "foodie",
  "party": "party",
  "quick-link": "quick-link",
  "brunch": "brunch",
};

interface MobileLivePreviewBarProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
  recommendedSpots: Spot[];
  startAreaId?: string | null;
}

export default function MobileLivePreviewBar({
  squadSize,
  budget,
  vibe,
  recommendedSpots,
  startAreaId,
}: MobileLivePreviewBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleGeneratePlan = (spot?: Spot) => {
    if (!vibe) return;

    const params = new URLSearchParams();
    const urlVibe = VIBE_TO_URL_MAP[vibe] || vibe.toLowerCase();

    params.append("vibe", urlVibe);
    params.append("squad", String(squadSize));
    params.append("budget", String(budget || 50000));
    if (startAreaId && startAreaId !== "anywhere") {
      params.append("area", startAreaId);
    }
    if (spot?.id) {
      params.append("pinned", spot.id);
    }
    params.append("fresh", "true");

    trackEvent("forge_started", {
      category: "Activation",
      source: "mobile_live_preview_bar",
      budget: Number(budget),
      squad_size: Number(squadSize),
      area: startAreaId ?? "unselected",
      version: "1.0",
    });

    triggerMoment("outing_planned");
    setIsOpen(false);
    router.push(`/forge?${params.toString()}`);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getSpotTransportCost = (spot: Spot) => {
    if (squadSize === 1) return 0;
    if (!startAreaId || startAreaId === "anywhere") {
      return squadSize > 4 ? 10000 : 5000;
    }
    const range = TransportPricingProvider.calculateRange(
      startAreaId,
      spot.address_slug || "ikeja",
      "ride-hailing",
      spot.transport_matrix || {}
    );
    return range.midpointCost;
  };

  if (!recommendedSpots || recommendedSpots.length === 0 || !vibe) return null;
  
  const topSpot = recommendedSpots[0];
  const spotsToUse = recommendedSpots.slice(0, 3);

  const transportCost = getSpotTransportCost(topSpot);
  const foodCost = (topSpot.price_per_person || 12000) * squadSize;
  const taxCost = Math.round(foodCost * 0.1);
  const totalCost = foodCost + transportCost + taxCost;
  const perPersonCost = Math.ceil(totalCost / squadSize);

  return (
    <>
      {/* Floating Sticky Mobile Pill Bar */}
      <div className="fixed bottom-[60px] left-3 right-3 z-40 md:hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#111827] text-white rounded-2xl p-3 shadow-2xl border border-white/10 flex items-center justify-between backdrop-blur-xl"
        >
          <div 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-3 min-w-0 cursor-pointer select-none active:opacity-80 transition-opacity flex-1 mr-2"
            title="Tap to review cost breakdown"
          >
            <div className="w-10 h-10 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
              ✨
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FCC630] uppercase tracking-wider">
                <span>{spotsToUse.length > 1 ? `Top ${spotsToUse.length} Matches` : "Top Match"}</span>
                <span>•</span>
                <span className="truncate">{vibe || "Outing"}</span>
                <ChevronUp className="w-3 h-3 text-white/50 shrink-0" />
              </div>
              <p className="text-sm font-bold text-white truncate leading-tight">
                {topSpot.name} {spotsToUse.length > 1 ? `& ${spotsToUse.length - 1} more` : ""}
              </p>
              <p className="text-[11px] text-white/70">
                <strong className="text-white font-bold">~₦{perPersonCost.toLocaleString()}</strong> / person
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGeneratePlan(topSpot);
            }}
            className="h-10 px-4 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            aria-label="Start planning and view full options"
          >
            <span>Start Planning</span>
          </button>
        </motion.div>
      </div>

      {/* Full Sheet Cost Breakdown Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] z-50 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Header handle indicator */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />

              {/* Sheet Title */}
              <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-black text-black uppercase tracking-wide">
                    Cost Estimator
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Calculated for squad of {squadSize}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render each spot */}
              <div className="space-y-6 px-6 py-6">
                {spotsToUse.map((spot, idx) => {
                  const sTransportCost = getSpotTransportCost(spot);
                  const sFoodCost = (spot.price_per_person || 12000) * squadSize;
                  const sTaxCost = Math.round(sFoodCost * 0.1);
                  const sTotalCost = sFoodCost + sTransportCost + sTaxCost;
                  
                  return (
                    <div key={spot.id || idx} className="space-y-3 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                      {/* Spot Title Card */}
                      <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#008751]/10 text-[#008751]">
                            <ShieldCheck className="w-3 h-3" /> {idx === 0 ? "Top Match" : "Great Alternative"}
                          </span>
                          <span className="text-xs font-bold text-[#6B7280]">
                            Squad of {squadSize}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-[#1A1A1A]">
                          {spot.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                          {spot.address || spot.address_slug}
                        </p>
                      </div>

                      {/* Cost Line Item Breakdown */}
                      <div className="border border-[#E5E7EB] bg-[#FAFAF8]/40 p-4 rounded-2xl space-y-2.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">
                            Food & Drinks ({squadSize}x)
                          </span>
                          <span className="font-bold text-[#1A1A1A]">
                            ₦{sFoodCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium flex items-center gap-1">
                            Estimated Uber Transport
                          </span>
                          <span className="font-bold text-[#1A1A1A]">
                            ₦{sTransportCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">
                            Taxes & Service Charge
                          </span>
                          <span className="font-bold text-[#1A1A1A]">
                            ₦{sTaxCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 font-black text-base text-black">
                          <span className="uppercase tracking-wide">Total Estimated Cost</span>
                          <span className="text-[#008751]">₦{sTotalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Direct Explore CTA */}
                      <div className="px-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleGeneratePlan(spot)}
                            className="w-full h-10 bg-[#008751] hover:bg-[#006b41] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <span>Start Planning for {spot.name}</span>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      {/* Route Card — only when venue has coordinates and user has a start area */}
                      {spot.coordinates && startAreaId && (() => {
                        const startArea = LocationService.getVerifiedAreas().find((a) => a.id === startAreaId);
                        if (!startArea) return null;
                        const transport = calculateTransportTime(startAreaId, spot.coordinates);
                        const range = startAreaId === "anywhere" 
                          ? { minCost: squadSize > 4 ? 8000 : 4000, maxCost: squadSize > 4 ? 12000 : 6000, midpointCost: squadSize > 4 ? 10000 : 5000 }
                          : TransportPricingProvider.calculateRange(
                              startAreaId,
                              spot.address_slug || "ikeja",
                              "ride-hailing",
                              spot.transport_matrix || {}
                            );
                        const transportEstimate = {
                          low: range.minCost,
                          high: range.maxCost,
                          mode: "ride-hailing",
                          origin: startAreaId,
                          destination: spot.address_slug || "ikeja",
                          departure_assumption: "off-peak",
                          calculation_version: "2026-v1"
                        };
                        return (
                          <RouteCard
                            startAreaName={startArea.name}
                            startAreaSlug={startAreaId}
                            venueName={spot.name}
                            venueAddress={spot.address || ""}
                            venueCoords={spot.coordinates}
                            transportCost={range.midpointCost}
                            distanceKm={transport.distanceKm}
                            transportEstimate={transportEstimate}
                          />
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

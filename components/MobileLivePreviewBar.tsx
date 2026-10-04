"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronUp, X, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Spot } from "@/lib/types";
import RouteCard from "./dossier/RouteCard";
import { LocationService } from "@/lib/services/LocationService";
import { calculateTransportTime } from "@/lib/utils/calculateTransportTime";
import { TransportPricingProvider } from "@/lib/planning/transport";
import { trackEvent } from "@/lib/analytics/trackClient";
import { triggerMoment } from "@/components/ui/moment-of-delight";
import { CTA_LABELS } from "@/components/ui/ctaVocabulary";

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
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const submitBtn = document.getElementById("planner-submit-btn");
    if (!submitBtn) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSubmitVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(submitBtn);
    return () => observer.disconnect();
  }, []);

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

  const getSpotTransportCost = (spot: Spot) => {
    const origin = startAreaId || "anywhere";
    const dest = spot.address_slug || "ikeja";
    const range = TransportPricingProvider.calculateRange(
      origin,
      dest,
      "ride-hailing",
      spot.transport_matrix,
      undefined,
      squadSize
    );
    return range.midpointCost;
  };

  if (!recommendedSpots || recommendedSpots.length === 0 || !vibe) return null;
  // Hide sticky bar if user has scrolled down to the main submit button to avoid UI collisions
  if (isSubmitVisible && !isOpen) return null;
  
  const topSpot = recommendedSpots[0];
  const spotsToUse = recommendedSpots.slice(0, 3);

  const getSpotTransportEstimate = (spot: Spot) => {
    const origin = startAreaId || "anywhere";
    const dest = spot.address_slug || "ikeja";
    return TransportPricingProvider.calculateEstimate(
      origin,
      dest,
      squadSize,
      "ride-hailing",
      spot.transport_matrix
    );
  };

  const topEstimate = getSpotTransportEstimate(topSpot);
  const transportCost = topEstimate.status === "unavailable" ? 0 : topEstimate.midpointCost;
  const foodCost = Math.round(((topSpot.price_per_person || 12000) * squadSize) / 100) * 100;
  const totalCost = foodCost + transportCost;
  const perPersonCost = Math.ceil(totalCost / squadSize);
  const displayCostStr = topEstimate.status === "unavailable" 
    ? `~₦${perPersonCost.toLocaleString()} + transport`
    : `~₦${perPersonCost.toLocaleString()}`;

  // Hide sticky bar if user has scrolled down to the main submit button to avoid UI collisions
  if (isSubmitVisible && !isOpen) return null;

  return (
    <>
      {/* Floating Sticky Mobile Pill Bar */}
      <div className="fixed bottom-[60px] left-3 right-3 z-40 md:hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="bg-[#111111] text-white rounded-2xl p-3 shadow-2xl border border-white/10 flex items-center justify-between backdrop-blur-xl"
        >
          <div 
            onClick={() => setIsOpen(true)} 
            className="flex items-center gap-3 min-w-0 cursor-pointer select-none active:opacity-80 transition-opacity flex-1 mr-2"
            title="Tap to review cost breakdown"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/20 text-[#F9E828] flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#F9E828] uppercase tracking-wider">
                <span>{spotsToUse.length > 1 ? `Top ${spotsToUse.length} Matches` : "Top Match"}</span>
                <span>•</span>
                <span className="truncate">{vibe || "Outing"}</span>
                <ChevronUp className="w-3 h-3 text-white/50 shrink-0" />
              </div>
              <p className="text-sm font-black text-white truncate leading-tight font-display uppercase tracking-tight">
                {topSpot.name} {spotsToUse.length > 1 ? `& ${spotsToUse.length - 1} more` : ""}
              </p>
              <p className="text-[11px] text-white/80 font-mono">
                <strong className="text-[#F9E828] font-bold">{displayCostStr}</strong> / person
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGeneratePlan(topSpot);
            }}
            className="h-10 px-4 bg-[#F9E828] hover:bg-[#F9E828]/90 text-[#111111] font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            aria-label="Start planning and view full options"
          >
            <span>Lock In</span>
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
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[28px] z-50 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col font-sans"
            >
              {/* Header handle indicator */}
              <div className="w-12 h-1 bg-[#111111]/20 rounded-full mx-auto my-3 shrink-0" />

              {/* Sheet Title */}
              <div className="px-6 pb-4 border-b border-[#E5E5DE] flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-black text-[#111111] uppercase tracking-wider font-mono">
                    Damage Slip Estimator
                  </h3>
                  <p className="text-xs text-[#6B7280] font-mono">
                    Squad of {squadSize} • Lagos Landed Cost
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F6F6F2] border border-[#E5E5DE] flex items-center justify-center text-[#555555] hover:text-[#111111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Render each spot */}
              <div className="space-y-6 px-6 py-6">
                {spotsToUse.map((spot, idx) => {
                  const sEstimate = getSpotTransportEstimate(spot);
                  const isUnavailable = sEstimate.status === "unavailable";
                  const sTransportCost = isUnavailable ? 0 : sEstimate.midpointCost;
                  const sFoodCost = Math.round(((spot.price_per_person || 12000) * squadSize) / 100) * 100;
                  const sTotalCost = sFoodCost + sTransportCost;
                  const sPerPerson = Math.round(sTotalCost / Math.max(1, squadSize));
                  
                  return (
                    <div key={spot.id || idx} className="space-y-3 pb-6 border-b border-[#E5E5DE] last:border-b-0 last:pb-0">
                      {/* Spot Title Card */}
                      <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-xl p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          {budget && sTotalCost > budget ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E54D2E] text-white">
                              THE STRETCH OPTION
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111] text-[#F9E828]">
                              <ShieldCheck className="w-3 h-3" /> {idx === 0 ? "Top Match" : "Great Alternative"}
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-[#6B7280]">
                            Squad of {squadSize}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight">
                          {spot.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-[#111111]" />
                          {spot.address || spot.address_slug}
                        </p>
                      </div>

                      {/* Cost Line Item Breakdown */}
                      <div className="border border-[#E5E5DE] bg-white p-4 rounded-xl space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center py-1 border-b border-dashed border-[#111111]/15">
                          <span className="text-[#555555]">
                            Food &amp; Dining ({squadSize}x)
                          </span>
                          <span className="font-bold text-[#111111]">
                            ₦{sFoodCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-dashed border-[#111111]/15">
                          <span className="text-[#555555] flex items-center gap-1">
                            Round-Trip Transport
                          </span>
                          <span className={`font-bold ${isUnavailable ? "text-amber-600" : "text-[#111111]"}`}>
                            {isUnavailable ? "Unavailable" : `₦${sTransportCost.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#111111]/25 font-black text-sm text-[#111111]">
                          <span className="uppercase tracking-wider">Landed Damage</span>
                          <span className="text-[#111111] text-base">
                            {isUnavailable ? `₦${sTotalCost.toLocaleString()} + transport` : `₦${sTotalCost.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-[#6B7280] pt-0.5">
                          <span>Per person:</span>
                          <span className="font-bold text-[#111111]">₦{sPerPerson.toLocaleString()} each</span>
                        </div>
                        {budget && sTotalCost > budget && (() => {
                          const diffOver = sTotalCost - budget;
                          const kOver = diffOver >= 1000 ? `${(diffOver / 1000).toFixed(diffOver % 1000 === 0 ? 0 : 1)}k` : `${diffOver}`;
                          return (
                            <div className="text-[11px] font-mono font-bold text-[#E54D2E] pt-1">
                              Exceeds target by ₦{kOver} — the stretch option.
                            </div>
                          );
                        })()}
                      </div>

                      {/* Direct Explore CTA */}
                      <div className="pt-1">
                        <button
                          onClick={() => handleGeneratePlan(spot)}
                          className="w-full h-11 bg-[#111111] hover:bg-black text-[#F9E828] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <span>Lock In This Plan</span>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>

                      {/* Route Card — only when venue has coordinates and user has a start area */}
                      {spot.coordinates && startAreaId && (() => {
                        const startArea = LocationService.getVerifiedAreas().find((a) => a.id === startAreaId);
                        if (!startArea) return null;
                        const transport = calculateTransportTime(startAreaId, spot.coordinates);
                        const transportEstimate = TransportPricingProvider.calculateEstimate(
                          startAreaId,
                          spot.address_slug || "ikeja",
                          squadSize,
                          "ride-hailing",
                          spot.transport_matrix
                        );
                        return (
                          <RouteCard
                            startAreaName={startArea.name}
                            startAreaSlug={startAreaId}
                            venueName={spot.name}
                            venueAddress={spot.address || ""}
                            venueCoords={spot.coordinates}
                            transportCost={transportEstimate.midpointCost}
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

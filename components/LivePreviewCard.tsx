"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Spot } from "@/lib/types";
import { ExplainedPlan } from "@/lib/planning/types";
import { TransportPricingProvider } from "@/lib/planning/transport";
import { VenueImage } from "./ui/VenueImage";
import { trackEvent } from "@/lib/analytics/trackClient";

interface LivePreviewCardProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
  recommendedSpots: Spot[];
  topPlan?: ExplainedPlan | null;
  startAreaId?: string | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(1.5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

export const DEFAULT_FALLBACK_SPOT: Spot = {
  id: "fallback-grill",
  name: "Lekki Grill",
  address: "Lekki Phase 1",
  address_slug: "lekki-phase-1",
  area_id: "lekki",
  vibe_tags: ["Dinner", "Romantic", "Date"],
  price_per_person: 12000,
  transport_matrix: {},
  is_featured: true,
  active: true,
};

export default function LivePreviewCard({
  squadSize,
  budget,
  vibe,
  recommendedSpots,
  topPlan,
  startAreaId,
}: LivePreviewCardProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback if empty array
  const spotsToUse = recommendedSpots && recommendedSpots.length > 0 ? recommendedSpots : [DEFAULT_FALLBACK_SPOT];
  // Ensure index is within bounds
  const currentSpotIndex = activeIndex >= spotsToUse.length ? 0 : activeIndex;
  const spot = spotsToUse[currentSpotIndex];

  // Format numbers to standard Naira format
  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString("en-NG")}`;
  };

  // Canonical pricing calculations - single source of truth
  const isMatchingTopPlan = topPlan && topPlan.spot.id === spot.id;
  const foodCost = isMatchingTopPlan 
    ? topPlan.activityCost 
    : Math.round(((spot.price_per_person || 12000) * squadSize) / 100) * 100;

  const transportRange = TransportPricingProvider.calculateRange(
    startAreaId || "surulere",
    spot.address_slug || "ikeja",
    "ride-hailing",
    spot.transport_matrix,
    undefined,
    squadSize
  );

  const transportCost = isMatchingTopPlan ? topPlan.transportCost : transportRange.midpointCost;
  const totalCost = isMatchingTopPlan ? topPlan.totalCost : (foodCost + transportCost);
  const remainingBuffer = Math.max(0, budget - totalCost);
  const perPersonCost = Math.round(totalCost / squadSize);

  const handleLaunchForge = () => {
    const params = new URLSearchParams();
    params.set("vibe", vibe?.toLowerCase() || "chill");
    params.set("squad", String(squadSize));
    params.set("budget", String(budget || 50000));
    if (startAreaId && startAreaId !== "anywhere") {
      params.set("area", startAreaId);
    }
    if (spot?.id) {
      params.set("pinned", spot.id);
    }
    params.set("fresh", "true");

    trackEvent("forge_started", {
      category: "Activation",
      source: "live_preview_card",
      budget: Number(budget),
      squad_size: Number(squadSize),
      area: startAreaId ?? "unselected",
      version: "1.0",
    });

    router.push(`/forge?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-[24px] border-2 border-[#111827] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06),0_4px_0_0_#111827] text-left font-sans text-xs text-[#111827] space-y-0">
      
      {/* Visual Appetizing Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <VenueImage
          src={spot.image_url || spot.cover_url}
          alt={spot.name}
          fallbackCategory={spot.category}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-black uppercase tracking-wider">
          <span className="bg-[#FCC630] text-[#111827] px-2.5 py-1 rounded-full shadow-xs">
            ★ Top Match
          </span>
          <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
            {vibe || "Date Night"}
          </span>
        </div>

        {/* Bottom Image Metadata */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black leading-tight truncate font-sans drop-shadow-sm">
            {spot.name}
          </h3>
          <p className="text-[11px] text-white/80 font-medium">
            📍 {spot.address || spot.address_slug || "Lagos"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Carousel Pagination */}
        {spotsToUse.length > 1 && (
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
            <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">
              Option {currentSpotIndex + 1} of {spotsToUse.length}
            </span>
            <div className="flex gap-1.5">
              {spotsToUse.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSpotIndex ? "bg-[#008751] w-5" : "bg-gray-200 w-2 hover:bg-gray-300"
                  }`}
                  aria-label={`View match ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tactile Mini Receipt Breakdown */}
        <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-xl p-3.5 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#6B7280] font-sans font-bold border-b border-dashed border-gray-200 pb-1.5">
            <span>Verified Live Estimate</span>
            <span className="text-[#008751] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Real Prices
            </span>
          </div>

          <div className="flex justify-between font-sans text-xs">
            <span className="text-[#4B5563]">Dining ({squadSize}x):</span>
            <span className="font-bold text-[#111827] font-mono">{formatCurrency(foodCost)}</span>
          </div>
          <div className="flex justify-between font-sans text-xs">
            <span className="text-[#4B5563]">Round-Trip Rides:</span>
            <span className="font-bold text-[#111827] font-mono">{formatCurrency(transportCost)}</span>
          </div>

          <div className="flex justify-between border-t border-[#111827]/15 pt-2 font-sans font-black text-sm text-[#111827]">
            <span>Total Expected:</span>
            <span className="text-[#008751] font-mono">{formatCurrency(totalCost)}</span>
          </div>

          <div className="flex justify-between text-[11px] text-[#6B7280] font-sans font-medium pt-0.5">
            <span>Per person ({squadSize} {squadSize === 1 ? "person" : "pax"}):</span>
            <span className="font-bold text-[#111827] font-mono">{formatCurrency(perPersonCost)} / each</span>
          </div>
        </div>

        {/* Quick Reassurance Pill */}
        <div className="text-[11px] text-[#4B5563] flex items-center gap-1.5 bg-[#008751]/8 border border-[#008751]/15 px-3 py-2 rounded-xl font-medium">
          <span className="text-[#008751] font-black">✓</span>
          <span>
            {totalCost <= budget 
              ? `Fits your ₦${budget.toLocaleString()} budget with ₦${remainingBuffer.toLocaleString()} buffer.`
              : `Slight stretch past budget. Consider ₦${Math.abs(budget - totalCost).toLocaleString()} flex.`
            }
          </span>
        </div>

        {/* 1-Click Interactive CTA Button */}
        <button
          onClick={handleLaunchForge}
          className="w-full bg-[#111827] hover:bg-black text-white font-black uppercase text-xs tracking-wider h-12 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer group"
        >
          <span>Lock In This Plan</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

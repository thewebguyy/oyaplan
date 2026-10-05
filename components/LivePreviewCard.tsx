"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, MapPin, Sparkles } from "lucide-react";
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

import { NumericCounter } from "@/components/ui/NumericCounter";

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
  const diff = budget - totalCost;
  const perPersonCost = Math.round(totalCost / Math.max(1, squadSize));

  const isVerified = spot.price_source === "owner_submitted" || Boolean(spot.price_updated_at);

  const renderDelightCopy = () => {
    if (diff === 0) {
      return (
        <span className="text-[#111111] font-bold">
          ₦{budget.toLocaleString("en-NG")} / ₦{budget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">Clean.</span>
        </span>
      );
    }
    if (diff > 0) {
      const kRemaining = diff >= 1000 ? `${(diff / 1000).toFixed(diff % 1000 === 0 ? 0 : 1)}k` : `${diff}`;
      if (diff <= 3000) {
        return (
          <span className="text-[#111111] font-bold">
            ₦{totalCost.toLocaleString("en-NG")} / ₦{budget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">₦{kRemaining} left for bad decisions.</span>
          </span>
        );
      }
      return (
        <span className="text-[#111111] font-bold">
          ₦{totalCost.toLocaleString("en-NG")} / ₦{budget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">₦{kRemaining} left.</span>
        </span>
      );
    }
    const kOver = Math.abs(diff) >= 1000 ? `${(Math.abs(diff) / 1000).toFixed(Math.abs(diff) % 1000 === 0 ? 0 : 1)}k` : `${Math.abs(diff)}`;
    return (
      <span className="text-[#E54D2E] font-bold">
        Exceeds target by ₦{kOver} — the stretch option.
      </span>
    );
  };

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
    <div className="bg-white rounded-[20px] border border-[#E5E5DE] overflow-hidden shadow-[0_8px_30px_rgba(17,17,17,0.08)] text-left font-sans text-xs text-[#111111] space-y-0">
      
      {/* Top Black Accent Edge */}
      <div className="h-1 bg-[#111111] w-full" />

      {/* Visual Appetizing Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <VenueImage
          src={spot.image_url || spot.cover_url}
          alt={spot.name}
          fallbackCategory={spot.category}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-mono font-bold uppercase tracking-wider">
          {diff < 0 ? (
            <span className="bg-[#E54D2E] text-white px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 font-mono font-bold tracking-wider">
              THE STRETCH OPTION
            </span>
          ) : (
            <span className="bg-[#111111] text-[#F9E828] px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 border border-white/10">
              <Sparkles className="w-3 h-3 text-[#F9E828]" /> Top Match
            </span>
          )}
          <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20">
            {vibe || "Date Night"}
          </span>
        </div>

        {/* Bottom Image Metadata */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black leading-tight truncate font-display uppercase tracking-tight">
            {spot.name}
          </h3>
          <p className="text-[11px] text-white/80 font-mono flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#F9E828] shrink-0" />
            <span className="truncate">{spot.address || spot.address_slug || "Lagos"}</span>
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Carousel Pagination */}
        {spotsToUse.length > 1 && (
          <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">
              Option {currentSpotIndex + 1} of {spotsToUse.length}
            </span>
            <div className="flex gap-1.5">
              {spotsToUse.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSpotIndex ? "bg-[#111111] w-5" : "bg-gray-200 w-2 hover:bg-gray-300"
                  }`}
                  aria-label={`View match ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live Outside Math Slip Paper Breakdown */}
        <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-xl p-3.5 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#6B7280] font-bold border-b border-dashed border-[#111111]/20 pb-1.5">
            <span>THE OUTSIDE MATH</span>
            <span className="text-[#111111] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#111111]" /> {isVerified ? "Verified Rates" : "Real Menu Data"}
            </span>
          </div>

          <div className="flex justify-between text-xs pt-0.5">
            <span className="text-[#555555]">Dining ({squadSize}x):</span>
            <span className="font-bold text-[#111111] font-mono">
              ₦<NumericCounter value={foodCost} />
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#555555]">Round-Trip Rides:</span>
            <span className="font-bold text-[#111111] font-mono">
              ₦<NumericCounter value={transportCost} />
            </span>
          </div>

          {/* Perforated Divider */}
          <div className="border-t border-dashed border-[#111111]/25 pt-2 flex justify-between items-baseline text-[#111111]">
            <span className="font-bold text-xs uppercase tracking-wider">Total Outing Cost:</span>
            <span className="font-black font-mono text-base text-[#111111]">
              ~₦<NumericCounter value={totalCost} />
            </span>
          </div>

          <div className="flex justify-between text-[11px] text-[#6B7280] font-mono pt-0.5">
            <span>Each ({squadSize} {squadSize === 1 ? "person" : "pax"}):</span>
            <span className="font-bold text-[#111111]">
              ₦{perPersonCost.toLocaleString("en-NG")} / person
            </span>
          </div>
        </div>

        {/* Delight Reassurance Pill */}
        <div className="text-[11px] font-mono flex items-center gap-1.5 bg-white border border-[#E5E5DE] px-3 py-2 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
          <span>{renderDelightCopy()}</span>
        </div>

        {/* 1-Click Interactive CTA Button */}
        <button
          onClick={handleLaunchForge}
          className="w-full bg-[#111111] hover:bg-black text-[#F9E828] font-black uppercase text-xs tracking-wider h-12 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer group"
        >
          <span>Run the Plan →</span>
        </button>
      </div>
    </div>
  );
}

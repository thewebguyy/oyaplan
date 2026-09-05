"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Spot } from "@/lib/types";
import { ExplainedPlan } from "@/lib/planning/types";
import { TransportPricingProvider } from "@/lib/planning/transport";

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
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback if empty array
  const spotsToUse = recommendedSpots && recommendedSpots.length > 0 ? recommendedSpots : [DEFAULT_FALLBACK_SPOT];
  // Ensure index is within bounds
  const currentSpotIndex = activeIndex >= spotsToUse.length ? 0 : activeIndex;
  const spot = spotsToUse[currentSpotIndex];

  // Format numbers to standard Naira format
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
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

  // Percentage of overall budget consumed by transport
  const transportRatio = budget > 0 ? (transportCost / budget) * 100 : 0;

  // Deterministic mathematical advice
  const getMathGuidance = () => {
    if (totalCost > budget) {
      return "⚠️ Budget exceeded. Try reducing squad size or increasing budget to fit venue prices.";
    }
    if (transportRatio > 30) {
      return `⚠️ Transport is consuming ${Math.round(transportRatio)}% of your budget. Consider reducing squad size.`;
    }
    if (remainingBuffer / budget >= 0.15) {
      return "✓ Great balance. You still have enough remaining buffer for extra orders.";
    }
    return "✓ Great balance. Most users choose this range.";
  };

  const getSavingsTip = () => {
    if (squadSize > 1 && totalCost <= budget) {
      const perPersonSavings = Math.round((spot.price_per_person || 12000));
      return `💡 Reducing squad size by one saves approximately ${formatCurrency(perPersonSavings)} in food costs.`;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#EAE8E3] p-5 text-left font-sans text-xs text-[#1A1A1A] space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <motion.div
        key={`${squadSize}-${budget}-${vibe}-${spot.id}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Recommended Venue Header & Navigation */}
        <div className="flex items-start justify-between">
          <motion.div variants={itemVariants} className="space-y-0.5 max-w-[75%]">
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold font-sans">
              Top Matches
            </div>
            <h2 className="text-base font-extrabold text-[#1A1A1A] leading-tight truncate">
              {spot.name}
            </h2>
            <div className="text-[11px] text-[#6B7280] font-semibold">
              📍 {spot.address || "Lekki, Lagos"} {vibe ? `• ${vibe}` : ""}
            </div>
          </motion.div>

          {spotsToUse.length > 1 && (
            <motion.div variants={itemVariants} className="flex gap-1">
              {spotsToUse.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSpotIndex ? "bg-[#008751] w-4" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`View recommendation ${idx + 1}`}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Why it Fits Explanations */}
        <motion.div variants={itemVariants} className="space-y-1.5 border-t border-b border-[#F3F4F6] py-3.5 font-sans">
          <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">
            Why this fits
          </div>
          <ul className="space-y-1.5 text-[#1A1A1A]">
            <li className="flex items-center gap-2">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Matches selected {vibe || "Date Night"} vibe</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Fits {formatCurrency(budget)} budget</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#008751] font-bold">✓</span>
              <span>{squadSize === 1 ? "Supports solo planner" : `Supports ${squadSize} people`}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Transport remains under {Math.round(transportRatio)}% of spend</span>
            </li>
          </ul>
        </motion.div>

        {/* Precise Cost Breakdown (Ledger style) */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="text-[10px] text-[#6B7280] font-bold font-sans uppercase tracking-wider">
            Cost Breakdown
          </div>
          <div className="space-y-1.5 text-xs text-[#1A1A1A] font-mono">
            <div className="flex justify-between">
              <span className="text-[#6B7280] font-sans">Food &amp; Dining:</span>
              <span className="font-semibold">{formatCurrency(foodCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] font-sans">Transport (Round-trip):</span>
              <span className="font-semibold">{formatCurrency(transportCost)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-[#EAE8E3] pt-1.5 mt-1 font-bold font-sans text-[13px]">
              <span>Total Expected Cost:</span>
              <span className="text-[#008751] font-mono">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-dashed border-[#F3F4F6] font-bold font-sans">
              <span>Remaining Buffer:</span>
              <span className="text-[#1A1A1A] bg-[#FCC630] px-2 py-0.5 rounded font-mono text-xs">
                {formatCurrency(remainingBuffer)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Deterministic Mathematical Guidance */}
        <motion.div
          variants={itemVariants}
          className="bg-[#FAF9F6] rounded-lg p-3 border border-[#EAE8E3] text-[11px] text-[#1A1A1A] space-y-1.5 font-sans"
        >
          <div className="font-bold leading-normal">{getMathGuidance()}</div>
          {getSavingsTip() && (
            <div className="text-[#6B7280] text-[10px] leading-relaxed pt-1.5 border-t border-dashed border-[#EAE8E3]">
              {getSavingsTip()}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

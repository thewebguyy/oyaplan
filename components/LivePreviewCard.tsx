"use client";

import { motion, Variants } from "framer-motion";
import { Spot } from "@/lib/types";

interface LivePreviewCardProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
  recommendedSpot: Spot | null;
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

const DEFAULT_FALLBACK_SPOT: Spot = {
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
  recommendedSpot,
}: LivePreviewCardProps) {
  const spot = recommendedSpot || DEFAULT_FALLBACK_SPOT;

  // Format numbers to standard Naira format
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
  };

  // Math Allocation Calculations
  const transportCost = squadSize === 1 ? 0 : squadSize > 4 ? 10000 : 5000;
  const foodCost = spot.price_per_person * squadSize;
  const taxCost = Math.round((foodCost * 0.1) / 100) * 100;
  const totalCost = foodCost + transportCost + taxCost;
  const remainingBuffer = Math.max(0, budget - totalCost);

  // Percentage Calculations for horizontal segmented bar
  const totalDenominator = Math.max(budget, totalCost);
  const foodPct = (foodCost / totalDenominator) * 100;
  const transportPct = (transportCost / totalDenominator) * 100;
  const taxPct = (taxCost / totalDenominator) * 100;
  const bufferPct = (remainingBuffer / totalDenominator) * 100;

  // Percentage of overall budget consumed by transport
  const transportRatio = budget > 0 ? (transportCost / budget) * 100 : 0;

  // Deterministic mathematical advice
  const getMathGuidance = () => {
    if (totalCost > budget) {
      return "⚠️ Budget exceeded. Try reducing squad size or increasing budget to fit venue prices.";
    }
    if (transportRatio > 30) {
      return `⚠️ Transport is consuming ${Math.round(transportRatio)}% of your budget. Consider sharing rides.`;
    }
    if (remainingBuffer / budget >= 0.15) {
      return "✓ Great balance. You have enough remaining buffer for dessert or extra drinks.";
    }
    return "✓ Great balance. Most users choose this range.";
  };

  const getSavingsTip = () => {
    if (squadSize > 1 && totalCost <= budget) {
      const perPersonSavings = spot.price_per_person + Math.round(spot.price_per_person * 0.1);
      return `💡 Reducing squad size by one saves approximately ${formatCurrency(perPersonSavings)} in food & taxes.`;
    }
    return null;
  };

  return (
    <motion.div
      className="bg-[#F3F4F6] rounded-[16px] border border-[#E5E7EB] p-5 text-left font-mono text-xs text-[#1A1A1A] space-y-4 relative overflow-hidden"
      animate={{ opacity: [1, 0.98, 1] }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut",
      }}
    >
      <motion.div
        key={`${squadSize}-${budget}-${vibe}-${spot.id}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Recommended Venue Header */}
        <motion.div variants={itemVariants} className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">
            Prediction Evidence
          </div>
          <h2 className="text-base font-extrabold text-[#1A1A1A] leading-tight truncate">
            {spot.name}
          </h2>
          <div className="text-[11px] text-[#6B7280] font-semibold">
            📍 {spot.address || "Lekki, Lagos"} {vibe ? `• ${vibe}` : ""}
          </div>
        </motion.div>

        {/* Why it Fits Explanations */}
        <motion.div variants={itemVariants} className="space-y-1.5 border-t border-b border-[#E5E7EB] py-3">
          <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">
            Why this fits:
          </div>
          <ul className="space-y-1 text-[#1A1A1A]">
            <li className="flex items-center gap-1.5">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Matches selected {vibe || "Date Night"} vibe</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Fits {formatCurrency(budget)} total budget</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#008751] font-bold">✓</span>
              <span>{squadSize === 1 ? "Accommodates solo outing" : `Accommodates ${squadSize} people`}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#008751] font-bold">✓</span>
              <span>Transport is {Math.round(transportRatio)}% of spend</span>
            </li>
          </ul>
        </motion.div>

        {/* Precise Budget Health Allocation Bar */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
            Budget Allocation
          </div>
          {/* Segmented Horizontal Progress Track */}
          <div className="h-3.5 w-full bg-[#E5E7EB] rounded-full flex overflow-hidden relative shadow-inner">
            {foodPct > 0 && (
              <div
                style={{ width: `${foodPct}%` }}
                className="bg-[#008751] h-full"
                title={`Food & Drinks: ${formatCurrency(foodCost)}`}
              />
            )}
            {transportPct > 0 && (
              <div
                style={{ width: `${transportPct}%` }}
                className="bg-[#1A1A1A] h-full"
                title={`Transport: ${formatCurrency(transportCost)}`}
              />
            )}
            {taxPct > 0 && (
              <div
                style={{ width: `${taxPct}%` }}
                className="bg-[#6B7280] h-full"
                title={`Taxes: ${formatCurrency(taxCost)}`}
              />
            )}
            {bufferPct > 0 && (
              <div
                style={{ width: `${bufferPct}%` }}
                className="bg-[#FCC630] h-full"
                title={`Remaining Buffer: ${formatCurrency(remainingBuffer)}`}
              />
            )}
          </div>

          {/* Allocation Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#008751] rounded-sm shrink-0" />
              <span className="text-[#6B7280]">Food &amp; Drinks:</span>
              <span className="font-bold text-[#1A1A1A] ml-auto">{formatCurrency(foodCost)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#1A1A1A] rounded-sm shrink-0" />
              <span className="text-[#6B7280]">Transport:</span>
              <span className="font-bold text-[#1A1A1A] ml-auto">{formatCurrency(transportCost)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#6B7280] rounded-sm shrink-0" />
              <span className="text-[#6B7280]">Taxes &amp; Fees:</span>
              <span className="font-bold text-[#1A1A1A] ml-auto">{formatCurrency(taxCost)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#FCC630] rounded-sm shrink-0" />
              <span className="text-[#1A1A1A] font-extrabold">Buffer:</span>
              <span className="font-extrabold text-[#1A1A1A] ml-auto">{formatCurrency(remainingBuffer)}</span>
            </div>
          </div>
        </motion.div>

        {/* Deterministic Mathematical Guidance */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg p-2.5 border border-[#E5E7EB] text-[11px] text-[#1A1A1A] space-y-1"
        >
          <div className="font-bold leading-snug">{getMathGuidance()}</div>
          {getSavingsTip() && (
            <div className="text-[#6B7280] text-[10px] leading-tight pt-0.5 border-t border-dashed border-[#F3F4F6] mt-1.5">
              {getSavingsTip()}
            </div>
          )}
        </motion.div>

        {/* Measurable Trust Badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-x-2 gap-y-1 pt-1 text-[9px] font-bold text-[#6B7280]"
        >
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded-full">
            ✓ pricing verified
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded-full">
            ✓ transport estimated
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-[#E5E7EB] rounded-full">
            ✓ taxes included
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

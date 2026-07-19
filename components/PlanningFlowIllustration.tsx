"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Spot } from "@/lib/types";

interface PlanningFlowIllustrationProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
  recommendedSpot: Spot | null;
}

const VenueIllustration = ({
  vibe,
  budget,
  squadSize,
}: {
  vibe: string | null;
  budget: number;
  squadSize: number;
}) => {
  const isPremium = budget >= 70000;
  const strokeColor = "#1A1A1A";

  // Intimate Restaurant (Date Night)
  if (vibe === "Dinner") {
    return (
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="opacity-80 shrink-0">
        <line x1="12" y1="24" x2="36" y2="24" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="16" y2="32" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="32" y1="24" x2="32" y2="32" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="24" y1="16" x2="24" y2="24" stroke="#008751" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 11 C25 12, 23 13, 24 15" stroke="#FCC630" strokeWidth="1" />
        <path d="M8 20 H11 V28" stroke={strokeColor} strokeWidth="1.2" />
        {squadSize > 1 && (
          <path d="M40 20 H37 V28" stroke={strokeColor} strokeWidth="1.2" />
        )}
      </svg>
    );
  }

  // Celebration Scene (Birthday)
  if (vibe === "Party") {
    return (
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="opacity-80 shrink-0">
        <rect x="16" y="20" width="16" height="10" rx="1.5" fill="#F3F4F6" stroke={strokeColor} strokeWidth="1.2" />
        <line x1="24" y1="15" x2="24" y2="20" stroke="#FCC630" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="12" r="4" stroke="#008751" strokeWidth="1.2" fill="#FFFFFF" />
        <path d="M10 16 Q12 20, 10 24" stroke="#6B7280" strokeWidth="0.8" />
        <circle cx="38" cy="10" r="5" stroke="#FCC630" strokeWidth="1.2" fill="#FFFFFF" />
        <path d="M38 15 Q36 19, 38 23" stroke="#6B7280" strokeWidth="0.8" />
      </svg>
    );
  }

  // Café / Quick Bites (Quick)
  if (vibe === "Quick") {
    return (
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="opacity-80 shrink-0">
        <path d="M8 8 L40 8 L36 14 L12 14 Z" fill="#F3F4F6" stroke={strokeColor} strokeWidth="1.2" />
        <line x1="12" y1="14" x2="12" y2="28" stroke={strokeColor} strokeWidth="1.2" />
        <line x1="36" y1="14" x2="36" y2="28" stroke={strokeColor} strokeWidth="1.2" />
        <rect x="20" y="22" width="8" height="6" rx="1" fill="#FFFFFF" stroke="#008751" strokeWidth="1.2" />
        <path d="M28 24 C29.5 24, 29.5 26, 28 26" stroke="#008751" strokeWidth="1.2" />
      </svg>
    );
  }

  // Lounge Stools / Squad Linkup (Chill)
  if (vibe === "Chill") {
    return (
      <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="opacity-80 shrink-0">
        <line x1="4" y1="12" x2="44" y2="12" stroke={strokeColor} strokeWidth="1.5" />
        <circle cx="16" cy="18" r="3.5" fill="#FFFFFF" stroke="#008751" strokeWidth="1.2" />
        <line x1="16" y1="21.5" x2="16" y2="30" stroke={strokeColor} strokeWidth="1.2" />
        <line x1="13" y1="30" x2="19" y2="30" stroke={strokeColor} strokeWidth="1.2" />

        <circle cx="32" cy="18" r="3.5" fill="#FFFFFF" stroke="#008751" strokeWidth="1.2" />
        <line x1="32" y1="21.5" x2="32" y2="30" stroke={strokeColor} strokeWidth="1.2" />
        <line x1="29" y1="30" x2="35" y2="30" stroke={strokeColor} strokeWidth="1.2" />
      </svg>
    );
  }

  // Large Venue Facade (Default/High Budget)
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="opacity-80 shrink-0">
      <rect x="8" y="8" width="32" height="24" rx="1.5" fill="#F3F4F6" stroke={strokeColor} strokeWidth="1.2" />
      <rect x="20" y="20" width="8" height="12" fill="#FFFFFF" stroke="#008751" strokeWidth="1.2" />
      {isPremium ? (
        <>
          <line x1="8" y1="16" x2="40" y2="16" stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="15" cy="12" r="2" stroke={strokeColor} strokeWidth="1" />
          <circle cx="33" cy="12" r="2" stroke={strokeColor} strokeWidth="1" />
        </>
      ) : (
        <circle cx="24" cy="14" r="2.5" stroke={strokeColor} strokeWidth="1" />
      )}
    </svg>
  );
};

export default function PlanningFlowIllustration({
  squadSize,
  budget,
  vibe,
  recommendedSpot,
}: PlanningFlowIllustrationProps) {
  // Format numbers to match standard Nigerian Naira currency layout
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
  };

  const spot = recommendedSpot;

  // Cost breakdown variables aligned directly with live preview calculations
  const transportCost = squadSize === 1 ? 0 : squadSize > 4 ? 10000 : 5000;
  const foodCost = spot ? spot.price_per_person * squadSize : 12000 * squadSize;
  const taxCost = Math.round((foodCost * 0.1) / 100) * 100;
  const totalCost = foodCost + transportCost + taxCost;

  // Percentage budget meter fill (₦10k to ₦100k)
  const budgetMin = 10000;
  const budgetMax = 100000;
  const fillPercentage = Math.min(
    Math.max(((budget - budgetMin) / (budgetMax - budgetMin)) * 100, 0),
    100
  );

  return (
    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-4 pb-4 scrollbar-none w-full -mx-4 px-4 md:mx-0 md:px-0">
      {/* PANEL 1: Your Squad */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px] shrink-0 w-[240px] md:w-full snap-start">
        {/* SVG Squad Illustration */}
        <div className="w-full flex justify-center items-center h-28 relative">
          <svg
            width="160"
            height="100"
            viewBox="0 0 160 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
            aria-label="Stylized squad members showing interactive group size"
          >
            {/* Figure 1 - Head & Body (Always Visible) */}
            <g className="transition-opacity duration-300">
              <circle cx="50" cy="40" r="10" stroke="#6B7280" strokeWidth="2" fill="#F3F4F6" />
              <path
                d="M35 75 C35 60, 65 60, 65 75 Z"
                stroke="#6B7280"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </g>

            {/* Figure 2 - Head & Body (Visible if 2+ people) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: squadSize >= 2 ? 1 : 0.05 }}
            >
              <circle cx="80" cy="35" r="11" stroke="#6B7280" strokeWidth="2" fill="#F3F4F6" />
              <path
                d="M62 75 C62 55, 98 55, 98 75 Z"
                stroke="#6B7280"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </g>

            {/* Figure 3 - Head & Body (Visible for 3+ people) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: squadSize >= 3 ? 1 : 0.15 }}
            >
              <circle cx="110" cy="42" r="9" stroke="#6B7280" strokeWidth="2" fill="#F3F4F6" />
              <path
                d="M96 75 C96 63, 124 63, 124 75 Z"
                stroke="#6B7280"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </g>

            {/* Figure 4 - Head & Body (Visible for 5+ people) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: squadSize >= 5 ? 1 : 0.05 }}
            >
              <circle cx="135" cy="48" r="8" stroke="#6B7280" strokeWidth="2" fill="#F3F4F6" />
              <path
                d="M122 75 C122 66, 148 66, 148 75 Z"
                stroke="#6B7280"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </g>

            {/* Figure 5 - Head & Body (Visible for 7+ people) */}
            <g
              className="transition-opacity duration-300"
              style={{ opacity: squadSize >= 7 ? 1 : 0.05 }}
            >
              <circle cx="25" cy="48" r="8" stroke="#6B7280" strokeWidth="2" fill="#F3F4F6" />
              <path
                d="M12 75 C12 66, 38 66, 38 75 Z"
                stroke="#6B7280"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </g>
          </svg>
        </div>
        <div className="text-center mt-3">
          <p className="font-semibold text-lg text-[#1A1A1A]">Who's going?</p>
          <span className="text-sm text-[#6B7280] font-mono mt-0.5 block">
            {squadSize === 1 ? "Just me" : squadSize === 8 ? "8+ people" : `${squadSize} people`}
          </span>
        </div>
      </div>

      {/* PANEL 2: The Budget */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px] shrink-0 w-[240px] md:w-full snap-start">
        {/* SVG/HTML Gauge Illustration */}
        <div className="w-full flex flex-col justify-center items-center h-28 px-4">
          <div className="w-full flex justify-between text-xs font-mono text-[#6B7280] mb-2">
            <span>₦10k</span>
            <span className="text-xs font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
              {formatCurrency(budget)}
            </span>
            <span>₦100k+</span>
          </div>
          {/* Gauge Track */}
          <div className="w-full h-4 bg-[#F3F4F6] rounded-full overflow-hidden relative border border-[#E5E7EB]">
            {/* Solid Brand Fill (Clean Editorial look) */}
            <div
              className="h-full bg-[#008751] transition-all duration-300 ease-out"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
          <span className="text-2xl mt-4 font-bold text-[#008751]">₦</span>
        </div>
        <div className="text-center mt-3">
          <p className="font-semibold text-lg text-[#1A1A1A]">What's your budget?</p>
          <span className="text-sm text-[#6B7280] font-mono mt-0.5 block">Total or per person</span>
        </div>
      </div>

      {/* PANEL 3: Verified Plan + Cost Breakdown */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px] shrink-0 w-[240px] md:w-full snap-start relative overflow-hidden">
        {/* Visual cost cards & venue */}
        <div className="w-full flex flex-col justify-center items-center h-28 relative">
          <AnimatePresence mode="wait">
            {!vibe ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs text-[#6B7280] font-sans px-4"
              >
                Select a vibe to view verified venue plans
              </motion.div>
            ) : (
              <motion.div
                key="cost-card-active"
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full max-w-[220px] bg-white border border-[#E5E7EB] rounded-[10px] p-3 shadow-sm font-mono text-[10px] text-[#1A1A1A] space-y-1"
              >
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[#6B7280]">🏢</span>
                    <span className="font-sans font-bold text-[#1A1A1A] text-[11px] truncate max-w-[110px]">
                      {spot ? spot.name : "Lekki Grill"}
                    </span>
                  </div>
                  {/* Verified badge animates in with blur, opacity and slight translate */}
                  <motion.span
                    initial={{ opacity: 0, y: 6, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="bg-[#10B981] text-white w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold text-[9px]"
                    aria-label="Verified spot"
                  >
                    ✓
                  </motion.span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Food &amp; Drinks:</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(foodCost)}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Transport:</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(transportCost)}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Tax &amp; Service:</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(taxCost)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-[#E5E7EB] pt-1.5 mt-1.5 font-bold text-[11px]">
                  <span>Total Cost:</span>
                  <span className="text-[#008751]">{formatCurrency(totalCost)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3 mt-3 w-full border-t border-[#F3F4F6] pt-3 px-1">
          <VenueIllustration vibe={vibe} budget={budget} squadSize={squadSize} />
          <div className="text-left">
            <p className="font-semibold text-[11px] text-[#1A1A1A]">Decision Evidence</p>
            <span className="text-[10px] text-[#6B7280] font-mono block leading-tight">Verified pricing logic</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PlanningFlowIllustrationProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
}

export default function PlanningFlowIllustration({
  squadSize,
  budget,
  vibe,
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

  // Calculations for Panel 3 Card
  const transportCost = squadSize > 4 ? 10000 : 5000;
  // Estimate food and drinks: 70% of the budget
  const rawFood = budget * 0.7;
  const foodCost = Math.round(rawFood / 1000) * 1000;
  // Estimate tax and service fee: 10% of the food cost
  const taxCost = Math.round((foodCost * 0.1) / 1000) * 1000;
  const totalCost = foodCost + transportCost + taxCost;

  // Decide Venue name based on vibe
  const getVenueName = () => {
    switch (vibe) {
      case "Dinner":
        return "Lekki Grill";
      case "Chill":
        return "Gbagada Lounge";
      case "Foodie":
        return "Ikeja Serious Chop";
      case "Party":
        return "Quilox Club & Bar";
      case "Quick":
        return "Yaba Quick Bites";
      case "Brunch":
        return "Victoria Island Garden";
      default:
        return "Lekki Grill";
    }
  };

  // Percentage budget meter fill (₦10k to ₦100k)
  const budgetMin = 10000;
  const budgetMax = 100000;
  const fillPercentage = Math.min(
    Math.max(((budget - budgetMin) / (budgetMax - budgetMin)) * 100, 0),
    100
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[280px] mx-auto md:max-w-none">
      {/* PANEL 1: Your Squad */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px]">
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

            {/* Figure 2 - Head & Body (Always Visible) */}
            <g className="transition-opacity duration-300">
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
          <p className="font-semibold text-lg text-[#1A1A1A]">How many of you?</p>
          <span className="text-sm text-[#6B7280] font-mono mt-0.5 block">2–8 people</span>
        </div>
      </div>

      {/* PANEL 2: The Budget */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px]">
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
            {/* Gradient Fill */}
            <div
              className="h-full bg-gradient-to-r from-[#D1E7DB] to-[#008751] transition-all duration-300 ease-out"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
          <span className="text-2xl mt-4 font-bold text-[#008751]">₦</span>
        </div>
        <div className="text-center mt-3">
          <p className="font-semibold text-lg text-[#1A1A1A]">What&apos;s your budget?</p>
          <span className="text-sm text-[#6B7280] font-mono mt-0.5 block">Total or per person</span>
        </div>
      </div>

      {/* PANEL 3: Verified Plan + Cost Breakdown */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0px_4px_16px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[220px] relative overflow-hidden">
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
                      {getVenueName()}
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
        <div className="text-center mt-3">
          <p className="font-semibold text-lg text-[#1A1A1A]">We show you exactly</p>
          <span className="text-sm text-[#6B7280] font-mono mt-0.5 block">what you&apos;ll spend</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

interface LivePreviewCardProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
}

export default function LivePreviewCard({ squadSize, budget, vibe }: LivePreviewCardProps) {
  // Format numbers to match standard Nigerian Naira currency layout
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
  };

  const perPerson = squadSize > 0 ? Math.round(budget / squadSize) : budget;
  
  // Transport estimation: ₦5,000 base per car. 
  // Up to 4 people can share 1 car, 5+ entourage requires 2 cars (₦10,000).
  const transportEstimate = squadSize > 4 ? 10000 : 5000;

  return (
    <motion.div
      className="bg-[#F3F4F6] rounded-[12px] border border-[#E5E7EB] p-5 text-left font-mono text-sm text-[#1A1A1A] space-y-3"
      animate={{ opacity: [1, 0.96, 1] }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-[#10B981] font-bold shrink-0" aria-hidden="true">✓</span>
        <span>
          <strong className="font-bold">{squadSize >= 8 ? "8+" : squadSize} people</strong>, {formatCurrency(budget)} total
        </span>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="text-[#10B981] font-bold shrink-0" aria-hidden="true">✓</span>
        <span>
          Estimated <strong className="font-bold">{formatCurrency(perPerson)}</strong> per person
        </span>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="text-[#10B981] font-bold shrink-0" aria-hidden="true">✓</span>
        <span>
          Transport: <strong className="font-bold">~{formatCurrency(transportEstimate)}</strong>
        </span>
      </div>

      {vibe && (
        <div className="pt-2 mt-2 border-t border-dashed border-[#E5E7EB] text-xs text-[#6B7280]">
          Active Vibe: <span className="font-bold text-[#1A1A1A]">{vibe}</span>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, ChevronUp, X, Check, ShieldCheck } from "lucide-react";
import { Spot } from "@/lib/types";
import Link from "next/link";

interface MobileLivePreviewBarProps {
  squadSize: number;
  budget: number;
  vibe: string | null;
  recommendedSpot: Spot | null;
}

export default function MobileLivePreviewBar({
  squadSize,
  budget,
  vibe,
  recommendedSpot,
}: MobileLivePreviewBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!recommendedSpot) return null;

  // Transport calculation: Solo -> ₦0; 2-4 -> ₦5k; 5+ -> ₦10k
  const transportCost = squadSize === 1 ? 0 : squadSize > 4 ? 10000 : 5000;
  const foodCost = (recommendedSpot.price_per_person || 12000) * squadSize;
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
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
              ✨
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FCC630] uppercase tracking-wider">
                <span>Top Match</span>
                <span>•</span>
                <span className="truncate">{vibe || "Outing"}</span>
              </div>
              <p className="text-sm font-bold text-white truncate leading-tight">
                {recommendedSpot.name}
              </p>
              <p className="text-[11px] text-white/70">
                <strong className="text-white font-bold">₦{perPersonCost.toLocaleString()}</strong> / person
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="h-10 px-4 bg-[#008751] hover:bg-[#006b41] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 shrink-0 tap-feedback cursor-pointer shadow-md"
          >
            <span>View Plan</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Expanded Mobile Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl z-10 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008751] animate-pulse" />
                  <h3 className="text-base font-black text-[#1A1A1A]">
                    Live Outing Breakdown
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spot Title Card */}
              <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#008751]/10 text-[#008751]">
                    <ShieldCheck className="w-3 h-3" /> 100% Verified Menu
                  </span>
                  <span className="text-xs font-bold text-[#6B7280]">
                    Squad of {squadSize}
                  </span>
                </div>
                <h4 className="text-xl font-black text-[#1A1A1A]">
                  {recommendedSpot.name}
                </h4>
                <p className="text-xs text-[#6B7280] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                  {recommendedSpot.address || recommendedSpot.address_slug}
                </p>
              </div>

              {/* Cost Line Item Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Food & Drinks ({squadSize}x)
                  </span>
                  <span className="font-bold text-[#1A1A1A]">
                    ₦{foodCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    Estimated Bolt Transport
                  </span>
                  <span className="font-bold text-[#1A1A1A]">
                    ₦{transportCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Taxes & Service Charge
                  </span>
                  <span className="font-bold text-[#1A1A1A]">
                    ₦{taxCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-[#1A1A1A] text-sm">
                    TOTAL SQUAD COST
                  </span>
                  <span className="text-lg font-black text-[#008751]">
                    ₦{totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={`/plan/${recommendedSpot.id}?squad=${squadSize}&budget=${budget}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full h-12 bg-[#008751] hover:bg-[#006b41] text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Explore Full Plan</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

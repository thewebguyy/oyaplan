"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, Car, Utensils, Receipt, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Spot } from "@/lib/types";
import { knownPerPerson, venueFoodTotal } from "@/lib/venue/venueSpend";
import { triggerHaptic } from "@/lib/ui/haptics";

interface DiscoveryReceiptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  spot: Spot | null;
  squadSize: number;
  budget: number | null;
  planUrl: string;
}

export function DiscoveryReceiptDrawer({
  isOpen,
  onClose,
  spot,
  squadSize,
  budget,
  planUrl,
}: DiscoveryReceiptDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!spot) return null;

  const pricePerPerson = knownPerPerson({ derived_typical_cost: spot.price_per_person }) || 15000;
  const foodTotal = venueFoodTotal(pricePerPerson, squadSize);

  // Standard Lagos transit assumption for round-trip Bolt/ride-hail (~₦4,500/car round trip)
  const carsNeeded = Math.ceil(squadSize / 4);
  const estimatedBolt = carsNeeded * 5000;

  // Lagos standard hospitality service charge (5%) + consumption VAT (7.5%)
  const taxesAndService = Math.round(foodTotal * 0.125);
  const landedTotal = foodTotal + estimatedBolt + taxesAndService;
  const landedPerPerson = Math.round(landedTotal / squadSize);

  const fitsBudget = budget ? landedTotal <= budget : true;
  const budgetDiff = budget ? Math.abs(budget - landedTotal) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[24px] shadow-[8px_8px_0px_#111111] border-t-2 sm:border-2 border-[#111111] p-6 sm:p-7 max-h-[90vh] overflow-y-auto text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-drawer-title"
          >
            {/* Grab Handle for Mobile */}
            <div className="w-12 h-1.5 bg-[#111111]/30 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b-2 border-[#111111]/15 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#010528] text-[#F9E828] border border-[#F9E828]/30 text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
                  <Receipt className="w-3 h-3 text-[#F9E828]" />
                  <span>THE OUTSIDE MATH • TILL SLIP</span>
                </div>
                <h3 id="receipt-drawer-title" className="text-xl sm:text-2xl font-black text-[#010528] font-display uppercase tracking-tight">
                  {spot.name}
                </h3>
                <p className="text-xs text-[#111111]/60 font-mono">
                  {spot.areas?.name || spot.address || "Lagos Outing"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  onClose();
                }}
                className="p-2 rounded-lg bg-[#FAF8F8] hover:bg-[#111111]/5 border border-[#111111]/20 text-[#111111] transition-all cursor-pointer tap-feedback"
                aria-label="Close sample receipt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="py-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#111111]/70">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Food &amp; Drinks ({squadSize} {squadSize === 1 ? "person" : "squad"})</span>
                </span>
                <span className="font-bold text-[#010528] tabular-nums">
                  ₦{foodTotal.toLocaleString("en-NG")}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#111111]/70">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Est. Bolt Round-Trip ({carsNeeded} {carsNeeded === 1 ? "car" : "cars"})</span>
                </span>
                <span className="font-bold text-[#010528] tabular-nums">
                  ~₦{estimatedBolt.toLocaleString("en-NG")}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#111111]/70">
                <span>Service &amp; Consumption Tax (12.5%)</span>
                <span className="font-bold text-[#010528] tabular-nums">
                  ₦{taxesAndService.toLocaleString("en-NG")}
                </span>
              </div>

              {/* Perforated Receipt Divider */}
              <div className="pt-3 border-t-2 border-dashed border-[#111111]/30 flex items-baseline justify-between font-bold">
                <div>
                  <span className="text-[#010528] text-base font-black uppercase tracking-wider block font-display">
                    Total Outing Cost
                  </span>
                  <span className="text-[11px] text-[#111111]/60 block font-mono">
                    ~₦{landedPerPerson.toLocaleString("en-NG")} each ({squadSize} people)
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#010528] font-mono tabular-nums">
                  ₦{landedTotal.toLocaleString("en-NG")}
                </span>
              </div>

              {/* Budget Comparison Callout */}
              {budget && (
                <div className={`p-3 rounded-xl border-2 text-xs font-mono font-bold mt-2 ${
                  fitsBudget 
                    ? "bg-[#008751]/10 border-[#008751]/30 text-[#008751]" 
                    : "bg-red-50 border-[#D72638]/30 text-[#D72638]"
                }`}>
                  {fitsBudget ? (
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#008751]" />
                      <span>Fits your ₦{budget.toLocaleString("en-NG")} budget with ₦{(budget - landedTotal).toLocaleString("en-NG")} to spare.</span>
                    </span>
                  ) : (
                    <span>Exceeds target by ₦{(budgetDiff / 1000).toFixed(0)}k — the stretch option.</span>
                  )}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t-2 border-[#111111]/15 flex items-center gap-3">
              <Link
                href={planUrl}
                className="w-full"
                onClick={() => {
                  triggerHaptic("selection");
                  onClose();
                }}
              >
                <button
                  type="button"
                  className="w-full h-13 bg-[#010528] hover:bg-[#008751] text-[#F9E828] hover:text-white border-2 border-[#010528] hover:border-[#008751] font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer tap-feedback"
                >
                  <span>Run the Plan →</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

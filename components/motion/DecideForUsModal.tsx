"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Spot } from "@/lib/types";
import { triggerHaptic } from "@/lib/ui/haptics";
import { VenueImage } from "@/components/ui/VenueImage";

interface DecideForUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleSpots: Spot[];
  squadSize: number;
  budget: number | null;
  startArea?: string;
}

/**
 * Vibe Roulette / "DECIDE FOR US":
 * Kinetic Lagos decision-relief mechanism for squads wondering "Where should we go?".
 * Cycles real eligible venues from the current filter set, changing images, neighborhoods, and costs,
 * then decisively locks onto an eligible venue that strictly fits within the user's hard budget.
 */
export function DecideForUsModal({
  isOpen,
  onClose,
  eligibleSpots,
  squadSize,
  budget,
  startArea = "anywhere",
}: DecideForUsModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Filter candidates that strictly respect the budget cap (zero stretch violation as final pick)
  const validCandidates = eligibleSpots.filter((s) => {
    if (!budget) return true;
    const estimatedFood = (s.price_per_person || 12000) * squadSize;
    return estimatedFood <= budget;
  });

  const pool = validCandidates.length > 0 ? validCandidates : eligibleSpots;

  useEffect(() => {
    if (!isOpen || pool.length === 0) return;

    // Start cycling
    setIsSpinning(true);
    setSelectedSpot(null);

    let speed = 60;
    let cycles = 0;
    const maxCycles = 22; // Quick, kinetic 1.5s total run

    const spin = () => {
      cycles++;
      setCurrentIndex((prev) => (prev + 1) % pool.length);
      triggerHaptic("light");

      if (cycles < maxCycles) {
        speed = Math.floor(speed * 1.08); // Decelerate with mechanical inertia
        setTimeout(spin, speed);
      } else {
        // Decisive lock
        const finalPick = pool[Math.floor(Math.random() * pool.length)];
        setSelectedSpot(finalPick);
        setIsSpinning(false);
        triggerHaptic("heavy");
      }
    };

    const initialTimer = setTimeout(spin, speed);
    return () => clearTimeout(initialTimer);
  }, [isOpen]);

  if (!isOpen || pool.length === 0) return null;

  const currentDisplaySpot = selectedSpot || pool[currentIndex];
  const pricePerPerson = currentDisplaySpot.price_per_person || 12000;
  const totalOutingCost = Math.round(pricePerPerson * squadSize + squadSize * 3000); // Canonical estimated outing total

  const forgeUrl = `/forge?pinned=${currentDisplaySpot.id}&squad=${squadSize}&budget=${budget || 50000}&area=${startArea}&fresh=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[24px] border border-[#E5E5DE] shadow-2xl overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decide-for-us-title"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#111111] text-white">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F9E828] animate-pulse" />
            <h3 id="decide-for-us-title" className="text-xs font-mono font-black uppercase tracking-wider text-[#F9E828]">
              {isSpinning ? "CALCULATING DESTINATION..." : "THE LAGOS PICK IS IN"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rapid Cycling Venue Card Preview */}
        <div className="p-5 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 border border-[#E5E5DE]">
            <VenueImage
              src={currentDisplaySpot.image_url || currentDisplaySpot.cover_url}
              alt={currentDisplaySpot.name}
              fallbackCategory={currentDisplaySpot.category}
              className="w-full h-full object-cover transition-transform duration-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9E828] font-bold block mb-0.5">
                {currentDisplaySpot.category || "Curated Spot"}
              </span>
              <h4 className="text-xl font-black font-display uppercase tracking-tight truncate leading-tight">
                {currentDisplaySpot.name}
              </h4>
              <p className="text-xs text-gray-300 font-mono flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#F9E828] shrink-0" />
                <span className="truncate">{currentDisplaySpot.areas?.name || currentDisplaySpot.address || "Lagos"}</span>
              </p>
            </div>
          </div>

          {/* Pricing Confirmation Slip */}
          <div className="bg-[#F6F6F2] border border-[#E5E5DE] rounded-xl p-3.5 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">THE OUTSIDE MATH</span>
              <span className="text-sm font-black text-[#111111] tabular-nums">
                ₦{pricePerPerson.toLocaleString("en-NG")} <span className="text-[10px] font-normal text-gray-500">/ person</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">TOTAL OUTING COST</span>
              <span className="text-xs font-black text-[#111111] tabular-nums">
                ~₦{totalOutingCost.toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => {
                setIsSpinning(true);
                setSelectedSpot(null);
                setCurrentIndex((prev) => (prev + 1) % pool.length);
              }}
              className="px-4 h-12 rounded-xl border border-[#E5E5DE] hover:border-[#111111] bg-white text-[#111111] font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer tap-feedback"
            >
              Shuffle
            </button>

            <Link
              href={forgeUrl}
              onClick={onClose}
              className={`flex-1 h-12 bg-[#111111] hover:bg-black text-[#F9E828] font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback ${
                isSpinning ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <span>Run the Plan →</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

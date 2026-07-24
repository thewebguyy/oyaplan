"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Settings2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Spot } from "@/lib/types";
import { switchPlanSpot } from "@/app/plan/[id]/actions";

interface PlanCTAsProps {
  planId: string;
  venueName: string;
  address: string;
  budget: number;
  squadSize: number;
  vibe: string;
  startArea: string;
  spots: Spot[];
  currentSpotId: string;
  foodCost: number;
  transportCost: number;
  totalCost: number;
}

export function PlanCTAs({
  planId,
  venueName,
  address,
  budget,
  squadSize,
  vibe,
  startArea,
  spots,
  currentSpotId,
  foodCost,
  transportCost,
  totalCost
}: PlanCTAsProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Compute taxes cost for display
  const taxesCost = Math.round((foodCost * 0.1) / 100) * 100;

  // Filter runner-up spots matching the same budget & vibe
  const runnerUps = spots
    .filter(spot => spot.id !== currentSpotId && spot.active)
    .map(spot => {
      const candidateFoodCost = spot.price_per_person * squadSize;
      const candidateTaxesCost = Math.round((candidateFoodCost * 0.1) / 100) * 100;
      const candidateTransportCost = transportCost; // Preserve transport mode
      const candidateTotalCost = candidateFoodCost + candidateTransportCost + candidateTaxesCost;
      const candidateBuffer = Math.max(0, budget - candidateTotalCost);
      const isUnderBudget = candidateTotalCost <= budget;

      return {
        spot,
        totalCost: candidateTotalCost,
        buffer: candidateBuffer,
        isUnderBudget
      };
    })
    .sort((a, b) => {
      // Prioritise spots that fit within the budget limits
      if (a.isUnderBudget && !b.isUnderBudget) return -1;
      if (!a.isUnderBudget && b.isUnderBudget) return 1;
      return Math.abs(a.totalCost - budget) - Math.abs(b.totalCost - budget);
    })
    .slice(0, 3);

  // Pre-formatted share URL and text copy
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/plan/${planId}` 
    : `https://oyaplan.vercel.app/plan/${planId}`;

  const cleanAddress = address ? address.split(",")[0] : startArea || "Lagos";

  const shareText = `Yo! 🎉

Planned our linkup at ${venueName} using OyaPlan.

📍 ${venueName} (${cleanAddress})
💰 Total est. cost: ₦${totalCost.toLocaleString()}
👥 ${squadSize} ${squadSize === 1 ? "person" : "people"}

Here's the full breakdown:
🍽️ Food & Drinks: ₦${foodCost.toLocaleString()}
🚗 Transport (Uber): ₦${transportCost.toLocaleString()}
💸 Taxes & Fees: ₦${taxesCost.toLocaleString()}

See the verified breakdown:
🔗 ${shareUrl}

Are you in? 👇`;

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Plan link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchSpot = async (newSpotId: string, newSpotPrice: number, newSpotName: string) => {
    setIsSwapping(true);
    try {
      const result = await switchPlanSpot(planId, newSpotId, newSpotPrice);
      if (result.success && result.id) {
        toast.success(`Switched spot to ${newSpotName}!`);
        setIsModifyOpen(false);
        router.push(`/plan/${result.id}`);
      } else {
        toast.error("Failed to update spot. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sticky Bottom Actions on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default/80 p-4 md:hidden flex gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex-1 bg-[#008751] hover:bg-[#007043] text-white font-black uppercase text-xs h-12 rounded-[12px] flex items-center justify-center gap-2 tap-feedback border-none outline-none"
        >
          <Share2 className="w-4 h-4" />
          Share Plan
        </button>
        <button
          onClick={() => setIsModifyOpen(!isModifyOpen)}
          className="flex-1 bg-white border-2 border-black text-black font-black uppercase text-xs h-12 rounded-[12px] flex items-center justify-center gap-2 tap-feedback"
        >
          <Settings2 className="w-4 h-4" />
          Quick Tweak
        </button>
      </div>

      {/* Desktop Buttons Layout */}
      <div className="hidden md:flex items-center gap-4 w-full max-w-lg mx-auto mt-8">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex-1 bg-[#008751] hover:bg-[#007043] text-white font-black uppercase tracking-wider text-xs h-14 rounded-[12px] flex items-center justify-center gap-2 shadow-[0_4px_0_0_#1A1A1A] border-2 border-black tap-feedback"
        >
          <Share2 className="w-4 h-4" />
          Share Now
        </button>
        <button
          onClick={() => setIsModifyOpen(!isModifyOpen)}
          className="flex-1 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-black uppercase tracking-wider text-xs h-14 rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#FAFAF8] shadow-[0_4px_0_0_#1A1A1A] tap-feedback"
        >
          <Settings2 className="w-4 h-4" />
          Quick Modify
        </button>
      </div>

      {/* Runner Up Options Accordion Panel */}
      <AnimatePresence>
        {isModifyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg mx-auto bg-white border-2 border-black rounded-[24px] p-5 sm:p-6 shadow-[0_6px_0_0_#1A1A1A] mt-6 space-y-4 overflow-hidden scroll-reveal is-visible"
          >
            <div className="space-y-1">
              <h4 className="font-black text-black text-sm uppercase tracking-tight">Want something else?</h4>
              <p className="text-xs text-[#6B7280]">Alternative verified options matching your budget &amp; vibe:</p>
            </div>

            <div className="space-y-3">
              {runnerUps.length > 0 ? (
                runnerUps.map(({ spot, totalCost: candidateTotalCost, buffer, isUnderBudget }) => (
                  <div
                    key={spot.id}
                    className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="font-bold text-xs uppercase text-black block truncate">
                        {spot.name}
                      </span>
                      <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold">
                        <span className="text-[#008751]">✓ {vibe} vibe</span>
                        <span className="text-[#6B7280]">₦{candidateTotalCost.toLocaleString()} est.</span>
                        <span className="text-[#FCC630]">₦{buffer.toLocaleString()} buffer</span>
                      </div>
                    </div>
                    
                    <button
                      disabled={isSwapping}
                      onClick={() => handleSwitchSpot(spot.id, spot.price_per_person, spot.name)}
                      className="bg-white border-2 border-black hover:bg-black hover:text-white transition-colors text-[10px] font-black uppercase px-3 py-2 rounded-lg shrink-0"
                    >
                      {isSwapping ? "..." : "🔄 Swap"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] italic">No other spots match this budget and vibe range.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setIsShareModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-white border-2 border-black rounded-[24px] p-6 shadow-[0_8px_0_0_#1A1A1A] relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6B7280] font-mono">Invite Outing</span>
                  <h3 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight">Share This Plan</h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-[#6B7280] hover:text-black font-black text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {/* WhatsApp Card Preview */}
              <div className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-4 text-xs font-mono text-[#1A1A1A] overflow-y-auto max-h-60 mb-6 space-y-2 select-text shadow-inner">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase font-sans tracking-widest block mb-2">Message Preview</span>
                <p className="whitespace-pre-wrap leading-relaxed">{shareText}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-[#008751] hover:bg-[#007043] text-white font-black uppercase text-xs h-12 rounded-[12px] flex items-center justify-center gap-2 shadow-[0_3px_0_0_#1A1A1A] border-2 border-black tap-feedback"
                >
                  Open in WhatsApp
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-black uppercase text-xs h-12 rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#FAFAF8] tap-feedback"
                >
                  {copied ? "Copied!" : "Copy Plan Link"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

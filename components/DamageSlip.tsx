"use client";

import React, { useState } from "react";
import { Plan, Spot } from "@/lib/types";
import { NumericCounter } from "@/components/ui/NumericCounter";
import { Check, ShieldCheck, Share2, Copy, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export interface DamageSlipProps {
  plan: Plan;
  squadSize: number;
  budget?: number;
  startAreaName?: string;
  shareUrl?: string;
  isCompact?: boolean;
  className?: string;
  onShareClick?: () => void;
}

export function DamageSlip({
  plan,
  squadSize,
  budget,
  startAreaName = "Lagos",
  shareUrl,
  isCompact = false,
  className = "",
  onShareClick,
}: DamageSlipProps) {
  const [copied, setCopied] = useState(false);

  const spot = plan.spot;
  const foodCost = plan.foodCost || (spot.price_per_person * squadSize);
  const transportCost = plan.transportCost || 0;
  const totalCost = plan.totalCost || (foodCost + transportCost);
  const effectiveBudget = budget || totalCost;
  const perPersonCost = Math.round(totalCost / Math.max(1, squadSize));

  const diff = effectiveBudget - totalCost;
  const isOverBudget = diff < 0;
  const isExactFit = diff === 0;

  // Verification status
  const isVerified = 
    plan.explanation?.status === "verified" ||
    plan.explanation?.status === "owner_verified" ||
    spot.price_source === "owner_submitted" ||
    Boolean(spot.price_updated_at);

  const verificationDate = spot.price_updated_at 
    ? new Date(spot.price_updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()
    : null;

  // Car calculation
  const carsNeeded = Math.max(1, Math.ceil(squadSize / 4));

  // Taxes calculation if applicable
  const taxAndService = Math.max(0, totalCost - (foodCost + transportCost));

  // Microcopy for budget relationship
  const renderDelightCopy = () => {
    if (isExactFit) {
      return (
        <span className="text-[#111111] font-bold">
          ₦{effectiveBudget.toLocaleString("en-NG")} / ₦{effectiveBudget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">Clean.</span>
        </span>
      );
    }
    if (diff > 0) {
      const kRemaining = diff >= 1000 ? `${(diff / 1000).toFixed(diff % 1000 === 0 ? 0 : 1)}k` : `${diff}`;
      if (diff <= 3000) {
        return (
          <span className="text-[#111111] font-bold">
            ₦{totalCost.toLocaleString("en-NG")} / ₦{effectiveBudget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">₦{kRemaining} left for bad decisions.</span>
          </span>
        );
      }
      return (
        <span className="text-[#111111] font-bold">
          ₦{totalCost.toLocaleString("en-NG")} / ₦{effectiveBudget.toLocaleString("en-NG")} — <span className="font-black text-[#111111]">₦{kRemaining} left.</span>
        </span>
      );
    }
    const kOver = Math.abs(diff) >= 1000 ? `${(Math.abs(diff) / 1000).toFixed(Math.abs(diff) % 1000 === 0 ? 0 : 1)}k` : `${Math.abs(diff)}`;
    return (
      <span className="text-[#E54D2E] font-bold flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#E54D2E]" />
        <span>Exceeds target by ₦{kOver} — stretch option.</span>
      </span>
    );
  };

  const handleCopyText = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
    const targetUrl = shareUrl || `${origin}/venue/${spot.id}`;
    const area = spot.areas?.name || spot.address_slug || "Lagos";

    const text = `Found the spot.\n\n${spot.name}, ${area}\n\n₦${totalCost.toLocaleString("en-NG")} total\n₦${perPersonCost.toLocaleString("en-NG")} each\n\nFood + drinks + transport included.\n\nWe moving?\n\n${targetUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied ✓ Go win the group chat.");
      setTimeout(() => setCopied(false), 2500);
      onShareClick?.();
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div
      className={`relative bg-white text-[#111111] border border-[#E5E5DE] rounded-[16px] shadow-[0_4px_24px_rgba(17,17,17,0.06),0_1px_3px_rgba(17,17,17,0.04)] overflow-hidden font-sans ${className}`}
    >
      {/* Top Accent Edge */}
      <div className="h-1 bg-[#111111] w-full" />

      {/* Slip Header */}
      <div className="p-4 sm:p-6 pb-3 border-b border-[#E5E5DE] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            OYAPLAN DAMAGE SLIP
          </span>
          <span>
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] font-display uppercase">
            {spot.name}
          </h3>
          <span className="text-xs font-mono font-bold text-[#6B7280] uppercase tracking-wider">
            {spot.areas?.name || spot.address_slug || "LAGOS"}
          </span>
        </div>

        {/* Verification Status Pill */}
        <div className="pt-1 flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#111111] text-[#F9E828] text-[10px] font-mono font-bold uppercase tracking-wider">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>MENU VERIFIED {verificationDate ? `• ${verificationDate}` : ""}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F6F6F2] text-[#6B7280] border border-[#E5E5DE] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>ESTIMATED RATES</span>
            </span>
          )}

          {spot.has_food === false && (
            <span className="text-[10px] font-mono text-[#6B7280] uppercase">
              • ADMISSION ONLY
            </span>
          )}
        </div>
      </div>

      {/* Itemized Spend Breakdown */}
      <div className="p-4 sm:p-6 py-4 space-y-3 font-mono text-xs">
        {/* Food & Drink / Activity */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-sans font-bold text-[#111111] block">
              {spot.has_food === false ? "Admission & Activities" : "Food & Drinks"}
            </span>
            <span className="text-[10px] text-[#6B7280] font-mono block">
              {squadSize} {squadSize === 1 ? "person" : "squad members"} • ~₦{(foodCost / squadSize).toLocaleString("en-NG")}/each
            </span>
          </div>
          <span className="font-bold text-[#111111] tabular-nums text-sm">
            ₦{foodCost.toLocaleString("en-NG")}
          </span>
        </div>

        {/* Taxes & Service Charge */}
        {taxAndService > 0 && (
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-sans font-bold text-[#111111] block">Service &amp; Taxes</span>
              <span className="text-[10px] text-[#6B7280] font-mono block">
                Standard Lagos hospitality service fee + VAT
              </span>
            </div>
            <span className="font-bold text-[#111111] tabular-nums text-sm">
              ₦{taxAndService.toLocaleString("en-NG")}
            </span>
          </div>
        )}

        {/* Transport */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-sans font-bold text-[#111111] block">Round-Trip Transport</span>
            <span className="text-[10px] text-[#6B7280] font-mono block">
              {startAreaName} ↔ {spot.areas?.name || spot.address_slug || "Venue"} • {carsNeeded} {carsNeeded > 1 ? "cars" : "ride-hailing car"}
            </span>
          </div>
          <span className="font-bold text-[#111111] tabular-nums text-sm">
            {transportCost === 0 ? "₦0 (Walking/Own)" : `₦${transportCost.toLocaleString("en-NG")}`}
          </span>
        </div>
      </div>

      {/* Perforated / Dashed Divider */}
      <div className="border-t-2 border-dashed border-[#E5E5DE] mx-4 sm:mx-6 my-1 relative">
        <div className="absolute -left-7 sm:-left-9 -top-2 w-4 h-4 rounded-full bg-[#F6F6F2] border-r border-[#E5E5DE]" />
        <div className="absolute -right-7 sm:-right-9 -top-2 w-4 h-4 rounded-full bg-[#F6F6F2] border-l border-[#E5E5DE]" />
      </div>

      {/* Totals Section */}
      <div className="p-4 sm:p-6 pt-4 space-y-3 bg-[#FCFCFA]">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7280] block">
              ESTIMATED TOTAL DAMAGE
            </span>
            <span className="text-xs font-mono font-semibold text-[#111111]">
              ₦{perPersonCost.toLocaleString("en-NG")} / person
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#111111] tabular-nums">
              ₦<NumericCounter value={totalCost} />
            </span>
          </div>
        </div>

        {/* Budget Status Microcopy */}
        <div className="p-2.5 rounded-lg bg-[#F6F6F2] border border-[#E5E5DE] text-xs font-sans">
          {renderDelightCopy()}
        </div>
      </div>

      {/* Action Footer */}
      {!isCompact && (
        <div className="p-4 sm:p-6 pt-3 pb-4 bg-white border-t border-[#E5E5DE] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full flex-1 bg-[#111111] hover:bg-black text-[#F9E828] h-11 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all tap-feedback cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#F9E828]" />
                <span>Copied ✓ Go win group chat</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#F9E828]" />
                <span>Share Damage Slip</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-auto bg-[#F6F6F2] hover:bg-[#EBEBE5] text-[#111111] border border-[#E5E5DE] h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors tap-feedback cursor-pointer"
            aria-label="Copy text breakdown"
          >
            <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="sm:hidden">Copy Breakdown</span>
          </button>
        </div>
      )}
    </div>
  );
}

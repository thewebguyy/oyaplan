"use client";

import React, { useState } from "react";
import { Plan, Spot } from "@/lib/types";
import { NumericCounter } from "@/components/ui/NumericCounter";
import { Check, ShieldCheck, Share2, Copy, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/ui/haptics";

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
  const safeSquad = Math.max(1, squadSize);
  // Canonical cost model: plan.totalCost = activity (venue) cost + midpoint transport.
  // Never recompute from other inputs; only fall back when the field is truly absent.
  const foodCost = plan.foodCost ?? Math.round(spot.price_per_person * safeSquad);
  const transportCost = plan.transportCost ?? 0;
  const totalCost = plan.totalCost ?? (foodCost + transportCost);
  const effectiveBudget = budget && budget > 0 ? budget : totalCost;
  const perPersonCost = Math.round(totalCost / safeSquad);

  const diff = effectiveBudget - totalCost;
  const isExactFit = diff === 0;

  // Verification status: only evidence-backed states may read as verified.
  // A bare price_updated_at timestamp is freshness, not verification.
  const status = plan.explanation?.status;
  const isVerified =
    status === "verified" ||
    status === "owner_verified" ||
    status === "community_verified" ||
    status === "fresh" ||
    spot.price_source === "owner_submitted";

  const verificationDate = isVerified && spot.price_updated_at
    ? new Date(spot.price_updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()
    : null;

  // Transport is an estimate: the total counts the midpoint, we surface the real range.
  const tMin = plan.transportMinCost;
  const tMax = plan.transportMaxCost;
  const hasTransportRange = typeof tMin === "number" && typeof tMax === "number" && tMax > tMin;
  const transportModeLabel =
    plan.transportMode === "public-transit" ? "Public transit" : plan.transportMode === "driving" ? "Driving" : "Ride-hailing";

  // Taxes: pricing model embeds VAT in the venue price, so this only shows if the model ever adds a gap.
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
        <span>Exceeds target by ₦{kOver} — the stretch option.</span>
      </span>
    );
  };

  const handleCopyText = async () => {
    triggerHaptic("selection");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://oyaplan.com";
    const targetUrl = shareUrl || `${origin}/venue/${spot.id}`;
    const area = spot.areas?.name || spot.address_slug || "Lagos";

    const text = `Found the spot.\n\n*${spot.name}*\n\nThe Outside Math:\n₦${totalCost.toLocaleString("en-NG")} total\n₦${perPersonCost.toLocaleString("en-NG")} each\n\nVenue + transport + applicable charges included.\n\n${targetUrl}\n\nWe running this?`;

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
            THE OUTSIDE MATH • TILL SLIP
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
              {safeSquad} {safeSquad === 1 ? "person" : "squad members"} • ~₦{Math.round(foodCost / safeSquad).toLocaleString("en-NG")}/each
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
              <span className="font-sans font-bold text-[#111111] block">Fees &amp; Taxes</span>
              <span className="text-[10px] text-[#6B7280] font-mono block">
                Added on top of venue price
              </span>
            </div>
            <span className="font-bold text-[#111111] tabular-nums text-sm">
              ₦{taxAndService.toLocaleString("en-NG")}
            </span>
          </div>
        )}

        {/* Transport (estimate — midpoint is counted in the total) */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-sans font-bold text-[#111111] block">
              Transport <span className="font-mono text-[10px] text-[#6B7280] uppercase">· est.</span>
            </span>
            <span className="text-[10px] text-[#6B7280] font-mono block">
              {startAreaName} ↔ {spot.areas?.name || spot.address_slug || "Venue"} • {transportModeLabel}
              {plan.transportConfidenceLabel ? ` • ${plan.transportConfidenceLabel}` : ""}
            </span>
            {hasTransportRange && (
              <span className="text-[10px] text-[#6B7280] font-mono block">
                Range ₦{(tMin as number).toLocaleString("en-NG")}–₦{(tMax as number).toLocaleString("en-NG")} • midpoint counted
              </span>
            )}
          </div>
          <span className="font-bold text-[#111111] tabular-nums text-sm">
            {transportCost === 0 ? "₦0" : `₦${transportCost.toLocaleString("en-NG")}`}
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
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#111111]">
                TOTAL OUTING COST
              </span>
              <span className="text-[9px] font-mono font-bold text-[#6B7280] bg-[#F6F6F2] px-1.5 py-0.5 rounded border border-[#E5E5DE]">
                THE OUTSIDE MATH
              </span>
            </div>
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

        {/* Factual Ledger Disclaimer */}
        <div className="text-[9px] font-mono text-[#888888] flex items-center justify-between pt-1 border-t border-dashed border-[#E5E5DE]">
          <span>OYAPLAN LEDGER SNAPSHOT</span>
          <span>ESTIMATED SPEND • NOT A BOOKING</span>
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
                <span>Send to the Squad →</span>
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

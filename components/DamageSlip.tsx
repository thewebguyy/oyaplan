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
      className={`relative bg-white text-[#111111] border-2 border-[#111111] rounded-2xl shadow-[6px_6px_0px_#111111] overflow-hidden font-sans transition-all ${className}`}
    >
      {/* 1. Masthead: Urban Ledger Identity & Reference */}
      <div className="bg-[#111111] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest border-b-2 border-[#111111]">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2 h-2 bg-[#F9E828] rounded-xs" />
          <span>OYAPLAN URBAN LEDGER • TILL SLIP</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <span className="hidden sm:inline">REF #{spot.id.slice(0, 8).toUpperCase()}</span>
          <span>•</span>
          <span className="text-[#F9E828] font-bold">
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2. Venue Dossier Title & Status Stamp */}
      <div className="p-4 sm:p-6 pb-4 border-b-2 border-[#111111]/15 space-y-3 bg-[#FCFCFA]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] block">
              PRIMARY DESTINATION
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] font-display uppercase">
              {spot.name}
            </h3>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] block">
              DISTRICT ZONE
            </span>
            <span className="text-xs font-mono font-black text-[#111111] uppercase tracking-wider">
              {spot.areas?.name || spot.address_slug || "LAGOS"}
            </span>
          </div>
        </div>

        {/* Verification Status Stamp */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#111111] text-[#F9E828] border border-[#111111] text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>MENU VERIFIED {verificationDate ? `• ${verificationDate}` : ""}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FAF7F2] text-[#6B7280] border border-[#CCCCCC] text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>ESTIMATED RATES</span>
            </span>
          )}

          {spot.has_food === false && (
            <span className="px-2.5 py-1 rounded-md bg-[#F6F6F2] border border-[#E5E5DE] text-[10px] font-mono font-bold text-[#111111] uppercase tracking-wider">
              ADMISSION &amp; ACTIVITIES ONLY
            </span>
          )}

          <span className="text-[10px] font-mono text-[#6B7280] uppercase ml-auto">
            {safeSquad} {safeSquad === 1 ? "PERSON PLANNED" : "SQUAD SQUAD"}
          </span>
        </div>
      </div>

      {/* 3. Visual Center of Gravity: Hero Financial Matrix */}
      <div className="p-4 sm:p-6 bg-white border-b-2 border-[#111111]/15 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#008751] block mb-1">
              ESTIMATED TOTAL OUTING SPEND
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-[#111111] tabular-nums">
                ₦<NumericCounter value={totalCost} />
              </span>
            </div>
          </div>
          <div className="md:text-right bg-[#FAF7F2] border border-[#111111]/15 px-4 py-2.5 rounded-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] block">
              EACH SQUAD MEMBER
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#111111] tabular-nums">
              ₦{perPersonCost.toLocaleString("en-NG")}
            </span>
            <span className="text-[10px] font-mono text-[#6B7280] block">
              for squad of {safeSquad}
            </span>
          </div>
        </div>

        {/* 3-Pillar Budget Matrix */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#FCFCFA] border-2 border-[#111111]/10 rounded-xl text-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              TARGET BUDGET
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-[#111111] tabular-nums block">
              ₦{effectiveBudget.toLocaleString("en-NG")}
            </span>
          </div>
          <div className="space-y-0.5 border-x border-[#111111]/10">
            <span className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              EST. OUTING COST
            </span>
            <span className="font-mono font-black text-xs sm:text-sm text-[#111111] tabular-nums block">
              ₦{totalCost.toLocaleString("en-NG")}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block">
              {diff >= 0 ? "BUDGET LEFT" : "STRETCH AMOUNT"}
            </span>
            <span
              className={`font-mono font-black text-xs sm:text-sm tabular-nums block ${
                diff >= 0 ? "text-[#008751]" : "text-[#D72638]"
              }`}
            >
              {diff >= 0 ? `+₦${diff.toLocaleString("en-NG")}` : `-₦${Math.abs(diff).toLocaleString("en-NG")}`}
            </span>
          </div>
        </div>

        {/* Budget Audit Microcopy */}
        <div className="px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#111111]/10 text-xs font-sans">
          {renderDelightCopy()}
        </div>
      </div>

      {/* 4. Structured Itemized Ledger (The Urban Breakdown) */}
      <div className="p-4 sm:p-6 py-5 space-y-4 bg-[#FCFCFA]">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-widest border-b-2 border-dashed border-[#111111]/20 pb-2">
          <span>ITEMIZED EXPENSES</span>
          <span>ESTIMATED SUM</span>
        </div>

        <div className="space-y-3.5 font-mono text-xs">
          {/* Row 1: Food & Drink / Activity */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-sm text-[#111111] block">
                  {spot.has_food === false ? "Admission & Activities" : "Food & Drinks"}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#111111]/20 text-[#111111]">
                  {isVerified ? "Verified Menus" : "Estimated Tier"}
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280] font-mono block">
                {safeSquad} {safeSquad === 1 ? "person" : "squad members"} • ~₦{Math.round(foodCost / safeSquad).toLocaleString("en-NG")} each
              </span>
            </div>
            <span className="font-bold font-mono text-[#111111] tabular-nums text-sm sm:text-base shrink-0 pt-0.5">
              ₦{foodCost.toLocaleString("en-NG")}
            </span>
          </div>

          {/* Row 2: Taxes & Service Charge (if applicable) */}
          {taxAndService > 0 && (
            <div className="flex items-start justify-between gap-3 pt-1 border-t border-[#111111]/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-sm text-[#111111] block">
                    Statutory Fees &amp; Taxes
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#111111]/20 text-[#6B7280]">
                    Statutory
                  </span>
                </div>
                <span className="text-[11px] text-[#6B7280] font-mono block">
                  Applicable VAT 7.5% and hospitality service charge
                </span>
              </div>
              <span className="font-bold font-mono text-[#111111] tabular-nums text-sm sm:text-base shrink-0 pt-0.5">
                ₦{taxAndService.toLocaleString("en-NG")}
              </span>
            </div>
          )}

          {/* Row 3: Transport (Round-Trip Zone Estimate) */}
          <div className="flex items-start justify-between gap-3 pt-1 border-t border-[#111111]/10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-sm text-[#111111] block">
                  Estimated Transport ({transportModeLabel})
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
                  Zone Estimate
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280] font-mono block">
                Round-trip transit estimate ({startAreaName} ↔ {spot.areas?.name || spot.address_slug || "Venue"})
                {hasTransportRange && ` • Range: ₦${tMin.toLocaleString()} – ₦${tMax.toLocaleString()}`}
              </span>
            </div>
            <span className="font-bold font-mono text-[#111111] tabular-nums text-sm sm:text-base shrink-0 pt-0.5">
              {transportCost === 0 ? "₦0" : `₦${transportCost.toLocaleString("en-NG")}`}
            </span>
          </div>
        </div>

        {/* Clean Perforated Divider */}
        <div className="border-t-2 border-dashed border-[#111111]/25 my-3" />

        {/* Factual Ledger Disclaimer */}
        <div className="text-[10px] font-mono text-[#777777] flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
          <span className="font-bold">OYAPLAN URBAN LEDGER SNAPSHOT</span>
          <span>ESTIMATED SPEND • NOT A FINAL BOOKING BILL</span>
        </div>
      </div>

      {/* 5. Squad Action Footer */}
      {!isCompact && (
        <div className="p-4 sm:p-6 pt-4 pb-5 bg-white border-t-2 border-[#111111] flex flex-col sm:flex-row items-stretch gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 bg-[#008751] hover:bg-[#007043] text-white border-2 border-[#111111] h-12 px-5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] cursor-pointer shadow-[3px_3px_0px_#111111]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[3]" />
                <span>Copied ✓ Go win group chat</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-white" />
                <span>Send to the Squad →</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="sm:w-auto bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#111111] border-2 border-[#111111] h-12 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shadow-[2px_2px_0px_#111111]"
            aria-label="Copy text breakdown"
          >
            <Copy className="w-4 h-4 text-[#111111]" />
            <span>Copy Breakdown</span>
          </button>
        </div>
      )}
    </div>
  );
}

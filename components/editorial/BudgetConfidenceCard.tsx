"use client";

import { Plan } from "@/lib/types";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { NumericCounter } from "@/components/ui/NumericCounter";

type BudgetState = "safe" | "near" | "over";

function getBudgetState(diff: number, budget: number): BudgetState {
  if (diff < 0) return "over";
  if (diff / budget < 0.1) return "near";   // less than 10% remaining
  return "safe";
}

const STATE_CONFIG = {
  safe: {
    card:   "bg-[#F5FAF7] border-[#C3DDD1] shadow-green-soft bg-palm-green-glow",
    divider: "border-[#C3DDD1]/50",
    icon:   <CheckCircle className="w-6 h-6 text-[#008751] shrink-0 mt-0.5" />,
    headline: "You're safe. No cap.",
    sub: (diff: number) => `You'll likely have ₦${diff.toLocaleString("en-NG")} left to flex.`,
  },
  near: {
    card:   "bg-[#FAFAF8] border-[#DDD8C8]",
    divider: "border-[#DDD8C8]/50",
    icon:   <AlertCircle className="w-6 h-6 text-[#A07C3A] shrink-0 mt-0.5" />,
    headline: "Strict budget, but we go run am.",
    sub: (diff: number) => `About ₦${diff.toLocaleString("en-NG")} to spare — don't go order extra drinks.`,
  },
  over: {
    card:   "bg-[#FFFBF0] border-[#EDD98A] shadow-yellow-soft",
    divider: "border-[#EDD98A]/50",
    icon:   <XCircle className="w-6 h-6 text-[#C18500] shrink-0 mt-0.5" />,
    headline: "You dey go outside your power.",
    sub: (diff: number) => `Over by ₦${Math.abs(diff).toLocaleString("en-NG")}. Maybe drop one stop so your wallet doesn't cry.`,
  },
} as const;

export function BudgetConfidenceCard({ plan, originalBudget }: { plan: Plan; originalBudget?: number }) {
  if (!originalBudget) return null;

  const diff  = originalBudget - plan.totalCost;
  const state = getBudgetState(diff, originalBudget);
  const cfg   = STATE_CONFIG[state];

  return (
    <div
      className={`${cfg.card} rounded-[24px] p-6 sm:p-8 border mb-6 transition-[colors,box-shadow]`}
      style={{ transitionDuration: "var(--duration-editorial)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#008751] block">Anti-Instagram Deception</span>
          <h3 className="type-heading text-lg font-black text-[#111827]">What You'll Actually Spend</h3>
        </div>
        <span className="text-xs font-bold text-[#6B7280]">All-Inclusive</span>
      </div>

      <div className="flex flex-row justify-between mb-4">
        <div>
          <p className="type-caption text-[#6B7280] mb-1 font-semibold">Your Budget Target</p>
          <p className="text-xl font-bold line-through text-[#9CA3AF]">
            ₦{originalBudget.toLocaleString("en-NG")}
          </p>
        </div>
        <div className="text-right">
          <p className="type-caption text-[#008751] mb-1 font-bold">Estimated Landed Spend</p>
          <p className="text-4xl font-black text-[#111827] tabular-nums font-mono">
            ₦<NumericCounter value={plan.totalCost} />
          </p>
        </div>
      </div>

      {/* Itemized Cost Breakdown: VENUE/ACTIVITY -> TRANSPORT -> TAXES */}
      {(() => {
        const hasFood = plan.spot.has_food !== false;
        const venueCost = plan.foodCost;
        const transportCost = plan.transportCost;
        const taxesCost = Math.max(0, plan.totalCost - (venueCost + transportCost));

        return (
          <div className="py-3 px-4 bg-black/[0.02] border border-black/5 rounded-xl mb-6 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[#4B5563]">
              <span className="font-sans font-semibold">
                {hasFood ? "🍽️ Food & Drinks (Squad)" : "🎟️ Admission / Venue (Squad)"}
              </span>
              <span className="font-bold text-[#111827]">₦{venueCost.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-between items-center text-[#4B5563]">
              <span className="font-sans font-semibold">🚗 Round-trip Transport</span>
              <span className="font-bold text-[#111827]">
                {transportCost === 0 ? "₦0 (Driving/Walking)" : `₦${transportCost.toLocaleString("en-NG")}`}
              </span>
            </div>
            {taxesCost > 0 && (
              <div className="flex justify-between items-center text-[#4B5563]">
                <span className="font-sans font-semibold">🧾 Taxes &amp; Service</span>
                <span className="font-bold text-[#111827]">₦{taxesCost.toLocaleString("en-NG")}</span>
              </div>
            )}
          </div>
        );
      })()}

      <div className={`pt-6 border-t ${cfg.divider} flex items-start gap-3`}>
        {cfg.icon}
        <div className="space-y-3 w-full">
          <div>
            <p className="font-black text-lg leading-tight text-[#111827]">{cfg.headline}</p>
            <p className="text-[#4B5563] text-sm font-medium mt-0.5">{cfg.sub(diff)}</p>
          </div>

          <div className="pt-2 border-t border-black/5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block w-full mb-0.5">
              Trust & Data Quality
            </span>
            {plan.spot.confidence_reasons && plan.spot.confidence_reasons.length > 0 ? (
              plan.spot.confidence_reasons.map((reason, idx) => {
                const isWarning = reason.startsWith("⚠") || reason.startsWith("✖");
                return (
                  <span 
                    key={idx}
                    className={`px-2.5 py-1 border rounded-full text-xs font-bold flex items-center gap-1 ${
                      isWarning 
                        ? 'bg-amber-600/10 text-amber-800 border-amber-600/20' 
                        : 'bg-emerald-600/10 text-emerald-800 border-emerald-600/20'
                    }`}
                  >
                    {reason}
                  </span>
                );
              })
            ) : (
              <span className="px-2.5 py-1 bg-amber-600/10 text-amber-800 border border-amber-600/20 rounded-full text-xs font-bold flex items-center gap-1">
                ⚠ Limited pricing evidence
              </span>
            )}
            
            {plan.transportEstimate?.status === "unavailable" ? (
              <span className="px-2.5 py-1 bg-amber-600/10 text-amber-800 border border-amber-600/20 rounded-full text-xs font-bold flex items-center gap-1">
                ⚠ Transport estimate unavailable
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-blue-600/10 text-blue-800 border border-blue-600/20 rounded-full text-xs font-bold flex items-center gap-1">
                🚗 Transport modeled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

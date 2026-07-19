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
      <h3 className="type-heading text-lg mb-6">Can You Afford It?</h3>

      <div className="flex flex-row justify-between mb-6">
        <div>
          <p className="type-caption text-text-muted mb-1">Your budget</p>
          <p className="text-xl font-bold line-through text-text-muted">
            ₦{originalBudget.toLocaleString("en-NG")}
          </p>
        </div>
        <div className="text-right">
          <p className="type-caption text-text-muted mb-1">Estimated spend</p>
          <p className="text-4xl font-black text-midnight-lagoon tabular-nums">
            ₦<NumericCounter value={plan.totalCost} />
          </p>
        </div>
      </div>

      <div className={`pt-6 border-t ${cfg.divider} flex items-start gap-3`}>
        {cfg.icon}
        <div>
          <p className="font-bold text-lg leading-tight">{cfg.headline}</p>
          <p className="text-text-muted">{cfg.sub(diff)}</p>
        </div>
      </div>
    </div>
  );
}

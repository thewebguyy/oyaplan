"use client";

import { Plan } from "@/lib/types";
import { CheckCircle, XCircle } from "lucide-react";

export function BudgetConfidenceCard({ plan, originalBudget }: { plan: Plan; originalBudget?: number }) {
  if (!originalBudget) return null;

  const diff = originalBudget - plan.totalCost;
  const isAffordable = diff >= 0;

  return (
    <div className="bg-[#FFFBF2] rounded-[24px] p-6 sm:p-8 border border-[#EAE3D1] mb-6">
      <h3 className="type-heading text-lg mb-6">Can You Afford It?</h3>

      <div className="flex flex-row justify-between mb-6">
        <div>
          <p className="type-caption text-text-muted mb-1">Your budget</p>
          <p className="text-xl font-bold line-through text-text-muted">₦{originalBudget.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="type-caption text-text-muted mb-1">Expected spend</p>
          <p className="text-3xl font-black text-brand-green">₦{plan.totalCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="pt-6 border-t border-[#EAE3D1]/50 flex items-start gap-3">
        {isAffordable ? (
          <>
            <CheckCircle className="w-6 h-6 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg leading-tight">Yes.</p>
              <p className="text-text-muted">You'll likely have ₦{diff.toLocaleString()} left.</p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg leading-tight">Slightly over.</p>
              <p className="text-text-muted">It's ₦{Math.abs(diff).toLocaleString()} more than planned.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { Plan } from "@/lib/types";

export function BudgetSection({ plan, originalBudget }: { plan: Plan; originalBudget?: number }) {
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-1">Estimated Total</p>
        <p className="type-display-product text-text-primary leading-none tabular-nums">₦{plan.totalCost.toLocaleString()}</p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between type-body text-text-secondary">
          <span>Food estimate</span>
          <span className="type-price">≈ ₦{plan.foodCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between type-body text-text-secondary">
          <span>Transport estimate</span>
          <span className="type-price">≈ ₦{plan.transportCost.toLocaleString()}</span>
        </div>
      </div>

      {originalBudget && originalBudget > 0 && diff > 0 && (
        <div className="pt-5 border-t border-border-default/50">
          <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-1">Remaining Budget</p>
          <p className="type-tagline text-brand-green tabular-nums">About ₦{diff.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

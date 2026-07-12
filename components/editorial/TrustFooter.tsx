"use client";

import { Plan } from "@/lib/types";
import { ReactNode } from "react";

export function TrustFooter({
  plan,
  actions
}: {
  plan: Plan;
  actions?: ReactNode;
}) {
  return (
    <div className="px-6 sm:px-10 py-6 bg-surface-grey/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-1">Price Confidence</p>
        <p className="type-caption font-[600] text-text-primary">
          {plan.spot.price_updated_at ? 'Prices verified this week.' : 'Based on recent venue pricing.'}
        </p>
        <p className="type-caption text-text-muted">
          Estimate includes: Food • Drinks • Ride-hailing
        </p>
      </div>

      {actions && (
        <div className="w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

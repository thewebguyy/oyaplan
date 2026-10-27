"use client";

import { Plan } from "@/lib/types";
import { ReactNode } from "react";


export function TrustFooter({
  plan,
  actions,
  isTopPick = true
}: {
  plan: Plan;
  actions?: ReactNode;
  isTopPick?: boolean;
}) {
  const isPricingVerified = Boolean(
    ((plan.spot.verified_by && plan.spot.verified_by !== 'seed' && plan.spot.verified_by !== 'unverified') ||
      plan.spot.price_source === 'manual_verification' ||
      plan.spot.price_source === 'owner_submission') &&
    plan.spot.price_updated_at &&
    Math.floor((Date.now() - new Date(plan.spot.price_updated_at).getTime()) / (1000 * 60 * 60 * 24)) < 30
  );
  const isTransportEstimated = plan.transportCost > 0;
  const hasHours = !!plan.spot.days_open && plan.spot.days_open.length > 0;
  const isAvailabilityVerified = false; // Always pending/unverified since no real-time API booking is available

  return (
    <div className={`px-6 sm:px-10 py-8 bg-surface-grey/30 flex flex-col gap-6 ${
      isTopPick ? "lg:flex-row lg:items-center justify-between" : "w-full"
    }`}>
      <div className="space-y-4">
        <div>
          <p className="type-caption text-text-muted uppercase tracking-wider font-[700] mb-2">Outing Check</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              {isPricingVerified ? (
                <span className="text-[#008751] font-bold">✓</span>
              ) : (
                <span className="text-text-muted">○</span>
              )}
              <span className={isPricingVerified ? "text-text-primary font-medium" : "text-text-muted"}>Cost Vetted</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isTransportEstimated ? (
                <span className="text-[#008751] font-bold">✓</span>
              ) : (
                <span className="text-text-muted">○</span>
              )}
              <span className={isTransportEstimated ? "text-text-primary font-medium" : "text-text-muted"}>Transit Sorted</span>
            </div>

            <div className="flex items-center gap-2">
              {hasHours ? (
                <span className="text-[#008751] font-bold">✓</span>
              ) : (
                <span className="text-text-muted">○</span>
              )}
              <span className={hasHours ? "text-text-primary font-medium" : "text-text-muted"}>Open & Active</span>
            </div>

            <div className="flex items-center gap-2">
              {isAvailabilityVerified ? (
                <span className="text-[#008751] font-bold">✓</span>
              ) : (
                <span className="text-text-muted">○</span>
              )}
              <span className="text-text-muted">Ready for Squad</span>
            </div>
          </div>
        </div>
        <p className="type-caption text-text-muted">
          Real menus checked by hand. No fake pricing.
        </p>
      </div>

      {actions && (
        <div className={`w-full ${isTopPick ? "lg:w-auto" : ""}`}>
          {actions}
        </div>
      )}
    </div>
  );
}


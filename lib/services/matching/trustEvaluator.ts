import { Spot, TrustSignal } from "../../types";

/**
 * Trust Evaluator (Phase D1)
 * 
 * Generates deterministic trust signals for a given plan based purely on structured data.
 * No AI hallucination, no arbitrary percentages.
 */
export function generateTrustSignals(spot: Spot, totalCost: number, budget: number): TrustSignal[] {
  return [
    evaluateBudgetFit(totalCost, budget),
    evaluatePriceFreshness(spot.price_updated_at, spot.price_source),
    evaluateOperationalConfidence(spot.verified_by, spot.active)
  ];
}

function evaluateBudgetFit(totalCost: number, budget: number): TrustSignal {
  if (totalCost <= budget) return "Within budget";
  if (totalCost <= budget * 1.15) return "Slight stretch";
  return "Over budget";
}

function evaluatePriceFreshness(updatedAt?: string, source?: string): TrustSignal {
  if (!updatedAt) return "Estimated";
  
  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffDays = (now.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24);
  
  if (diffDays <= 7) return "Verified this week";
  if (diffDays <= 90) return "Verified recently";
  return "Estimated";
}

function evaluateOperationalConfidence(verifiedBy?: string, active?: boolean): TrustSignal {
  if (verifiedBy === "fresh" || verifiedBy === "owner_verified") {
    return "Hours recently confirmed";
  }
  return "Hours may vary";
}

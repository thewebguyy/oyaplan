import { ExplainedPlan } from '../types';
import { DecisionCardViewModel, TrustIndicator } from './types';

function deriveTrustIndicator(confidenceScore: number): TrustIndicator {
  let level: "high" | "medium" | "low" = "low";
  let label = "Low confidence";
  let description = "Pricing details may be outdated or unconfirmed.";

  if (confidenceScore >= 90) {
    level = "high";
    label = "Very high confidence";
    description = "Pricing details are direct from the venue or highly vetted.";
  } else if (confidenceScore >= 75) {
    level = "high";
    label = "High confidence";
    description = "Pricing details are verified by community receipts or admin.";
  } else if (confidenceScore >= 50) {
    level = "medium";
    label = "Medium confidence";
    description = "Pricing is estimated from historical data.";
  }

  return { level, label, description };
}

function getVerificationText(updatedAt: string | undefined): string {
  if (!updatedAt) return "Estimated price";
  const daysAgo = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysAgo === 0) return "Verified today";
  if (daysAgo === 1) return "Verified yesterday";
  if (daysAgo < 7) return "Verified this week";
  if (daysAgo < 30) return "Verified this month";
  return "Estimated price";
}

export function mapPlanToCardViewModel(plan: ExplainedPlan): DecisionCardViewModel {
  const confidenceScore = plan.explanation.confidence_score || 50;

  return {
    title: plan.title,
    heroImage: plan.spot.image_url,
    venueCost: plan.activityCost,
    transportCost: plan.transportCost,
    totalCost: plan.totalCost,
    budgetFit: plan.explanation.budget_fit || `Fits budget`,
    verification: getVerificationText(plan.spot.price_updated_at),
    confidence: confidenceScore,
    whyItFits: plan.whyItFits,
    planningSummary: plan.decisionSummary,

    spotId: plan.spot.id,
    spotName: plan.spot.name,
    category: plan.spot.category || 'restaurant',
    address: plan.spot.address,
    pricePerPerson: plan.spot.price_per_person,
    addressSlug: plan.spot.address_slug,
    areaSlug: plan.spot.areas?.slug || plan.spot.address_slug,
    travelInfo: plan.travelInfo,
    isAdjacent: plan.isAdjacentZoneSuggestion,

    budgetRemaining: plan.budgetRemaining ?? 0,
    trustIndicator: deriveTrustIndicator(confidenceScore)
  };
}

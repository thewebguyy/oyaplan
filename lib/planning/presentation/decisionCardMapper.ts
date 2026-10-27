import { ExplainedPlan } from '../types';
import { DecisionCardViewModel, TrustIndicator } from './types';

export type TrustStatus = "verified" | "estimated" | "pending" | "unavailable";

export function shouldDisplayConfidencePercentage(spot: {
  manual_verifications_count?: number;
  user_reported_outcomes_count?: number;
  verified_by?: string;
  price_source?: string;
  confidence_reasons?: string[];
}): boolean {
  if (spot.manual_verifications_count !== undefined && spot.user_reported_outcomes_count !== undefined) {
    return spot.manual_verifications_count >= 1 && spot.user_reported_outcomes_count >= 3;
  }
  const hasManual = Boolean(
    (spot.verified_by && spot.verified_by !== 'seed' && spot.verified_by !== 'unverified') ||
    spot.price_source === 'manual_verification' ||
    spot.price_source === 'owner_submission'
  );
  const hasOutcomes = Boolean(
    spot.confidence_reasons && spot.confidence_reasons.some(r => r.includes('independent') || r.includes('receipt') || r.includes('3'))
  );
  return hasManual && hasOutcomes;
}

export function deriveSpotTrustStatus(spot: {
  is_temporarily_closed?: boolean;
  active?: boolean;
  verified_by?: string;
  price_source?: string;
  price_updated_at?: string;
}): TrustStatus {
  if (spot.is_temporarily_closed || spot.active === false) {
    return "unavailable";
  }

  const isVerifiedSource = Boolean(
    (spot.verified_by && spot.verified_by !== 'seed' && spot.verified_by !== 'unverified') ||
    (spot.price_source === 'manual_verification' || spot.price_source === 'owner_submission')
  );

  if (!spot.price_updated_at) {
    return "pending";
  }

  const daysAgo = Math.floor(
    (Date.now() - new Date(spot.price_updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysAgo >= 60) {
    return "pending";
  }

  if (isVerifiedSource && daysAgo < 30) {
    return "verified";
  }

  return "estimated";
}

export function deriveTrustIndicator(confidenceScore: number): TrustIndicator {
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

export function getVerificationText(updatedAt: string | undefined, isVerifiedSource?: boolean): string {
  if (isVerifiedSource === false) return "Estimated price";
  if (!updatedAt) return "Estimated price";
  const daysAgo = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (isVerifiedSource === true) {
    if (daysAgo >= 60) return "Pricing unverified";
    if (daysAgo >= 30) return "Needs update";
  }
  if (daysAgo === 0) return "Verified today";
  if (daysAgo === 1) return "Verified yesterday";
  if (daysAgo < 7) return "Verified this week";
  if (daysAgo < 30) return "Verified this month";
  return "Estimated price";
}

export function mapPlanToCardViewModel(plan: ExplainedPlan): DecisionCardViewModel {
  const confidenceScore = plan.explanation.confidence_score || 50;

  let travelInfo = plan.travelInfo;
  if (plan.travelEstimate) {
    const est = plan.travelEstimate;
    const distanceText = `${est.distanceKm.toFixed(1)}km`;
    if (est.confidence === "high") {
      travelInfo = `🚗 About ${est.estimatedMinutes} min (${distanceText}, very close)`;
    } else if (est.confidence === "medium") {
      travelInfo = `🚗 About ${est.estimatedMinutes} min (${distanceText})`;
    } else {
      travelInfo = `🚗 About ${est.estimatedMinutes}+ min (${distanceText}, plan for traffic)`;
    }
  }

  return {
    title: plan.title,
    heroImage: plan.spot.cover_url || plan.spot.image_url,
    galleryUrls: plan.spot.gallery_urls,
    venueCost: plan.activityCost,
    transportCost: plan.transportCost,
    transportMinCost: plan.transportMinCost,
    transportMaxCost: plan.transportMaxCost,
    transportMode: plan.transportMode,
    transportConfidenceScore: plan.transportConfidenceScore,
    transportConfidenceLabel: plan.transportConfidenceLabel,
    transportConfidenceBadgeColor: plan.transportConfidenceBadgeColor,
    transportAssumptions: plan.transportAssumptions,
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
    travelInfo: travelInfo,
    isAdjacent: plan.isAdjacentZoneSuggestion,

    budgetRemaining: plan.budgetRemaining ?? 0,
    trustIndicator: deriveTrustIndicator(confidenceScore),
    secondaryExperience: plan.spot.secondary_experience,
    foodType: plan.spot.food_type,
    transportEstimate: plan.transportEstimate
  };
}

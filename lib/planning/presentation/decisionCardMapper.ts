import { ExplainedPlan } from '../types';
import { DecisionCardViewModel } from './types';

export function mapPlanToCardViewModel(plan: ExplainedPlan): DecisionCardViewModel {
  return {
    title: plan.title,
    heroImage: plan.spot.image_url,
    venueCost: plan.activityCost,
    transportCost: plan.transportCost,
    totalCost: plan.totalCost,
    budgetFit: plan.explanation.budget_fit || `Fits budget`,
    verification: plan.explanation.freshness || 'Verified recently',
    confidence: plan.explanation.confidence_score || 50,
    whyItFits: plan.whyItFits,
    planningSummary: plan.decisionSummary,

    spot: plan.spot,
    spotId: plan.spot.id,
    spotName: plan.spot.name,
    category: plan.spot.category || 'restaurant',
    address: plan.spot.address,
    pricePerPerson: plan.spot.price_per_person,
    addressSlug: plan.spot.address_slug,
    areaSlug: plan.spot.areas?.slug || plan.spot.address_slug,
    travelInfo: plan.travelInfo,
    isAdjacent: plan.isAdjacentZoneSuggestion
  };
}

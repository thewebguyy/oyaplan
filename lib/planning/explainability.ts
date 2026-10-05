import { Spot, DecisionConfidence, PlanExplanation, ConfidenceEvidence } from '../types';
import { RankedPlan, PlanningContext, ExplainedPlan, ExplainabilityEngine, TravelledPlan } from './types';
import { calculateZoneFare } from './transport';
import { timeAgo } from '../utils/timeAgo';
import { formatPlanTitle, formatPlanSubtitle, formatDecisionSummary } from '../utils/editorialFormatter';

function generateWhyItFits(spot: Spot, vibe: string, total: number, budget: number): string {
  const diff = budget - total;

  if (diff <= 2000 && diff >= 0) {
    return "Right on budget. Spent well.";
  }

  const suggestions: Record<string, string> = {
    "Chill": "an extra round of drinks",
    "Foodie": "dessert and a starter",
    "Party": "cover charge or transport home",
    "Quick": "takeaway on the way back",
    "Dinner": "a bottle for the table",
    "Brunch": "cocktails or fresh juice"
  };

  const suggestion = suggestions[vibe] || "something extra for the squad";
  return `Your squad saves ₦${diff.toLocaleString()} under budget — enough for ${suggestion}.`;
}

function formatPriceSource(source: string): string {
  const labels: Record<string, string> = {
    manual: 'Verified by admin',
    crowd: 'Community receipts',
    scraping: 'Web estimate',
    owner_submission: 'Owner submitted',
    manual_verification: 'Admin verified',
    historical_estimate: 'Historical estimate',
  };
  return labels[source] || 'Estimated';
}

function buildTaxLabel(spot: Spot): string {
  const cat = spot.category;
  if (cat === 'restaurant') return 'Includes 7.5% VAT + food service';
  if (cat === 'bar') return 'Includes 7.5% VAT on beverages';
  if (cat === 'cafe') return 'Includes standard VAT';
  if (cat === 'activity' || cat === 'entertainment' || cat === 'experience') {
    return 'Includes entry/access fees';
  }
  if (cat === 'beach' || cat === 'nature') return 'Includes access fees where applicable';
  return 'Taxes and fees included';
}

function formatAreaSlugName(slug: string): string {
  if (!slug) return "nearby";
  const map: Record<string, string> = {
    "ikeja": "Ikeja",
    "yaba": "Yaba",
    "surulere": "Surulere",
    "lekki-phase-1": "Lekki Phase 1",
    "vi": "Victoria Island",
    "ikoyi": "Ikoyi",
    "gbagada": "Gbagada",
    "ogudu": "Ogudu",
    "maryland": "Maryland",
    "ebute-metta": "Ebute Metta",
    "apapa": "Apapa"
  };
  if (map[slug.toLowerCase()]) return map[slug.toLowerCase()];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function formatTravelInfo(originArea: string, spotArea: string, transportCost: number): string {
  const fare = calculateZoneFare(originArea, spotArea);
  let estMins = 18;
  if (fare <= 1200) estMins = 12;
  else if (fare <= 5000) estMins = 18;
  else if (fare <= 7000) estMins = 25;
  else if (fare <= 9000) estMins = 32;
  else if (fare <= 12000) estMins = 42;
  else estMins = 55;

  const originName = formatAreaSlugName(originArea);
  return `${estMins} mins from ${originName} • +₦${transportCost.toLocaleString()} estimated transport`;
}

function evaluateDecisionConfidence(spot: Spot, transportCost: number): DecisionConfidence {
  const confidenceScore = Number(spot.computed_confidence_score || 50.00);

  let level: "Very High" | "High" | "Medium" | "Low" = "Low";
  if (confidenceScore >= 90) level = "Very High";
  else if (confidenceScore >= 75) level = "High";
  else if (confidenceScore >= 50) level = "Medium";

  const evidenceList: ConfidenceEvidence[] = [];

  if (spot.verified_by && spot.verified_by !== 'seed') {
    evidenceList.push("price_verified");
  }

  const priceUpdated = spot.price_updated_at;
  if (priceUpdated) {
    const daysAgo = Math.floor((new Date().getTime() - new Date(priceUpdated).getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 30) {
      evidenceList.push("menu_recent");
    }
  }

  if (transportCost <= 2500) {
    evidenceList.push("transport_predictable");
  }

  evidenceList.push("tax_buffer_applied");

  return { level, evidenceList };
}

function generateOrderedReasons(
  spot: Spot,
  vibe: string,
  total: number,
  budget: number,
  originArea: string,
  squadSize: number
): string[] {
  const reasons: string[] = [];
  const diff = budget - total;

  // 1. Budget & Squad Savings
  if (diff <= 2000 && diff >= 0) {
    reasons.push(`Fits your ₦${budget.toLocaleString()} budget right on the mark`);
  } else if (diff > 2000) {
    reasons.push(`Fits your ₦${budget.toLocaleString()} budget (squad keeps ₦${diff.toLocaleString()} to spare)`);
  } else {
    reasons.push(`Budget-optimized for ₦${budget.toLocaleString()} squad outing`);
  }

  // 2. Vibe & Experience Match
  const vibeLabelMap: Record<string, string> = {
    "Dinner": "date night & intimate conversations",
    "Chill": "relaxed catch-ups & coffee",
    "Foodie": "serious chop & menu exploration",
    "Party": "turn up & weekend energy",
    "Quick": "fast casual linkups",
    "Brunch": "weekend brunch & cocktails"
  };
  const vibeDesc = vibeLabelMap[vibe] || `${vibe.toLowerCase()} outings`;
  reasons.push(`Great match for ${vibeDesc}`);

  // 3. Transport Predictability
  const originName = formatAreaSlugName(originArea);
  reasons.push(`Typical transport fare from ${originName} is predictable`);

  // 4. Menu Price Recency
  if (spot.price_updated_at) {
    reasons.push(`Menu prices verified ${timeAgo(spot.price_updated_at)}`);
  } else if (spot.verified_by) {
    reasons.push(`Verified by Lagos Scout network`);
  } else {
    reasons.push(`Taxes and service fees included in estimate`);
  }

  // 5. Group Size Suitability
  if (squadSize === 1) {
    reasons.push(`Comfortable atmosphere for solo outings`);
  } else if (squadSize <= 3) {
    reasons.push(`Ideal table layout for small linkups (${squadSize} people)`);
  } else {
    reasons.push(`Good capacity for squad hangouts (${squadSize} people)`);
  }

  return reasons;
}

function generateThingsToKnow(spot: Spot, originArea: string): string[] {
  if (spot.things_to_know && spot.things_to_know.length > 0) {
    return spot.things_to_know;
  }

  const items: string[] = [];

  if (spot.category === 'bar' || spot.category === 'entertainment') {
    items.push("Can get busy on Friday & weekend evenings");
  }

  if (spot.category === 'restaurant' && spot.price_tier && spot.price_tier >= 3) {
    items.push("Table reservations recommended for peak weekend dining");
  }

  if (spot.address_slug === 'lekki-phase-1' || spot.address_slug === 'vi') {
    items.push("Parking may be limited near venue during peak hours");
  }

  if (originArea && originArea !== spot.address_slug) {
    items.push("Transport travel times can vary during weekday evening traffic");
  }

  return items;
}

export class DefaultExplainabilityEngine implements ExplainabilityEngine {
  run(plans: TravelledPlan[], context: PlanningContext, isAdjacent: boolean = false): ExplainedPlan[] {
    const { vibe, budget, startArea, squadSize } = context.request;
    const areaKey = startArea || "ikeja";

    return plans.map((plan) => {
      const { spot, activityCost, transportCost, totalCost } = plan;
      const confidenceScore = Number(spot.computed_confidence_score || 50.00);

      const whyItFits = generateWhyItFits(spot, vibe, totalCost, budget);
      const orderedReasons = generateOrderedReasons(spot, vibe, totalCost, budget, areaKey, squadSize);
      const thingsToKnow = generateThingsToKnow(spot, areaKey);
      const priceSource = spot.price_source || 'historical_estimate';
      const sourceLabel = formatPriceSource(priceSource);
      
      const travelInfo = isAdjacent 
        ? formatTravelInfo(areaKey, spot.address_slug || spot.areas?.slug || "ikeja", transportCost)
        : undefined;

      const status = spot.verified_by || 'verified';

      const explanation: PlanExplanation = {
        budget_fit: `Fits ₦${budget.toLocaleString()} squad budget`,
        freshness: spot.price_updated_at
          ? `Prices updated ${timeAgo(spot.price_updated_at)}`
          : 'Estimated from historical data',
        confidence: `${Math.round(confidenceScore)}% data confidence`,
        tax_transparency: buildTaxLabel(spot),
        source_label: sourceLabel,
        confidence_score: Math.round(confidenceScore),
        status,
        travel_info: travelInfo,
        ordered_reasons: orderedReasons,
        things_to_know: thingsToKnow,
      };

      // Create a temporary mock to satisfy standard title formatters
      const mockPlan = {
        spot,
        foodCost: activityCost,
        transportCost,
        totalCost,
        whyItFits
      };

      const title = formatPlanTitle(mockPlan, { budget, squadSize: context.request.squadSize, vibe, daypart: context.request.daypart });
      const subtitle = formatPlanSubtitle(mockPlan, { budget, squadSize: context.request.squadSize, vibe, daypart: context.request.daypart });
      const decisionSummary = formatDecisionSummary(mockPlan, { budget, squadSize: context.request.squadSize, vibe, daypart: context.request.daypart });
      const decisionConfidence = evaluateDecisionConfidence(spot, transportCost);

      const budgetRemaining = budget - totalCost;

      return {
        ...plan,
        whyItFits,
        title,
        subtitle,
        decisionConfidence,
        decisionSummary,
        explanation,
        isAdjacentZoneSuggestion: isAdjacent,
        travelInfo,
        budgetRemaining
      };
    });
  }
}

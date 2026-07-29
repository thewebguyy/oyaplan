import { Spot, ForgeInput, Plan, PlanAdjustment, ConfidenceEvidence, DecisionConfidence, RecoverySuggestion } from '../../types';
import { supabase } from '../../supabase';
import { BudgetPolicy } from './budgetPolicy';
import { formatPlanTitle, formatPlanSubtitle, formatDecisionSummary } from '../../utils/editorialFormatter';

const ZONES: Record<string, string> = {
  ikeja: "mainland",
  gbagada: "mainland",
  ogudu: "mainland",
  agege: "mainland",
  maryland: "mainland",
  yaba: "central",
  surulere: "central",
  "ebute-metta": "central",
  "lekki-phase-1": "island",
  vi: "island",
  ikoyi: "island",
  apapa: "other"
};

/**
 * Deterministic Lagos 2026 Zone Fare Formula
 * Returns round-trip cost in Naira, rounded to nearest ₦500.
 * Same-area short-hop: ₦1,200 (not the same-zone ₦5,000).
 */
export function calculateZoneFare(origin: string, destination: string): number {
  if (origin === destination) return 1200;

  const zone1 = ZONES[origin] || "other";
  const zone2 = ZONES[destination] || "other";

  let baseOneWay = 0;

  // Apapa (Other) Logic
  if (zone1 === "other" || zone2 === "other") {
    const nonApapaZone = zone1 === "other" ? zone2 : zone1;
    if (nonApapaZone === "other") {
      baseOneWay = 2500;
    } else if (nonApapaZone === "central") {
      baseOneWay = 2500;
    } else if (nonApapaZone === "mainland") {
      baseOneWay = 3500;
    } else if (nonApapaZone === "island") {
      baseOneWay = 4500;
    }
    baseOneWay += 1500; // Apapa surcharge
  }
  // Standard Zone Logic
  else if (zone1 === zone2) {
    baseOneWay = 2500;
  } else if (
    (zone1 === "mainland" && zone2 === "central") ||
    (zone1 === "central" && zone2 === "mainland")
  ) {
    baseOneWay = 3500;
  } else if (
    (zone1 === "central" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "central")
  ) {
    baseOneWay = 4500;
  } else if (
    (zone1 === "mainland" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "mainland")
  ) {
    baseOneWay = 8000;
  }

  // Double for round trip and round to nearest ₦500
  const roundTrip = baseOneWay * 2;
  return Math.round(roundTrip / 500) * 500;
}

export function normalizeAreaSlug(input: string): string {
  if (!input) return "";
  const s = input.toLowerCase().trim();
  if (s === "lekki" || s === "lekki 1" || s === "lekki-phase-1" || s === "77777777-7777-7777-7777-777777777777") return "lekki-phase-1";
  if (s === "vi" || s === "victoria island" || s === "victoria-island" || s === "88888888-8888-8888-8888-888888888888") return "vi";
  if (s === "yaba" || s === "33333333-3333-3333-3333-333333333333") return "yaba";
  if (s === "ikeja" || s === "11111111-1111-1111-1111-111111111111") return "ikeja";
  if (s === "surulere" || s === "44444444-4444-4444-4444-444444444444") return "surulere";
  if (s === "ikoyi" || s === "99999999-9999-9999-9999-999911111111") return "ikoyi";
  if (s === "gbagada" || s === "22222222-2222-2222-2222-222222222222") return "gbagada";
  if (s === "agege" || s === "66666666-6666-6666-6666-666666666666") return "agege";
  if (s === "ogudu" || s === "55555555-5555-5555-5555-555555555555") return "ogudu";
  return s;
}

export function isSpotInArea(spot: Spot, targetArea: string): boolean {
  if (!targetArea || targetArea === "Anywhere" || targetArea === "anywhere") return true;
  
  const normalizedTarget = normalizeAreaSlug(targetArea);
  const spotAreaSlug = normalizeAreaSlug(spot.areas?.slug || spot.address_slug || spot.area_id || "");

  return spotAreaSlug === normalizedTarget;
}

const CATEGORY_MAP: Record<string, string[]> = {
  "Eat and drink": ["restaurant", "bar", "cafe"],
  "Activity and fun": ["activity", "entertainment", "experience"],
  "Nature and outdoors": ["nature", "beach"]
};

export function getAllowedCategories(categoryGroup: string | undefined): string[] | null {
  if (!categoryGroup || categoryGroup === "Anywhere") return null;
  return CATEGORY_MAP[categoryGroup] ?? null;
}

/**
 * forgePlans — Deterministic Matching Engine
 *
 * SCORING WEIGHTS (do not change without sign-off + test coverage):
 *
 *  costScore        = (1 - |budget - totalCost| / budget) × 80
 *                     Rewards plans that spend the budget well. Max: 80pts.
 *
 *  vibeScore        = min(matchingVibeTagCount × 5, 10)
 *                     Rewards spots with multiple vibe signal matches. Max: 10pts.
 *
 *  featuredBoost    = spot.is_featured ? 30 : 0
 *                     Monetization policy. DO NOT CHANGE without product sign-off.
 *                     Source: CLAUDE.md §Non-Negotiable Invariants #5.
 *
 *  confidenceBoost  = (computed_confidence_score / 100) × 20
 *                     Rewards spots with high-quality pricing evidence. Max: 20pts.
 *                     Backed by confidenceEngine.ts (freshness, source trust, volume).
 *
 *  statusBoost      = deterministic signal from operational_status:
 *                     'fresh'              → +25  (verified ≤30 days, confidence ≥85)
 *                     'community_verified' → +20  (3+ independent receipt submitters)
 *                     'owner_verified'     → +30  (venue owner submitted prices)
 *                     'verified'           →   0  (standard confirmed)
 *                     'stale'              → -20  (last verified >90 days ago)
 *                     'needs_review'       → -40  (confidence <40, conflicting data)
 *                     'incomplete'         → -30  (menu data missing key categories)
 *
 *  idWeight         = hash(spot.id first segment) % 10
 *                     Deterministic pseudo-variation. Breaks identical-score ties.
 *
 *  pinnedBoost      = spot.id === pinnedSpotId ? 1000 : 0
 *                     User-selected spot always wins. Non-negotiable invariant.
 *
 * COST CALCULATION (Phase 3A correction):
 *
 *  activityCost = spot.price_per_person × squadSize
 *
 *  In Phase 2, the spots VIEW maps venues.derived_typical_cost → price_per_person.
 *  derived_typical_cost already includes VAT and service charge via pricingEngine.ts.
 *  The previous 1.1 has_food buffer was a double-tax: it applied a 10% markup on top
 *  of a cost that already embedded real tax rules. Removed in Phase 3A.
 *
 *  Transport = spot.transport_matrix[startArea] ?? calculateZoneFare(startArea, spot.address_slug)
 */
const ADJACENT_ZONES: Record<string, string[]> = {
  mainland: ["mainland", "central"],
  central: ["central", "mainland", "island"],
  island: ["island", "central"],
  other: ["other", "central"],
};

export function getZoneForArea(areaStr: string): string {
  if (!areaStr) return "other";
  const slug = areaStr.toLowerCase().trim();
  if (ZONES[slug]) return ZONES[slug];
  if (slug.includes("yaba") || slug.includes("surulere") || slug.includes("ebute")) return "central";
  if (slug.includes("lekki") || slug.includes("vi") || slug.includes("victoria") || slug.includes("ikoyi")) return "island";
  if (slug.includes("ikeja") || slug.includes("gbagada") || slug.includes("ogudu") || slug.includes("maryland") || slug.includes("agege")) return "mainland";
  if (slug.includes("apapa")) return "other";
  return "other";
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
  return `${estMins} mins from ${originName} • +₦${transportCost.toLocaleString()} transport`;
}

/**
 * PRIMARY RESULTS (strict, hard filter):
 * Filters candidates ONLY to spots in selectedArea.
 * Score and rank ONLY within that filtered set. No cross-area substitution.
 */
export function getPrimaryAreaMatches(input: ForgeInput, allSpots: Spot[]): Plan[] {
  const { startArea, vibe, pinnedSpotId, categoryGroup, daypart } = input;
  const hasSpecificArea = Boolean(startArea && startArea !== "Anywhere" && startArea !== "anywhere");

  const candidates = allSpots.filter((spot) => {
    // Daypart Filter
    if (daypart && daypart !== "Any time") {
      const cat = spot.category || "restaurant";
      const duration = spot.typical_duration_hours || 0;

      if (daypart === "Morning") {
        if (["bar", "entertainment", "beach"].includes(cat)) return false;
      } else if (daypart === "Night") {
        if (["nature", "beach"].includes(cat)) return false;
        if (cat === "activity" && duration > 2) return false;
      }
    }

    // Category Group Filter
    if (categoryGroup && categoryGroup !== "Anywhere") {
      const allowedCategories = CATEGORY_MAP[categoryGroup] || [];
      const spotCategory = spot.category || "restaurant";
      if (!allowedCategories.includes(spotCategory)) return false;
    }

    // STRICT LOCATION FILTER — NO CROSS-AREA SUBSTITUTION
    if (hasSpecificArea && !isSpotInArea(spot, startArea)) {
      if (spot.id !== pinnedSpotId) return false;
    }

    // Vibe filter
    if (spot.id === pinnedSpotId) return true;
    return spot.vibe_tags.includes(vibe);
  });

  return scoreAndRankSpots(candidates, input, false);
}

/**
 * ADJACENT ZONE MATCHES:
 * Searches ONLY same or adjacent zone (using zone mapping). Never random cross-city jumps.
 * Only surfaces candidates in other areas tagged explicitly with isAdjacentZoneSuggestion: true.
 */
export function getAdjacentZoneMatches(
  input: ForgeInput,
  allSpots: Spot[],
  primaryPlans: Plan[] = []
): Plan[] {
  const { startArea, vibe, pinnedSpotId, categoryGroup, daypart } = input;

  if (!startArea || startArea === "anywhere" || startArea === "Anywhere") {
    return [];
  }

  const originZone = getZoneForArea(startArea);
  const allowedZones = ADJACENT_ZONES[originZone] || [originZone];

  const candidates = allSpots.filter((spot) => {
    // Must NOT be in the selected area itself (primary area candidates handled separately)
    if (isSpotInArea(spot, startArea)) return false;

    // Must be in same or adjacent zone
    const spotAreaSlug = spot.address_slug || spot.areas?.slug || "";
    const spotZone = getZoneForArea(spotAreaSlug);
    if (!allowedZones.includes(spotZone)) return false;

    // Daypart Filter
    if (daypart && daypart !== "Any time") {
      const cat = spot.category || "restaurant";
      const duration = spot.typical_duration_hours || 0;

      if (daypart === "Morning") {
        if (["bar", "entertainment", "beach"].includes(cat)) return false;
      } else if (daypart === "Night") {
        if (["nature", "beach"].includes(cat)) return false;
        if (cat === "activity" && duration > 2) return false;
      }
    }

    // Category Group Filter
    if (categoryGroup && categoryGroup !== "Anywhere") {
      const allowedCategories = CATEGORY_MAP[categoryGroup] || [];
      const spotCategory = spot.category || "restaurant";
      if (!allowedCategories.includes(spotCategory)) return false;
    }

    // Vibe filter
    if (spot.id === pinnedSpotId) return true;
    return spot.vibe_tags.includes(vibe);
  });

  const adjacentPlans = scoreAndRankSpots(candidates, input, true);

  return adjacentPlans.slice(0, 2);
}

function scoreAndRankSpots(candidates: Spot[], input: ForgeInput, isAdjacent: boolean): Plan[] {
  const { startArea, squadSize, budget, vibe, pinnedSpotId } = input;

  const scoredSpots = candidates
    .map((spot) => {
      const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;
      const rawTransport = spot.transport_matrix?.[startArea] ?? calculateZoneFare(startArea, spot.address_slug || "ikeja");
      const transportCost = Math.max(1500, rawTransport);
      const totalCost = activityCost + transportCost;

      return { spot, activityCost, transportCost, totalCost };
    })
    .filter(({ transportCost, totalCost }) => {
      if (transportCost > budget * BudgetPolicy.maxTransportBudgetRatio) return false;
      if (totalCost > budget) return false;
      return true;
    })
    .map(({ spot, activityCost, transportCost, totalCost }) => {
      // SCORING ALGORITHM
      const costScore = (1 - Math.abs(budget - totalCost) / budget) * 80;
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);
      const featuredBoost = spot.is_featured ? 30 : 0;
      const idWeight =
        spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
      const confidenceScore = Number(spot.computed_confidence_score || 50.00);
      const confidenceBoost = (confidenceScore / 100) * 20;

      let statusBoost = 0;
      const status = spot.verified_by || 'verified';
      if (status === 'fresh')              statusBoost = 25;
      else if (status === 'community_verified') statusBoost = 20;
      else if (status === 'owner_verified')     statusBoost = 30;
      else if (status === 'stale')              statusBoost = -20;
      else if (status === 'needs_review')       statusBoost = -40;
      else if (status === 'incomplete')         statusBoost = -30;

      const pinnedBoost = spot.id === pinnedSpotId ? 1000 : 0;

      const totalScore =
        costScore +
        vibeScore +
        featuredBoost +
        idWeight +
        pinnedBoost +
        confidenceBoost +
        statusBoost;

      const whyItFits = generateWhyItFits(spot, vibe, totalCost, budget);
      const priceSource = spot.price_source || 'historical_estimate';
      const sourceLabel = formatPriceSource(priceSource);
      const travelInfo = isAdjacent 
        ? formatTravelInfo(startArea, spot.address_slug || spot.areas?.slug || "ikeja", transportCost)
        : undefined;

      const explanation = {
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
      };

      const tempPlan: Plan = {
        spot,
        foodCost: activityCost,
        transportCost,
        totalCost,
        whyItFits
      };
      
      const generatedTitle = formatPlanTitle(tempPlan, input);
      const generatedSubtitle = formatPlanSubtitle(tempPlan, input);
      const generatedSummary = formatDecisionSummary(tempPlan, input);
      const decisionConfidence = evaluateDecisionConfidence(spot, transportCost);

      return {
        spot,
        foodCost: activityCost,
        transportCost,
        totalCost,
        whyItFits,
        explanation,
        score: totalScore,
        title: generatedTitle,
        subtitle: generatedSubtitle,
        decisionConfidence,
        decisionSummary: generatedSummary,
        isAdjacentZoneSuggestion: isAdjacent,
        travelInfo
      };
    });

  const sortedPlans = scoredSpots.sort((a, b) => b.score - a.score);

  if (!isAdjacent) {
    try {
      supabase.from('plan_requests').insert({
        start_area: startArea,
        squad_size: squadSize,
        budget: budget,
        vibe: vibe,
        results_count: sortedPlans.length,
        top_spot_id: sortedPlans[0]?.spot.id || null
      }).then();
    } catch {}
  }

  return sortedPlans.slice(0, 3).map(({ spot, foodCost, transportCost, totalCost, whyItFits, explanation, title, subtitle, decisionConfidence, decisionSummary, isAdjacentZoneSuggestion, travelInfo }) => ({
    spot,
    foodCost,
    transportCost,
    totalCost,
    whyItFits,
    explanation,
    title,
    subtitle,
    decisionConfidence,
    decisionSummary,
    isAdjacentZoneSuggestion,
    travelInfo
  }));
}

/**
 * forgePlans — Main Matching Entrypoint
 * Calls getPrimaryAreaMatches to deliver strict location-first matching.
 */
export function forgePlans(input: ForgeInput, allSpots: Spot[]): Plan[] {
  return getPrimaryAreaMatches(input, allSpots);
}

/**
 * applyPlanAdjustment
 * 
 * Takes an original forge input and an adjustment patch, returning the new deterministic input.
 * (This generic architecture supports D1 Budget simulator and future D4 Remix constraints).
 */
export function applyPlanAdjustment(input: ForgeInput, adjustment: PlanAdjustment): ForgeInput {
  return {
    ...input,
    ...adjustment
  };
}

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

/**
 * Formats a price source identifier into a human-readable label.
 * Consumes price_source from the spots VIEW (venues.last_price_source).
 */
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

/**
 * Builds a human-readable tax label from spot category.
 * When Phase 2 venue tax fields are surfaced via spots VIEW, this will
 * read actual vat_pct/service_charge_pct. Currently uses category defaults.
 */
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

function timeAgo(dateString?: string): string {
  if (!dateString) return "recently";
  try {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  } catch {
    return "recently";
  }
}

export type OptionAvailability = "recommended" | "possible" | "unavailable";

export interface OptionStatus {
  status: OptionAvailability;
  reason?: string;
}

export interface AvailableOptionsResult {
  areas: Record<string, OptionStatus>;
  squadSizes: Record<string, OptionStatus>;
  vibes: Record<string, OptionStatus>;
}

export function getAvailableOptions(
  allSpots: Spot[],
  selections: {
    budget?: number;
    startArea?: string;
    squadSize?: number;
    vibe?: string;
  }
): AvailableOptionsResult {
  const { budget, startArea, squadSize } = selections;

  const result: AvailableOptionsResult = {
    areas: {},
    squadSizes: {},
    vibes: {}
  };

  const maxRatio = BudgetPolicy.maxTransportBudgetRatio;

  // 1. Evaluate Area recommendation based on budget
  if (budget !== undefined) {
    const areasList = ["ikeja", "gbagada", "yaba", "surulere", "ogudu", "agege", "lekki-phase-1", "vi", "ikoyi", "maryland", "ebute-metta", "apapa"];
    areasList.forEach(areaSlug => {
      let bestStatus: OptionAvailability = "unavailable";

      allSpots.forEach(spot => {
        if (!spot.active) return;
        const transportCost = spot.transport_matrix?.[areaSlug] ?? calculateZoneFare(areaSlug, spot.address_slug || "ikeja");
        
        if (transportCost <= budget * maxRatio && spot.price_per_person + transportCost <= budget) {
          bestStatus = "recommended";
        } else if (spot.price_per_person + transportCost <= budget * 1.3) {
          if ((bestStatus as string) !== "recommended") {
            bestStatus = "possible";
          }
        }
      });

      result.areas[areaSlug] = {
        status: bestStatus,
        reason: (bestStatus as string) === "possible" ? "Might exceed budget" : (bestStatus as string) === "unavailable" ? "Exceeds budget bounds" : undefined
      };
    });
  }

  // 2. Evaluate Squad Size recommendation based on budget and startArea
  if (budget !== undefined && startArea && startArea !== "Anywhere") {
    const squadOptions = ["1", "2", "4", "6"];
    squadOptions.forEach(sizeStr => {
      const size = Number(sizeStr);
      let bestStatus: OptionAvailability = "unavailable";

      allSpots.forEach(spot => {
        if (!spot.active) return;
        const transportCost = spot.transport_matrix?.[startArea] ?? calculateZoneFare(startArea, spot.address_slug || "ikeja");

        if (transportCost <= budget * maxRatio && (spot.price_per_person * size) + transportCost <= budget) {
          bestStatus = "recommended";
        } else if ((spot.price_per_person * size) + transportCost <= budget * 1.3) {
          if ((bestStatus as string) !== "recommended") {
            bestStatus = "possible";
          }
        }
      });

      result.squadSizes[sizeStr] = {
        status: bestStatus,
        reason: (bestStatus as string) === "possible" ? "Might exceed budget" : (bestStatus as string) === "unavailable" ? `Exceeds ₦${Math.round(budget / 1000)}k budget` : undefined
      };
    });
  }

  // 3. Evaluate Vibe recommendation based on budget, startArea, and squadSize
  if (budget !== undefined && startArea && startArea !== "Anywhere" && squadSize !== undefined) {
    const vibeOptions = ["Dinner", "Chill", "Foodie", "Party", "Quick", "Brunch"];
    vibeOptions.forEach(v => {
      let bestStatus: OptionAvailability = "unavailable";

      allSpots.forEach(spot => {
        if (!spot.active) return;
        if (!spot.vibe_tags.includes(v)) return;
        const transportCost = spot.transport_matrix?.[startArea] ?? calculateZoneFare(startArea, spot.address_slug || "ikeja");

        if (transportCost <= budget * maxRatio && (spot.price_per_person * squadSize) + transportCost <= budget) {
          bestStatus = "recommended";
        } else if ((spot.price_per_person * squadSize) + transportCost <= budget * 1.3) {
          if ((bestStatus as string) !== "recommended") {
            bestStatus = "possible";
          }
        }
      });

      result.vibes[v] = {
        status: bestStatus,
        reason: (bestStatus as string) === "possible" ? "Might exceed budget" : (bestStatus as string) === "unavailable" ? "Need higher budget for this vibe" : undefined
      };
    });
  }

  return result;
}

export function generateRecoverySuggestions(
  input: ForgeInput,
  allSpots: Spot[]
): RecoverySuggestion[] {
  const { startArea, squadSize, budget, vibe } = input;
  const maxRatio = BudgetPolicy.maxTransportBudgetRatio;

  const suggestions: RecoverySuggestion[] = [];

  const getSpotCost = (spot: Spot, origin: string) => {
    const transportCost = spot.transport_matrix?.[origin] ?? calculateZoneFare(origin, spot.address_slug || "ikeja");
    const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;
    return {
      totalCost: activityCost + transportCost,
      transportCost
    };
  };

  // 1. Calculate Increase Budget suggestion
  if (startArea) {
    const matchingVibeSpots = allSpots.filter(spot => spot.active && spot.vibe_tags.includes(vibe));
    const costs = matchingVibeSpots
      .map(spot => {
        const { totalCost, transportCost } = getSpotCost(spot, startArea);
        return { spot, totalCost, transportCost };
      })
      .filter(({ transportCost, totalCost }) => transportCost <= totalCost * maxRatio);

    if (costs.length > 0) {
      costs.sort((a, b) => a.totalCost - b.totalCost);
      const targetIndex = Math.min(2, costs.length - 1);
      const targetCost = costs[targetIndex].totalCost;
      
      if (targetCost > budget) {
        const delta = Math.ceil((targetCost - budget) / 500) * 500;
        const unlockedCount = costs.filter(c => c.totalCost <= budget + delta).length;
        suggestions.push({
          type: "IncreaseBudget",
          deltaBudget: delta,
          unlockedVenueCount: unlockedCount
        });
      }
    }
  }

  // 2. Calculate Switch Area suggestion
  if (startArea) {
    const areasList = ["ikeja", "gbagada", "yaba", "surulere", "ogudu", "agege", "lekki-phase-1", "vi", "ikoyi", "maryland", "ebute-metta", "apapa"];
    const otherAreas = areasList.filter(a => a !== startArea);
    
    let bestArea = "";
    let bestCount = 0;

    otherAreas.forEach(areaSlug => {
      const count = allSpots.filter(spot => {
        if (!spot.active || !spot.vibe_tags.includes(vibe)) return false;
        const { totalCost, transportCost } = getSpotCost(spot, areaSlug);
        return transportCost <= budget * maxRatio && totalCost <= budget;
      }).length;

      if (count > bestCount) {
        bestCount = count;
        bestArea = areaSlug;
      }
    });

    if (bestCount > 0 && bestArea) {
      const areaName = bestArea.charAt(0).toUpperCase() + bestArea.slice(1).replace("-", " ");
      suggestions.push({
        type: "SwitchArea",
        suggestedArea: areaName,
        unlockedVenueCount: bestCount
      });
    }
  }

  // 3. Calculate Change Vibe suggestion
  if (startArea) {
    const vibeOptions = ["Dinner", "Chill", "Foodie", "Party", "Quick", "Brunch"];
    const otherVibes = vibeOptions.filter(v => v !== vibe);

    let bestVibe = "";
    let bestCount = 0;

    otherVibes.forEach(v => {
      const count = allSpots.filter(spot => {
        if (!spot.active || !spot.vibe_tags.includes(v)) return false;
        const { totalCost, transportCost } = getSpotCost(spot, startArea);
        return transportCost <= budget * maxRatio && totalCost <= budget;
      }).length;

      if (count > bestCount) {
        bestCount = count;
        bestVibe = v;
      }
    });

    if (bestCount > 0 && bestVibe) {
      suggestions.push({
        type: "ChangeVibe",
        suggestedVibe: bestVibe,
        unlockedVenueCount: bestCount
      });
    }
  }

  return suggestions;
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


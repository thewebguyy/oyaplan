import { Spot, ForgeInput, Plan } from '../../types';
import { supabase } from '../../supabase';

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
export function forgePlans(input: ForgeInput, allSpots: Spot[]): Plan[] {
  const { startArea, squadSize, budget, vibe, pinnedSpotId, categoryGroup, daypart } = input;

  // 1. Filter and Score
  const scoredSpots = allSpots
    .filter((spot) => {
      // Daypart Filter
      if (daypart && daypart !== "Any time") {
        const cat = spot.category || "restaurant";
        const duration = spot.typical_duration_hours || 0;

        if (daypart === "Morning") {
          // Morning: cafe, restaurant, nature, experience, activity. Exclude bar, entertainment, beach.
          if (["bar", "entertainment", "beach"].includes(cat)) return false;
        } else if (daypart === "Night") {
          // Night: bar, restaurant, entertainment, experience. Exclude nature, beach, activity > 2hrs.
          if (["nature", "beach"].includes(cat)) return false;
          if (cat === "activity" && duration > 2) return false;
        }
        // Afternoon and Evening allow all categories
      }

      // Category Group Filter
      if (categoryGroup && categoryGroup !== "Anywhere") {
        const allowedCategories = CATEGORY_MAP[categoryGroup] || [];
        const spotCategory = spot.category || "restaurant";
        if (!allowedCategories.includes(spotCategory)) return false;
      }

      // Must match vibe tag OR be the pinned spot
      if (spot.id === pinnedSpotId) return true;
      if (!spot.vibe_tags.includes(vibe)) return false;
      return true;
    })
    .map((spot) => {
      // COST CALCULATION
      // price_per_person = derived_typical_cost (via spots VIEW).
      // Phase 2 pricingEngine already applies VAT + service charge.
      // No buffer multiplier here — that was double-counting tax.
      const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;

      // Transport: matrix override takes precedence over zone formula
      const transportCost =
        spot.transport_matrix?.[startArea] ??
        calculateZoneFare(startArea, spot.address_slug || "ikeja");

      const totalCost = activityCost + transportCost;

      return { spot, activityCost, transportCost, totalCost };
    })
    .filter(({ transportCost, totalCost }) => {
      // Transport must be ≤35% of budget (prevents transport-heavy plans)
      if (transportCost > budget * 0.35) return false;
      // Total must not exceed budget
      if (totalCost > budget) return false;
      return true;
    })
    .map(({ spot, activityCost, transportCost, totalCost }) => {
      // SCORING ALGORITHM — see header comment for weight documentation

      // Cost score: rewards good budget utilisation (max 80pts)
      const costScore = (1 - Math.abs(budget - totalCost) / budget) * 80;

      // Vibe score: rewards multi-vibe matches (max 10pts)
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);

      // Featured boost: monetization policy (30pts). DO NOT CHANGE without sign-off.
      const featuredBoost = spot.is_featured ? 30 : 0;

      // Deterministic tie-breaker from ID hash (0–9pts)
      const idWeight =
        spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

      // Confidence boost: trust signal from pricing evidence quality (max 20pts)
      const confidenceScore = Number(spot.computed_confidence_score || 50.00);
      const confidenceBoost = (confidenceScore / 100) * 20;

      // Status boost: deterministic ranking signal from operational_status
      // (mapped from venues.operational_status via spots VIEW → verified_by column)
      let statusBoost = 0;
      const status = spot.verified_by || 'verified';
      if (status === 'fresh')              statusBoost = 25;
      else if (status === 'community_verified') statusBoost = 20;
      else if (status === 'owner_verified')     statusBoost = 30;
      else if (status === 'stale')              statusBoost = -20;
      else if (status === 'needs_review')       statusBoost = -40;
      else if (status === 'incomplete')         statusBoost = -30;
      // 'verified' → 0 (baseline, no adjustment)

      // Pinned boost: user-selected spot always wins (1000pts)
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

      // Explainability: surfaces backend intelligence to the UI
      // All values are read from existing backend fields — no new calculations here.
      const priceSource = spot.price_source || 'historical_estimate';
      const sourceLabel = formatPriceSource(priceSource);
      const explanation = {
        budget_fit: `Fits ₦${budget.toLocaleString()} squad budget`,
        freshness: spot.price_updated_at
          ? `Prices updated ${timeAgo(spot.price_updated_at)}`
          : 'Estimated from historical data',
        confidence: `${Math.round(confidenceScore)}% data confidence`,
        tax_transparency: buildTaxLabel(spot),
      };

      // Attach source label to explanation so PlanCard can render it
      // Phase 3B: Consume pre-hydrated methodology and timeline from the spot
      const fullExplanation = {
        ...explanation,
        source_label: sourceLabel,
        confidence_score: Math.round(confidenceScore),
        status,
        methodology: spot.methodology || [],
        timeline: spot.timeline || []
      };

      return {
        spot,
        foodCost: activityCost,
        transportCost,
        totalCost,
        whyItFits,
        explanation: fullExplanation,
        score: totalScore
      };
    });

  // Sort by score descending
  const sortedPlans = scoredSpots.sort((a, b) => b.score - a.score);

  // Analytics: fire-and-forget insert (does not block plan generation)
  try {
    supabase.from('plan_requests').insert({
      start_area: startArea,
      squad_size: squadSize,
      budget: budget,
      vibe: vibe,
      results_count: sortedPlans.length,
      top_spot_id: sortedPlans[0]?.spot.id || null
    }).then(); // Fire and forget
  } catch {
    // Silent: analytics failure must never affect plan delivery
  }

  // Return top 1–3 results
  return sortedPlans.slice(0, 3).map(({ spot, foodCost, transportCost, totalCost, whyItFits, explanation }) => ({
    spot,
    foodCost,
    transportCost,
    totalCost,
    whyItFits,
    explanation
  }));
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

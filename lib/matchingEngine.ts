import { Spot, ForgeInput, Plan } from './types';
import { supabase } from './supabase';

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
 */
export function calculateZoneFare(origin: string, destination: string): number {
  if (origin === destination) return 1200;
  
  const zone1 = ZONES[origin] || "other";
  const zone2 = ZONES[destination] || "other";
  
  let baseOneWay = 0;
  
  // Apapa (Other) Logic
  if (zone1 === "other" || zone2 === "other") {
    const nonApapaZone = zone1 === "other" ? zone2 : zone1;
    if (nonApapaZone === "other") { // Apapa to Apapa different area (hypothetical)
      baseOneWay = 2500;
    } else if (nonApapaZone === "central") {
      baseOneWay = 2500; // Like same zone
    } else if (nonApapaZone === "mainland") {
      baseOneWay = 3500; // Like Central to Mainland
    } else if (nonApapaZone === "island") {
      baseOneWay = 4500; // Like Central to Island
    }
    baseOneWay += 1500; // Surcharge
  } 
  // Standard Zone Logic
  else if (zone1 === zone2) {
    baseOneWay = 2500;
  } else if ((zone1 === "mainland" && zone2 === "central") || (zone1 === "central" && zone2 === "mainland")) {
    baseOneWay = 3500;
  } else if ((zone1 === "central" && zone2 === "island") || (zone1 === "island" && zone2 === "central")) {
    baseOneWay = 4500;
  } else if ((zone1 === "mainland" && zone2 === "island") || (zone1 === "island" && zone2 === "mainland")) {
    baseOneWay = 8000;
  }

  // Double for round trip and round to nearest 500
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
          // Night: bar, restaurant, entertainment, experience. Exclude nature, beach, activity > 2.
          if (["nature", "beach"].includes(cat)) return false;
          if (cat === "activity" && duration > 2) return false;
        }
        // Afternoon and Evening allow all
      }

      // Category Group Filter (runs before others)
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
      // Calculate base cost based on spot properties
      const isFoodSpot = spot.has_food !== false;
      const buffer = isFoodSpot ? 1.1 : 1.0;
      const activityCost = Math.round((spot.price_per_person * squadSize * buffer) / 100) * 100;
      
      // Transport Cost: Matrix override or Zone Formula
      const transportCost = spot.transport_matrix?.[startArea] ?? calculateZoneFare(startArea, spot.address_slug || "ikeja");
      
      const totalCost = activityCost + transportCost;

      return { spot, activityCost, transportCost, totalCost };
    })
    .filter(({ transportCost, totalCost }) => {
      // Transport cost must be <= 35% of budget
      if (transportCost > budget * 0.35) return false;
      // Total cost must not exceed budget
      if (totalCost > budget) return false;
      return true;
    })
    .map(({ spot, activityCost, transportCost, totalCost }) => {
      // Scoring Algorithm
      const costScore = (1 - Math.abs(budget - totalCost) / budget) * 80;
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);
      const featuredBoost = spot.is_featured ? 30 : 0;
      const idWeight = spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

      // Trust Signals Ranking Boosts (Deterministic)
      const confidenceScore = Number(spot.computed_confidence_score || 50.00);
      const confidenceBoost = (confidenceScore / 100) * 20; // up to +20 points

      let statusBoost = 0;
      const status = spot.verified_by || 'verified';
      if (status === 'fresh') statusBoost = 25;
      else if (status === 'community_verified') statusBoost = 20;
      else if (status === 'owner_verified') statusBoost = 30;
      else if (status === 'stale') statusBoost = -20;
      else if (status === 'needs_review') statusBoost = -40;
      else if (status === 'incomplete') statusBoost = -30;

      // Pinned Spot Boost
      const pinnedBoost = spot.id === pinnedSpotId ? 1000 : 0;

      const totalScore = costScore + vibeScore + featuredBoost + (idWeight / 1) + pinnedBoost + confidenceBoost + statusBoost;
      const whyItFits = generateWhyItFits(spot, vibe, totalCost, budget);

      // Explainability details mapping
      const explanation = {
        budget_fit: `Fits ₦${budget.toLocaleString()} squad budget`,
        freshness: `Prices verified ${spot.price_updated_at ? timeAgo(spot.price_updated_at) : 'recently'}`,
        confidence: `${Math.round(confidenceScore)}% data confidence`,
        tax_transparency: `Includes ${spot.category === 'restaurant' || spot.category === 'bar' ? '7.5% VAT' : 'local entry fees'}`
      };

      return {
        spot,
        foodCost: activityCost,
        transportCost,
        totalCost,
        whyItFits,
        explanation,
        score: totalScore
      };
    });

  // Sort by score descending
  const sortedPlans = scoredSpots.sort((a, b) => b.score - a.score);

  // 2. Logging (Fire and Forget)
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
    // Silent swallow
  }

  // Return top 1-3
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



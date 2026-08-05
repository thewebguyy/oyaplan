import { Spot, ForgeInput, Plan, PlanAdjustment, RecoverySuggestion } from '../../types';
import { supabase } from '../../supabase';
import { BudgetPolicy } from './budgetPolicy';
import { PlanningEngine, createPlanningContext } from '../../planning/planningEngine';
import { DefaultRecoveryEngine } from '../../planning/recoveryEngine';
import { calculateZoneFare } from '../../planning/transport';

// Re-export common utilities so existing files/tests don't break
export { calculateZoneFare } from '../../planning/transport';
export { normalizeAreaSlug, isSpotInArea, getZoneForArea } from '../../planning/utils';
export { formatTravelInfo } from '../../planning/explainability';

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
 * forgePlans — Main Matching Entrypoint (Facade)
 */
export function forgePlans(input: ForgeInput, allSpots: Spot[]): Plan[] {
  return getPrimaryAreaMatches(input, allSpots);
}

/**
 * PRIMARY RESULTS (Facade)
 */
export function getPrimaryAreaMatches(input: ForgeInput, allSpots: Spot[]): Plan[] {
  const request = {
    startArea: input.startArea,
    squadSize: input.squadSize,
    budget: input.budget,
    vibe: input.vibe,
    pinnedSpotId: input.pinnedSpotId,
    categoryGroup: input.categoryGroup,
    daypart: input.daypart,
    transportMode: input.transportMode,
  };

  const context = createPlanningContext(request);
  const domainPlans = PlanningEngine(context, undefined, allSpots, false);

  // Record plan requests in fire-and-forget Supabase call (Forge Analytics parity)
  const sortedPlans = domainPlans.map(p => ({
    ...p,
    foodCost: p.activityCost
  }));

  try {
    supabase.from('plan_requests').insert({
      start_area: input.startArea,
      squad_size: input.squadSize,
      budget: input.budget,
      vibe: input.vibe,
      results_count: sortedPlans.length,
      top_spot_id: sortedPlans[0]?.spot.id || null
    }).then();
  } catch {}

  return sortedPlans.slice(0, 3);
}

/**
 * ADJACENT ZONE MATCHES (Facade)
 */
export function getAdjacentZoneMatches(
  input: ForgeInput,
  allSpots: Spot[],
  _primaryPlans: Plan[] = []
): Plan[] {
  const request = {
    startArea: input.startArea,
    squadSize: input.squadSize,
    budget: input.budget,
    vibe: input.vibe,
    pinnedSpotId: input.pinnedSpotId,
    categoryGroup: input.categoryGroup,
    daypart: input.daypart,
    isAdjacent: true,
    transportMode: input.transportMode,
  };

  const context = createPlanningContext(request);
  const domainPlans = PlanningEngine(context, undefined, allSpots, true);

  return domainPlans.slice(0, 2).map(p => ({
    ...p,
    foodCost: p.activityCost
  }));
}

/**
 * applyPlanAdjustment (Facade)
 */
export function applyPlanAdjustment(input: ForgeInput, adjustment: PlanAdjustment): ForgeInput {
  return {
    ...input,
    ...adjustment
  };
}

/**
 * generateRecoverySuggestions (Facade)
 */
export function generateRecoverySuggestions(
  input: ForgeInput,
  allSpots: Spot[]
): RecoverySuggestion[] {
  const request = {
    startArea: input.startArea,
    squadSize: input.squadSize,
    budget: input.budget,
    vibe: input.vibe,
    pinnedSpotId: input.pinnedSpotId,
    categoryGroup: input.categoryGroup,
    daypart: input.daypart,
    transportMode: input.transportMode,
  };

  const context = createPlanningContext(request);
  const recoveryEngine = new DefaultRecoveryEngine();
  return recoveryEngine.run(allSpots, context);
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

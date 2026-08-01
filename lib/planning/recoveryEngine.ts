import { Spot, RecoverySuggestion } from '../types';
import { PlanningContext, RecoveryEngine } from './types';
import { calculateZoneFare } from './transport';
import { BudgetPolicy } from '../services/matching/budgetPolicy';

export class DefaultRecoveryEngine implements RecoveryEngine {
  run(spots: Spot[], context: PlanningContext): RecoverySuggestion[] {
    const { startArea, squadSize, budget, vibe } = context.request;
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
      const matchingVibeSpots = spots.filter(spot => spot.active && spot.vibe_tags.includes(vibe));
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
        const count = spots.filter(spot => {
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
        const count = spots.filter(spot => {
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
}

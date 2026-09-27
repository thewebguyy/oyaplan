import { CostedPlan, PlanningContext, ConstraintEngine } from './types';
import { BudgetPolicy } from '../services/matching/budgetPolicy';

export class DefaultConstraintEngine implements ConstraintEngine {
  run(plans: CostedPlan[], context: PlanningContext): CostedPlan[] {
    const { budget } = context.request;

    return plans.filter(({ spot, transportCost, totalCost }) => {
      // Pinned spots explicitly selected by user must never be dropped by constraint filtering
      if (spot.id === context.request.pinnedSpotId) return true;
      if (transportCost > budget * BudgetPolicy.maxTransportBudgetRatio) return false;
      if (totalCost > budget) return false;
      return true;
    });
  }
}

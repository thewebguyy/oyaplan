import { PlanningCandidate, PlanningContext, CostedPlan, CostEngine, TransportProvider } from './types';

export class DefaultCostEngine implements CostEngine {
  run(candidates: PlanningCandidate[], context: PlanningContext, transportProvider: TransportProvider): CostedPlan[] {
    const { startArea, squadSize } = context.request;
    const areaKey = startArea || "ikeja";

    return candidates.map(({ spot }) => {
      // Scale activity cost linearly with squad size
      const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;
      
      // Estimate transport cost using the provided transport provider
      const transportCost = transportProvider.estimate(
        areaKey, 
        spot.address_slug || "ikeja", 
        spot.transport_matrix
      );
      
      const totalCost = activityCost + transportCost;

      return {
        spot,
        activityCost,
        transportCost,
        totalCost
      };
    });
  }
}

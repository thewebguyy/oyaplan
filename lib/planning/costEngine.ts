import { PlanningCandidate, PlanningContext, CostedPlan, CostEngine, TransportProvider } from './types';
import { TransportPricingProvider, TransportConfidenceProvider, TransportDisplayFormatter } from './transport';

export class DefaultCostEngine implements CostEngine {
  run(candidates: PlanningCandidate[], context: PlanningContext, transportProvider: TransportProvider): CostedPlan[] {
    const { startArea, squadSize, transportMode = "ride-hailing" } = context.request;
    const areaKey = startArea || "ikeja";

    return candidates.map(({ spot }) => {
      // Scale activity cost linearly with squad size
      const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;
      
      const destinationKey = spot.address_slug || "ikeja";
      const hasOverride = Boolean(spot.transport_matrix && spot.transport_matrix[areaKey]);

      const range = TransportPricingProvider.calculateRange(
        areaKey,
        destinationKey,
        transportMode,
        spot.transport_matrix
      );

      const confidence = TransportConfidenceProvider.evaluate(
        areaKey,
        destinationKey,
        transportMode,
        hasOverride
      );

      const assumptions = TransportDisplayFormatter.formatAssumptions(areaKey, transportMode);

      // We use internal midpointCost for totalCost & budget constraint checks
      const transportCost = range.midpointCost;
      const totalCost = activityCost + transportCost;

      return {
        spot,
        activityCost,
        transportCost,
        transportMinCost: range.minCost,
        transportMaxCost: range.maxCost,
        transportMode,
        transportConfidenceScore: confidence.score,
        transportConfidenceLabel: confidence.label,
        transportConfidenceBadgeColor: confidence.badgeColor,
        transportAssumptions: assumptions,
        totalCost
      };
    });
  }
}

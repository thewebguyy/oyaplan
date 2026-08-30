import { PlanningCandidate, PlanningContext, CostedPlan, CostEngine, TransportProvider } from './types';
import { TransportPricingProvider, TransportConfidenceProvider, TransportDisplayFormatter, getDepartureBucket } from './transport';

export class DefaultCostEngine implements CostEngine {
  run(candidates: PlanningCandidate[], context: PlanningContext, transportProvider: TransportProvider): CostedPlan[] {
    const { startArea, squadSize, transportMode = "ride-hailing" } = context.request;
    const areaKey = startArea || "ikeja";

    return candidates.map(({ spot }) => {
      // Scale activity cost linearly with squad size
      const activityCost = Math.round((spot.price_per_person * squadSize) / 100) * 100;
      
      const destinationKey = spot.address_slug || "ikeja";

      // Route overrides (legacy fake precision) have been removed per launch mandate.
      // We rely 100% on the canonical TransportPricingProvider.
      const range = TransportPricingProvider.calculateRange(
        areaKey,
        destinationKey,
        transportMode,
        spot.transport_matrix,
        context.request.departureAt,
        squadSize
      );
      const hasOverride = false;
      const confidenceScore: number | undefined = undefined;

      const confidence = TransportConfidenceProvider.evaluate(
        areaKey,
        destinationKey,
        transportMode,
        hasOverride,
        context.request.departureAt,
        confidenceScore
      );

      const assumptions = TransportDisplayFormatter.formatAssumptions(areaKey, transportMode, context.request.departureAt);

      // We use internal midpointCost for totalCost & budget constraint checks
      const transportCost = range.midpointCost;
      const totalCost = activityCost + transportCost;

      const transportEstimate = TransportPricingProvider.calculateEstimate(
        areaKey,
        destinationKey,
        squadSize,
        transportMode,
        spot.transport_matrix,
        context.request.departureAt
      );

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
        totalCost,
        transportEstimate
      };
    });
  }
}

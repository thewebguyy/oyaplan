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

      // 1. Resolve route override from the contextual routeOverrides dictionary using spot's area_id
      const override = context.request.routeOverrides?.[spot.area_id];

      let range;
      let hasOverride = false;
      let confidenceScore: number | undefined = undefined;

      if (override) {
        hasOverride = true;
        confidenceScore = Number(override.confidence);
        // If override is present, use its low/high bounds directly
        range = {
          minCost: override.low,
          maxCost: override.high,
          midpointCost: Math.round((override.low + override.high) / 2)
        };
      } else {
        range = TransportPricingProvider.calculateRange(
          areaKey,
          destinationKey,
          transportMode,
          spot.transport_matrix,
          context.request.departureAt
        );
      }

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

      const transportEstimate = {
        low: range.minCost,
        high: range.maxCost,
        mode: transportMode,
        origin: areaKey,
        destination: destinationKey,
        departure_assumption: getDepartureBucket(context.request.departureAt),
        calculation_version: "2026-v1"
      };

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

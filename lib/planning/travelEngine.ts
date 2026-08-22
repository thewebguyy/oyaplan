import { RankedPlan, TravelledPlan, PlanningContext } from "./types";
import { TravelEstimator } from "../travel/types";

export interface TravelEngine {
  run(plans: RankedPlan[], context: PlanningContext, travelEstimator?: TravelEstimator): TravelledPlan[];
}

export class DefaultTravelEngine implements TravelEngine {
  /**
   * The TravelEngine enriches recommendations only.
   * It MUST NOT reorder, remove, or influence ranked results.
   */
  run(plans: RankedPlan[], context: PlanningContext, travelEstimator?: TravelEstimator): TravelledPlan[] {
    if (!travelEstimator || !context.origin?.gpsCoordinates) {
      return plans;
    }

    const originCoords = context.origin.gpsCoordinates;

    return plans.map((plan) => {
      const destCoords = plan.spot.coordinates || {
        lat: 6.4474,
        lng: 3.4723
      };

      try {
        const estimate = travelEstimator.estimateTravel(originCoords, destCoords, context.request.departureAt);
        return {
          ...plan,
          travelEstimate: estimate
        };
      } catch (err) {
        console.error(`Failed to estimate travel for spot: ${plan.spot.name}`, err);
        return plan;
      }
    });
  }
}

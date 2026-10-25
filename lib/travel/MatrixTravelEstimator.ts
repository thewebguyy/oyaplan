import { Coordinates } from "../location/types";
import { TravelEstimate, TravelEstimator } from "./types";
import { LocationService as LocationDataService } from "@/lib/services/LocationService";
import { calculateZoneFare } from "@/lib/planning/transport";
import { LocationService } from "../location/LocationService";
import { isLagosWeekdayRushHour } from "../utils/lagosTime";

export class MatrixTravelEstimator implements TravelEstimator {
  estimateTravel(origin: Coordinates, destination: Coordinates, departureAt?: Date): TravelEstimate {
    // 1. Calculate distance via Haversine
    const distanceKm = LocationDataService.calculateDistance(origin, destination);

    // 2. Resolve closest planning areas for transport cost lookup
    const originArea = LocationService.getClosestPlanningArea(origin);
    const destinationArea = LocationService.getClosestPlanningArea(destination);
    const transportCost = calculateZoneFare(originArea.id, destinationArea.id);

    // 3. Compute ETA
    // Peak is judged in Lagos time, never the host's timezone.
    const isPeakHour = isLagosWeekdayRushHour(departureAt ?? new Date());

    const speedKmH = isPeakHour ? 12 : 25;
    const baseMinutes = Math.ceil((distanceKm / speedKmH) * 60);
    const estimatedMinutes = Math.max(5, baseMinutes + 5);

    let confidence: "high" | "medium" | "low" = "low";
    if (distanceKm < 3) {
      confidence = "high";
    } else if (distanceKm < 9) {
      confidence = "medium";
    }

    return {
      distanceKm,
      estimatedMinutes,
      transportCost,
      mode: "car",
      confidence,
      source: "matrix"
    };
  }
}

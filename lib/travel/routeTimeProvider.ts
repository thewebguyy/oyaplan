import { Coordinates } from "../location/types";
import { LocationService } from "@/lib/services/LocationService";

export interface RouteTimeEstimate {
  distanceKm: number;
  durationMinutes: number;
  source: "base" | "osrm";
}

export interface RouteTimeProvider {
  estimate(origin: Coordinates, destination: Coordinates): Promise<RouteTimeEstimate>;
}

export class BaseRouteTimeProvider implements RouteTimeProvider {
  async estimate(origin: Coordinates, destination: Coordinates): Promise<RouteTimeEstimate> {
    const distanceKm = LocationService.calculateDistance(origin, destination);

    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isPeakHour = !isWeekend && ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 20));

    const speedKmH = isPeakHour ? 12 : 25;
    const baseMinutes = Math.ceil((distanceKm / speedKmH) * 60);
    const durationMinutes = Math.max(5, baseMinutes + 5);

    return {
      distanceKm,
      durationMinutes,
      source: "base",
    };
  }
}

export class OSRMRouteTimeProvider implements RouteTimeProvider {
  private fallbackProvider = new BaseRouteTimeProvider();

  async estimate(origin: Coordinates, destination: Coordinates): Promise<RouteTimeEstimate> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // Strict 1.0s timeout contract

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.fallbackProvider.estimate(origin, destination);
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route || typeof route.distance !== "number" || typeof route.duration !== "number") {
        return this.fallbackProvider.estimate(origin, destination);
      }

      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(5, Math.ceil(route.duration / 60));

      return {
        distanceKm,
        durationMinutes,
        source: "osrm",
      };
    } catch {
      clearTimeout(timeoutId);
      return this.fallbackProvider.estimate(origin, destination);
    }
  }
}

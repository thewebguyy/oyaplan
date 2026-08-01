import { Coordinates } from "../location/types";

export interface TravelEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  transportCost: number;
  mode: "car";
  confidence: "high" | "medium" | "low";
  source: "matrix" | "google" | "mapbox";
}

export interface TravelEstimator {
  estimateTravel(origin: Coordinates, destination: Coordinates): TravelEstimate;
}

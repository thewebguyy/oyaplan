import { Spot } from "@/lib/types";
import { CHAIN_VIBE_SEQS } from "@/lib/config/chainVibes";
import { LocationService } from "./LocationService";

export interface ChainStopPlan {
  spot: Spot;
  allocatedBudget: number;
  actualCost: number;
}

export interface ChainPlanResult {
  stops: ChainStopPlan[];
  totalTransportCost: number;
  totalOutingCost: number;
  isWithinBudget: boolean;
}

/**
 * allocateBudgetAcrossStops
 * Splits a total budget across stops based on sequence profile weights.
 */
export function allocateBudgetAcrossStops(
  totalBudget: number,
  sequenceKey: string,
  stopCount: number
): number[] {
  const cfg = CHAIN_VIBE_SEQS[sequenceKey];
  if (!cfg) {
    // Equal distribution fallback
    const val = Math.round(totalBudget / stopCount);
    return Array(stopCount).fill(val);
  }

  // Adjust weights for the actual requested stop count
  const weights = cfg.budgetWeights.slice(0, stopCount);
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // Re-normalize weights to sum to 1.0
  const normalized = weights.map((w) => w / weightSum);

  return normalized.map((w) => Math.round(totalBudget * w));
}

/**
 * sequenceStopsGeographically
 * Reorders a list of candidate spots to minimize total travel distance starting from user's area.
 */
export function sequenceStopsGeographically(
  spots: Spot[],
  startCoords: { lat: number; lng: number }
): Spot[] {
  const unvisited = [...spots];
  const ordered: Spot[] = [];
  let currentCoords = startCoords;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const spot = unvisited[i];
      if (spot.coordinates) {
        const dist = LocationService.calculateDistance(currentCoords, spot.coordinates);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }
    }

    const nextSpot = unvisited.splice(nearestIdx, 1)[0];
    ordered.push(nextSpot);
    if (nextSpot.coordinates) {
      currentCoords = nextSpot.coordinates;
    }
  }

  return ordered;
}

/**
 * generateChainPlan
 * Takes candidates, structures sequence, runs geographic ordering, and outputs total estimate.
 */
export function generateChainPlan(
  startAreaSlug: string,
  totalBudget: number,
  sequenceKey: string,
  candidateSpots: Spot[],
  squadSize: number
): ChainPlanResult {
  const startArea = LocationService.getVerifiedAreas().find((a) => a.id === startAreaSlug);
  const startCoords = startArea?.coordinates ?? { lat: 6.4474, lng: 3.4723 }; // default Lekki

  // 1. Allocate budget per stop
  const allocations = allocateBudgetAcrossStops(totalBudget, sequenceKey, candidateSpots.length);

  // 2. Sequence candidate spots geographically to reduce transport costs
  const sequenced = sequenceStopsGeographically(candidateSpots, startCoords);

  // 3. Assemble stops and calculate actual transport increments
  let currentCoords = startCoords;
  let totalTransportCost = 0;

  const stops = sequenced.map((spot, i) => {
    const allocated = allocations[i] ?? 0;
    const foodCost = spot.price_per_person * squadSize;

    // Transport calculation to this stop
    let legDistance = 0;
    if (spot.coordinates) {
      legDistance = LocationService.calculateDistance(currentCoords, spot.coordinates);
      currentCoords = spot.coordinates;
    }

    // Base Leg cost: ₦300 per km + ₦1500 base fare
    const legTransportCost = Math.round((1500 + legDistance * 300) / 100) * 100;
    totalTransportCost += legTransportCost;

    return {
      spot,
      allocatedBudget: allocated,
      actualCost: foodCost,
    };
  });

  const totalOutingCost = stops.reduce((sum, s) => sum + s.actualCost, 0) + totalTransportCost;

  return {
    stops,
    totalTransportCost,
    totalOutingCost,
    isWithinBudget: totalOutingCost <= totalBudget,
  };
}
export function getChainPlannerDetails(): string {
  return "Geographic sequencing service active";
}

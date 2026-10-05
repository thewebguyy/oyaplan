import { TransportProvider } from './types';
import { getTransportProfile, TransportMode } from './transportProfiles';
import {
  getTemporaryTransportEstimate,
  classifyDestinationZone,
  TEMPORARY_TRANSPORT_RULES,
  MAINLAND_TRANSPORT_ESTIMATE,
  ISLAND_TRANSPORT_ESTIMATE,
  TransportZone
} from './temporaryTransport';

export {
  getTemporaryTransportEstimate,
  classifyDestinationZone,
  TEMPORARY_TRANSPORT_RULES,
  MAINLAND_TRANSPORT_ESTIMATE,
  ISLAND_TRANSPORT_ESTIMATE
};
export type { TransportZone };

const ZONES: Record<string, string> = {
  // Mainland
  ikeja: "mainland",
  gbagada: "mainland",
  ogudu: "mainland",
  agege: "mainland",
  maryland: "mainland",
  alimosho: "mainland",
  oshodi: "mainland",
  ogba: "mainland",
  ketu: "mainland",
  ojodu: "mainland",
  mushin: "mainland",
  bariga: "mainland",
  shomolu: "mainland",

  // Central
  yaba: "central",
  surulere: "central",
  "ebute-metta": "central",

  // Island
  "lekki-phase-1": "island",
  lekki: "island",
  "lekki-phase-2": "island",
  vi: "island",
  "victoria-island": "island",
  ikoyi: "island",
  "lagos-island": "island",
  "isale-eko": "island",
  ajah: "island",
  chevron: "island",
  sangotedo: "island",
  "eti-osa": "island",

  // Other / Outlying
  apapa: "other",
  festac: "other",
  ikorodu: "other",
  badagry: "other",
  epe: "other",
};

/**
 * Departure time bucket for transport estimate assumptions.
 * Pure function — depends only on the provided departure time.
 */
export type DepartureBucket = "off-peak" | "peak" | "late-night";

export function getDepartureBucket(departureAt?: Date): DepartureBucket {
  const d = departureAt ?? new Date();
  const hour = d.getHours();
  const day = d.getDay();
  const isWeekend = day === 0 || day === 6;

  // Weekday rush hours
  if (!isWeekend && ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 20))) {
    return "peak";
  }
  // Friday/Saturday nights
  if ((day === 5 || day === 6) && hour >= 20) {
    return "peak";
  }
  // Late night (low supply)
  if (hour >= 23 || hour < 5) {
    return "late-night";
  }
  return "off-peak";
}

/**
 * Canonical Zone Fare
 * Returns total outing transport cost in Naira according to the temporary deterministic rule:
 * Mainland outings = ₦5,000
 * Island outings = ₦10,000
 */
export function calculateZoneFare(origin: string, destination: string, _partySize: number = 1): number {
  return getTemporaryTransportEstimate(destination).cost;
}

export interface TransportRange {
  status: "available" | "unavailable";
  reason?: "NO_ROUTE_DATA";
  minCost: number;
  maxCost: number;
  midpointCost: number;
  costPerPerson?: number;
  minCostPerPerson?: number;
  maxCostPerPerson?: number;
  surgeMultiplier?: number;
}

export interface TransportEstimate {
  status: "available" | "unavailable";
  reason?: "NO_ROUTE_DATA";
  low: number;
  high: number;
  midpointCost: number;
  costPerPerson?: number;
  minCostPerPerson?: number;
  maxCostPerPerson?: number;
  surgeMultiplier?: number;
  mode: TransportMode;
  origin: string;
  destination: string;
  partySize: number;
  vehicleCapacity: number;
  vehiclesRequired: number;
  departureAssumption: DepartureBucket;
  departure_assumption?: DepartureBucket;
  isCrossWater: boolean;
  calculationVersion: string;
  calculation_version?: string;
}

export interface ConfidenceEvaluation {
  score: number; // 0-100
  label: string;
  badgeColor: "green" | "yellow" | "orange";
}

export class TransportPricingProvider {
  static calculateRange(
    origin: string,
    destination: string,
    mode: TransportMode = "ride-hailing",
    _defaultMatrix?: Record<string, number>,
    _departureAt?: Date,
    partySize: number = 1
  ): TransportRange {
    const normOrigin = origin?.toLowerCase().trim();
    const normDest = destination?.toLowerCase().trim();

    if ((normOrigin === "anywhere" || !normOrigin) && (normDest === "anywhere" || !normDest || normDest === "unknown")) {
      return {
        status: "unavailable",
        reason: "NO_ROUTE_DATA",
        minCost: 0,
        maxCost: 0,
        midpointCost: 0,
        costPerPerson: 0,
        minCostPerPerson: 0,
        maxCostPerPerson: 0,
        surgeMultiplier: 1.0,
      };
    }

    const estimate = getTemporaryTransportEstimate(destination);
    const totalCost = estimate.cost;
    const validParty = Math.max(1, partySize);
    const costPerPerson = Math.round(totalCost / validParty);

    return { 
      status: "available", 
      minCost: totalCost, 
      maxCost: totalCost, 
      midpointCost: totalCost,
      costPerPerson,
      minCostPerPerson: costPerPerson,
      maxCostPerPerson: costPerPerson,
      surgeMultiplier: 1.0
    };
  }

  static calculateEstimate(
    origin: string,
    destination: string,
    partySize: number = 1,
    mode: TransportMode = "ride-hailing",
    defaultMatrix?: Record<string, number>,
    departureAt?: Date
  ): TransportEstimate {
    const range = this.calculateRange(origin, destination, mode, defaultMatrix, departureAt, partySize);
    const zone = classifyDestinationZone(destination);
    const originZone = classifyDestinationZone(origin);
    const isCrossWater = zone !== originZone;
    const validParty = Math.max(1, partySize);

    return {
      status: range.status,
      reason: range.reason,
      low: range.minCost,
      high: range.maxCost,
      midpointCost: range.midpointCost,
      costPerPerson: range.costPerPerson,
      minCostPerPerson: range.minCostPerPerson,
      maxCostPerPerson: range.maxCostPerPerson,
      surgeMultiplier: 1.0,
      mode,
      origin,
      destination,
      partySize: validParty,
      vehicleCapacity: 4,
      vehiclesRequired: 1,
      departureAssumption: "off-peak",
      departure_assumption: "off-peak",
      isCrossWater,
      calculationVersion: "temporary-zone-v1",
      calculation_version: "temporary-zone-v1"
    };
  }
}

export class TransportConfidenceProvider {
  static evaluate(
    origin: string,
    destination: string,
    mode: TransportMode,
    hasVenueOverride: boolean = false,
    departureAt?: Date,
    overrideScore?: number
  ): ConfidenceEvaluation {
    if (overrideScore !== undefined) {
      const score = overrideScore;
      if (score >= 80) {
        return { score, label: "High confidence", badgeColor: "green" };
      } else if (score >= 50) {
        return { score, label: "Typical estimate", badgeColor: "yellow" };
      } else {
        return { score, label: "Allow extra travel time", badgeColor: "orange" };
      }
    }

    return { score: 90, label: "Deterministic zone estimate", badgeColor: "green" };
  }
}

export class TransportDisplayFormatter {
  static formatRange(minCost: number, maxCost: number): string {
    if (minCost === maxCost) {
      return `₦${minCost.toLocaleString()}`;
    }
    return `₦${minCost.toLocaleString()} – ₦${maxCost.toLocaleString()}`;
  }

  static formatAssumptions(destination: string, _mode?: TransportMode, _departureAt?: Date): string {
    const estimate = getTemporaryTransportEstimate(destination);
    return `${estimate.label} (${estimate.zoneLabel} zone: ₦${estimate.cost.toLocaleString()}) • ${estimate.disclaimer}`;
  }
}

export class MatrixTransportProvider implements TransportProvider {
  estimate(origin: string, destination: string, _defaultMatrix?: Record<string, number>): number {
    return getTemporaryTransportEstimate(destination).cost;
  }
}

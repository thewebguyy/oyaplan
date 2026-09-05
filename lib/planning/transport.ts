import { TransportProvider } from './types';
import { getTransportProfile, TransportMode } from './transportProfiles';

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
 * Deterministic Lagos 2026 Zone Fare Formula
 * Returns round-trip cost in Naira with party size vehicle capacity modeling.
 */
export function calculateZoneFare(origin: string, destination: string, partySize: number = 1): number {
  const normOrigin = origin?.toLowerCase().trim() || "ikeja";
  const normDest = destination?.toLowerCase().trim() || "ikeja";

  const zone1 = ZONES[normOrigin] || (normOrigin === "anywhere" ? "anywhere" : "other");
  const zone2 = ZONES[normDest] || "other";

  let baseOneWayPerVehicle = 3000;

  if (normOrigin === "anywhere") {
    baseOneWayPerVehicle = 3500;
  } else if (normOrigin === normDest) {
    baseOneWayPerVehicle = 3000;
  } else if (zone1 === "other" || zone2 === "other") {
    const nonApapaZone = zone1 === "other" ? zone2 : zone1;
    if (nonApapaZone === "other") {
      baseOneWayPerVehicle = 3500;
    } else if (nonApapaZone === "central") {
      baseOneWayPerVehicle = 4000;
    } else if (nonApapaZone === "mainland") {
      baseOneWayPerVehicle = 4500;
    } else if (nonApapaZone === "island") {
      baseOneWayPerVehicle = 6000;
    }
    baseOneWayPerVehicle += 1500; // Apapa / outlying zone surcharge
  } else if (zone1 === zone2) {
    baseOneWayPerVehicle = 3500;
  } else if (
    (zone1 === "mainland" && zone2 === "central") ||
    (zone1 === "central" && zone2 === "mainland")
  ) {
    baseOneWayPerVehicle = 4500;
  } else if (
    (zone1 === "central" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "central")
  ) {
    baseOneWayPerVehicle = 5500;
  } else if (
    (zone1 === "mainland" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "mainland")
  ) {
    baseOneWayPerVehicle = 8500;
  }

  const vehicleCapacity = 4;
  const vehiclesRequired = Math.max(1, Math.ceil(partySize / vehicleCapacity));

  // Round trip fare = one-way * 2 * vehiclesRequired
  const roundTripTotal = baseOneWayPerVehicle * 2 * vehiclesRequired;
  return Math.round(roundTripTotal / 500) * 500;
}

export interface TransportRange {
  status: "available" | "unavailable";
  reason?: "NO_ROUTE_DATA";
  minCost: number;
  maxCost: number;
  midpointCost: number;
}

export interface TransportEstimate {
  status: "available" | "unavailable";
  reason?: "NO_ROUTE_DATA";
  low: number;
  high: number;
  midpointCost: number;
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
    defaultMatrix?: Record<string, number>,
    departureAt?: Date,
    partySize: number = 1
  ): TransportRange {
    const profile = getTransportProfile(mode);
    const vehicleCapacity = mode === "public-transit" ? 1 : 4;
    const vehiclesRequired = mode === "public-transit" ? partySize : Math.max(1, Math.ceil(partySize / vehicleCapacity));

    const normOrigin = origin?.toLowerCase().trim() || "ikeja";
    const normDest = destination?.toLowerCase().trim() || "ikeja";
    const zone1 = ZONES[normOrigin];
    const zone2 = ZONES[normDest];

    const hasMatrixEntry = defaultMatrix && defaultMatrix[origin] !== undefined;

    // If no explicit matrix entry exists, and we lack geographical zone mapping for either point, it's missing data.
    if (!hasMatrixEntry && (normOrigin === "anywhere" || !zone1 || !zone2)) {
      return {
        status: "unavailable",
        reason: "NO_ROUTE_DATA",
        minCost: 0,
        maxCost: 0,
        midpointCost: 0
      };
    }

    let rawBase = 0;
    if (hasMatrixEntry) {
      rawBase = defaultMatrix[origin] * vehiclesRequired;
    } else {
      rawBase = calculateZoneFare(origin, destination, partySize);
    }
    
    // Scale base fare by mode multiplier; respect explicit 0 overrides in matrix
    const scaledBase = hasMatrixEntry && rawBase === 0 
      ? 0 
      : rawBase * profile.multiplier;

    const delta = scaledBase * profile.variancePercent;
    const minCost = scaledBase === 0 ? 0 : Math.floor((scaledBase - delta) / 500) * 500;
    const maxCost = scaledBase === 0 ? 0 : Math.ceil((scaledBase + delta) / 500) * 500;
    const midpointCost = Math.round(scaledBase / 500) * 500;

    return { status: "available", minCost, maxCost, midpointCost };
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
    const normOrigin = origin?.toLowerCase().trim() || "ikeja";
    const normDest = destination?.toLowerCase().trim() || "ikeja";
    const z1 = ZONES[normOrigin] || "other";
    const z2 = ZONES[normDest] || "other";
    const isCrossWater = (z1 === "mainland" && z2 === "island") || (z1 === "island" && z2 === "mainland");
    const vehicleCapacity = mode === "public-transit" ? 1 : 4;
    const vehiclesRequired = mode === "public-transit" ? partySize : Math.max(1, Math.ceil(partySize / vehicleCapacity));

    return {
      status: range.status,
      reason: range.reason,
      low: range.minCost,
      high: range.maxCost,
      midpointCost: range.midpointCost,
      mode,
      origin,
      destination,
      partySize,
      vehicleCapacity,
      vehiclesRequired,
      departureAssumption: getDepartureBucket(departureAt),
      departure_assumption: getDepartureBucket(departureAt),
      isCrossWater,
      calculationVersion: "2026-v2",
      calculation_version: "2026-v2"
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

    let score = 75; // Baseline typical score
    const normOrigin = origin?.toLowerCase().trim() || "ikeja";
    const normDest = destination?.toLowerCase().trim() || "ikeja";
    const z1 = ZONES[normOrigin] || "other";
    const z2 = ZONES[normDest] || "other";

    if (normOrigin === normDest) {
      score += 20; // Same area: high certainty
    } else if (z1 === z2) {
      score += 10; // Same zone
    } else if ((z1 === "mainland" && z2 === "island") || (z1 === "island" && z2 === "mainland")) {
      score -= 25; // Cross-city trips have higher traffic variance
    }

    // Override existence does NOT boost confidence.
    // Confidence should be based on freshness + verification source + report volume.
    // See Data Operations Manual: confidence requires 1 manual verification + 3 user-reported outcomes.

    if (mode === "public-transit") {
      score -= 5; // Transit schedules fluctuate slightly more
    }

    // Peak departure times reduce confidence — fare variability is higher
    const bucket = getDepartureBucket(departureAt);
    if (bucket === "peak") {
      score -= 10;
    } else if (bucket === "late-night") {
      score -= 5;
    }

    score = Math.min(100, Math.max(10, score));

    if (score >= 80) {
      return { score, label: "High confidence", badgeColor: "green" };
    } else if (score >= 50) {
      return { score, label: "Typical estimate", badgeColor: "yellow" };
    } else {
      return { score, label: "Allow extra travel time", badgeColor: "orange" };
    }
  }
}

export class TransportDisplayFormatter {
  static formatRange(minCost: number, maxCost: number): string {
    return `₦${minCost.toLocaleString()} – ₦${maxCost.toLocaleString()}`;
  }

  static formatAssumptions(origin: string, mode: TransportMode, departureAt?: Date): string {
    const profile = getTransportProfile(mode);
    const formattedArea = origin
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const bucket = getDepartureBucket(departureAt);
    const timeOfDayLabel = bucket === "peak"
      ? "Peak-time variability included"
      : bucket === "late-night"
        ? "Late-night variability included"
        : "Standard estimate";

    return `${profile.shortLabel} • ${timeOfDayLabel} • Leaving from ${formattedArea}`;
  }
}

export class MatrixTransportProvider implements TransportProvider {
  estimate(origin: string, destination: string, defaultMatrix?: Record<string, number>): number {
    const rawTransport = defaultMatrix?.[origin] ?? calculateZoneFare(origin, destination);
    return Math.max(1500, rawTransport);
  }
}

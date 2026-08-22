import { TransportProvider } from './types';
import { getTransportProfile, TransportMode } from './transportProfiles';

const ZONES: Record<string, string> = {
  ikeja: "mainland",
  gbagada: "mainland",
  ogudu: "mainland",
  agege: "mainland",
  maryland: "mainland",
  yaba: "central",
  surulere: "central",
  "ebute-metta": "central",
  "lekki-phase-1": "island",
  vi: "island",
  ikoyi: "island",
  apapa: "other",
  // Fallback pricing buckets only — not geographic identity assertions.
  // Used when no route-specific override exists.
  ajah: "island",
  chevron: "island",
  festac: "other",
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
 * Returns round-trip base cost in Naira, rounded to nearest ₦500.
 */
export function calculateZoneFare(origin: string, destination: string): number {
  if (origin === destination) return 1200;

  const zone1 = ZONES[origin] || "other";
  const zone2 = ZONES[destination] || "other";

  let baseOneWay = 0;

  // Apapa (Other) Logic
  if (zone1 === "other" || zone2 === "other") {
    const nonApapaZone = zone1 === "other" ? zone2 : zone1;
    if (nonApapaZone === "other") {
      baseOneWay = 2500;
    } else if (nonApapaZone === "central") {
      baseOneWay = 2500;
    } else if (nonApapaZone === "mainland") {
      baseOneWay = 3500;
    } else if (nonApapaZone === "island") {
      baseOneWay = 4500;
    }
    baseOneWay += 1500; // Apapa surcharge
  }
  // Standard Zone Logic
  else if (zone1 === zone2) {
    baseOneWay = 2500;
  } else if (
    (zone1 === "mainland" && zone2 === "central") ||
    (zone1 === "central" && zone2 === "mainland")
  ) {
    baseOneWay = 3500;
  } else if (
    (zone1 === "central" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "central")
  ) {
    baseOneWay = 4500;
  } else if (
    (zone1 === "mainland" && zone2 === "island") ||
    (zone1 === "island" && zone2 === "mainland")
  ) {
    baseOneWay = 8000;
  }

  // Double for round trip and round to nearest ₦500
  const roundTrip = baseOneWay * 2;
  return Math.round(roundTrip / 500) * 500;
}

export interface TransportRange {
  minCost: number;
  maxCost: number;
  midpointCost: number;
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
    departureAt?: Date
  ): TransportRange {
    const profile = getTransportProfile(mode);
    const rawBase = defaultMatrix?.[origin] ?? calculateZoneFare(origin, destination);
    
    // Scale base fare by mode multiplier, respecting ₦1,500 baseline threshold.
    // departureAt is threaded but no multiplier applied yet (P1, pending evidence).
    const scaledBase = Math.max(1500, rawBase * profile.multiplier);

    const delta = scaledBase * profile.variancePercent;
    const minCost = Math.max(500, Math.floor((scaledBase - delta) / 500) * 500);
    const maxCost = Math.ceil((scaledBase + delta) / 500) * 500;
    const midpointCost = Math.round(scaledBase);

    return { minCost, maxCost, midpointCost };
  }
}

export class TransportConfidenceProvider {
  static evaluate(
    origin: string,
    destination: string,
    mode: TransportMode,
    _hasVenueOverride: boolean = false,
    departureAt?: Date,
    overrideScore?: number
  ): ConfidenceEvaluation {
    let score = overrideScore ?? 75; // Baseline typical score

    if (overrideScore === undefined) {
      const z1 = ZONES[origin] || "other";
      const z2 = ZONES[destination] || "other";

      if (origin === destination) {
        score += 20; // Same area: high certainty
      } else if (z1 === z2) {
        score += 10; // Same zone
      } else if ((z1 === "mainland" && z2 === "island") || (z1 === "island" && z2 === "mainland")) {
        score -= 25; // Cross-city trips have higher traffic variance
      }
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

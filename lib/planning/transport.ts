import { TransportProvider } from './types';

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
  apapa: "other"
};

/**
 * Deterministic Lagos 2026 Zone Fare Formula
 * Returns round-trip cost in Naira, rounded to nearest ₦500.
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

export class MatrixTransportProvider implements TransportProvider {
  estimate(origin: string, destination: string, defaultMatrix?: Record<string, number>): number {
    const rawTransport = defaultMatrix?.[origin] ?? calculateZoneFare(origin, destination);
    return Math.max(1500, rawTransport);
  }
}

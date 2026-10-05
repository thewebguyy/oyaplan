/**
 * Canonical Temporary Transport Rules
 * 
 * MAINLAND: Transport estimate = ₦5,000 total for outing
 * ISLAND: Transport estimate = ₦10,000 total for outing
 * 
 * Strict Single Source of Truth for all consumer surfaces:
 * - Explore cards
 * - Venue details
 * - Planner
 * - Forge
 * - Plan results
 * - Outside Math / Total Outing Cost
 * - Plan cost breakdown
 * - Saved plans
 * - Shareable plans
 * - WhatsApp output
 * - Squad plans
 * - Host Pass
 */

export type TransportZone = "mainland" | "island";

export const TEMPORARY_TRANSPORT_RULES = {
  MAINLAND_COST: 5000,
  ISLAND_COST: 10000,
  DISCLAIMER: "Transport estimate based on destination zone.",
  LABEL: "Estimated transport",
} as const;

export const MAINLAND_TRANSPORT_ESTIMATE = TEMPORARY_TRANSPORT_RULES.MAINLAND_COST;
export const ISLAND_TRANSPORT_ESTIMATE = TEMPORARY_TRANSPORT_RULES.ISLAND_COST;

const ISLAND_KEYWORDS = [
  "island",
  "lekki",
  "lekki-phase-1",
  "lekki-phase-2",
  "vi",
  "victoria-island",
  "victoria island",
  "ikoyi",
  "ajah",
  "chevron",
  "sangotedo",
  "eti-osa",
  "eti osa",
  "isale-eko",
  "isale eko",
  "lagos-island",
  "lagos island",
  "banana island",
  "falomo",
  "oniru",
  "osapa",
  "elegushi"
];

/**
 * Classifies any area slug, name, or address string into exactly two zones:
 * MAINLAND (Yaba, Surulere, Ikeja, Maryland, Gbagada, Magodo, etc.)
 * ISLAND (Lekki, Victoria Island, Ikoyi, Ajah, etc.)
 */
export function classifyDestinationZone(destinationOrArea?: string | null): TransportZone {
  if (!destinationOrArea) return "mainland";
  const norm = destinationOrArea.toLowerCase().trim();
  
  for (const keyword of ISLAND_KEYWORDS) {
    if (norm === keyword || norm.includes(keyword)) {
      return "island";
    }
  }
  return "mainland";
}

/**
 * Single source of truth for transport estimates across OyaPlan.
 * Returns total transport cost for the outing (NOT per person).
 */
export function getTemporaryTransportEstimate(destinationOrArea?: string | null): {
  zone: TransportZone;
  cost: number;
  label: string;
  disclaimer: string;
  zoneLabel: string;
} {
  const zone = classifyDestinationZone(destinationOrArea);
  const cost = zone === "island" 
    ? TEMPORARY_TRANSPORT_RULES.ISLAND_COST 
    : TEMPORARY_TRANSPORT_RULES.MAINLAND_COST;
  
  return {
    zone,
    cost,
    label: TEMPORARY_TRANSPORT_RULES.LABEL,
    disclaimer: TEMPORARY_TRANSPORT_RULES.DISCLAIMER,
    zoneLabel: zone === "island" ? "Island" : "Mainland",
  };
}

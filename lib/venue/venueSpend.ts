/**
 * Canonical spend helpers for venue-level surfaces.
 *
 * Rules:
 *  - Never invent a price. Unknown venue cost is `null`, not a made-up number.
 *  - Group food total uses the same rounding as lib/planning/costEngine.ts
 *    (price_per_person * squad, rounded to nearest ₦100).
 *  - Venue-level totals EXCLUDE transport (it depends on where the user starts).
 */

export interface VenueCostSource {
  derived_typical_cost?: number | null;
}

/** Known typical per-person spend, or null when the venue has no priced data. */
export function knownPerPerson(venue: VenueCostSource): number | null {
  const v = venue.derived_typical_cost;
  return typeof v === "number" && v > 0 ? v : null;
}

/** Group food & drinks total — identical rounding to the planning cost engine. */
export function venueFoodTotal(perPerson: number, squad: number): number {
  return Math.round((perPerson * Math.max(1, squad)) / 100) * 100;
}

/**
 * Pre-fill budget for "Plan this venue" links. This is an editable starting
 * point for the planner (not a displayed venue price): food total rounded up to
 * the next ₦5,000 plus ₦5,000 headroom so transport doesn't instantly push a
 * pinned venue over the user's hard ceiling. Unknown cost -> planner default.
 */
export function suggestPlanBudget(perPerson: number | null, squad: number): number {
  if (perPerson === null) return 25000;
  const food = venueFoodTotal(perPerson, squad);
  return Math.ceil(food / 5000) * 5000 + 5000;
}

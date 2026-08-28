/**
 * OyaPlan Canonical Next-State CTA Vocabulary
 * 
 * Rules:
 * 1. CTAs describe the NEXT STATE, never the entity/venue.
 * 2. Venue name must sit above the CTA, never inside the button string.
 * 3. Never solve wrapping with smaller fonts; use standard responsive microcopy.
 */

export type CtaNextState = 
  | "start_planning"    // User has not started a plan (e.g. hero, planner widget, pill bar)
  | "view_plan"          // A plan already exists or exploring an alternative plan card
  | "choose_this"        // User is selecting a venue inside an active planning flow
  | "see_details";       // Informational exploration

export const CTA_LABELS: Record<CtaNextState, string> = {
  start_planning: "Start Planning",
  view_plan: "View Plan",
  choose_this: "Choose This",
  see_details: "See Details",
};

export function getCtaLabel(state: CtaNextState): string {
  return CTA_LABELS[state];
}

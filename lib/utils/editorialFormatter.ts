import { Plan, ForgeInput, ConfidenceEvidence, RecoverySuggestion } from "../types";

export function formatPlanTitle(plan: Plan, input: ForgeInput): string {
  const vibe = (input.vibe || "").toLowerCase();
  const daypart = (input.daypart || "").toLowerCase();
  const areaName = plan.spot.areas?.name || "Lagos";

  let theme = "Chill Outing";
  if (vibe === "brunch") theme = "Weekend Brunch";
  else if (vibe === "dinner") theme = "Date Night";
  else if (vibe === "party") theme = "Night Out";
  else if (vibe === "foodie") theme = "Serious Chop";
  else if (vibe === "quick") theme = "Quick Linkup";
  else if (vibe === "chill") theme = "Chill Outing";
  else if (daypart === "morning") theme = "Morning Outing";
  else if (daypart === "afternoon") theme = "Afternoon Outing";
  else if (daypart === "evening") theme = "Evening Outing";
  else if (daypart === "night") theme = "Night Out";

  return `${theme} in ${areaName}`;
}

export function formatPlanSubtitle(plan: Plan, input: ForgeInput): string {
  const vibe = (input.vibe || "").toLowerCase();
  let vibeLabel = "outing";
  if (vibe === "dinner") vibeLabel = "Date Night";
  else if (vibe === "chill") vibeLabel = "Chill Hangout";
  else if (vibe === "foodie") vibeLabel = "Serious Chop";
  else if (vibe === "party") vibeLabel = "Turn Up";
  else if (vibe === "quick") vibeLabel = "Quick Linkup";
  else if (vibe === "brunch") vibeLabel = "Weekend Brunch";

  const squadText = input.squadSize === 1 ? "1 person" : `${input.squadSize} people`;
  return `A verified ${vibeLabel.toLowerCase()} for ${squadText} at ${plan.spot.name}.`;
}

export function formatDecisionSummary(plan: Plan, input: ForgeInput): string {
  const diff = input.budget - plan.totalCost;
  const areaName = plan.spot.areas?.name || "Lagos";
  
  if (diff >= 0) {
    return `This is our strongest recommendation. It fits your budget comfortably, matches your preferred vibe, and locates you in ${areaName} with verified pricing.`;
  } else {
    return `An excellent alternative to fit your squad. It exceeds your budget limit slightly by ₦${Math.abs(diff).toLocaleString()}, but delivers high vibe accuracy at ${plan.spot.name}.`;
  }
}

export function formatConfidenceEvidence(evidence: ConfidenceEvidence): string {
  const labels: Record<ConfidenceEvidence, string> = {
    price_verified: "Pricing details vetted manually",
    menu_recent: "Real menu verified recently",
    transport_predictable: "Transit fare highly predictable",
    tax_buffer_applied: "VAT and service charge buffer included",
  };
  return labels[evidence] || "Verified by OyaPlan";
}

export function formatRecoverySuggestion(suggestion: RecoverySuggestion, currentAreaName?: string): string {
  const area = currentAreaName || "your start area";
  switch (suggestion.type) {
    case "IncreaseBudget":
      return `Increase your budget by ₦${(suggestion.deltaBudget || 0).toLocaleString()} to unlock ${suggestion.unlockedVenueCount} more verified places.`;
    case "SwitchArea":
      return `Starting from ${suggestion.suggestedArea || "another district"} instead of ${area} unlocks ${suggestion.unlockedVenueCount} matching venues within your budget.`;
    case "ChangeVibe":
      return `Try a ${suggestion.suggestedVibe || "different"} vibe to find ${suggestion.unlockedVenueCount} matching spots.`;
    default:
      return `Try adjusting your filters to expand choices.`;
  }
}

import { Plan, ForgeInput, ChangeEvaluation } from '../../../types';

export function changeEvaluator(
  currentPlan: Plan,
  previousPlan: Plan | undefined,
  input: ForgeInput
): ChangeEvaluation | undefined {
  if (!previousPlan) return undefined;

  const gained: string[] = [];
  const lost: string[] = [];
  const unchanged: string[] = [];

  // Budget change
  const budgetDiff = currentPlan.totalCost - previousPlan.totalCost;
  if (budgetDiff < 0) {
    gained.push(`Saves ₦${Math.abs(budgetDiff).toLocaleString()}`);
  } else if (budgetDiff > 0) {
    lost.push(`Costs ₦${budgetDiff.toLocaleString()} more`);
  } else {
    unchanged.push('Same total cost');
  }

  // Location change
  if (currentPlan.spot.area_id !== previousPlan.spot.area_id) {
    gained.push(`New area: ${currentPlan.spot.areas?.name || currentPlan.spot.area_id}`);
    lost.push(`Left ${previousPlan.spot.areas?.name || previousPlan.spot.area_id}`);
  } else {
    unchanged.push('Same area');
  }

  // Category/Vibe change (simplistic heuristic)
  if (currentPlan.spot.category !== previousPlan.spot.category) {
    gained.push(`Switched to ${currentPlan.spot.category}`);
  }

  if (gained.length === 0 && lost.length === 0) {
    unchanged.push('No meaningful changes.');
  }

  return { gained, lost, unchanged };
}

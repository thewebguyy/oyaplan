import { Plan, ForgeInput, ExclusionEvaluation } from '../../../types';

export function exclusionEvaluator(
  currentPlan: Plan,
  candidatePlans: Plan[],
  input: ForgeInput
): ExclusionEvaluation[] {
  // We want to explain why a few other venues weren't chosen.
  // The user said: limit to maximum two exclusions, take top N near-misses.
  
  const exclusions: ExclusionEvaluation[] = [];
  
  // Filter out the current plan from candidates
  const rejectedPlans = candidatePlans.filter(p => p.spot.id !== currentPlan.spot.id);

  // We assume candidatePlans are sorted by `score` or ranking.
  // Take the top 5 near-misses to evaluate.
  const topNearMisses = rejectedPlans.slice(0, 5);

  for (const nearMiss of topNearMisses) {
    if (exclusions.length >= 2) break;

    // Reason 1: Budget exceeded
    if (nearMiss.totalCost > input.budget) {
      exclusions.push({
        spotName: nearMiss.spot.name,
        reason: `Estimated total exceeds your ₦${input.budget.toLocaleString()} budget.`
      });
      continue;
    }

    // Reason 2: Outside area
    // In our simplified logic, if they specifically requested a pinned spot, everything else is excluded by definition, 
    // but typically area mismatch happens before ranking. If we somehow have an area mismatch:
    if (nearMiss.transportCost > input.budget * 0.35) {
      exclusions.push({
        spotName: nearMiss.spot.name,
        reason: 'Transport cost is too high from your start area.'
      });
      continue;
    }
    
    // Reason 3: Vibe mismatch
    if (!nearMiss.spot.vibe_tags.includes(input.vibe) && input.vibe) {
      exclusions.push({
        spotName: nearMiss.spot.name,
        reason: `Doesn't strongly match the requested ${input.vibe} vibe.`
      });
      continue;
    }

    // Reason 4: Lower score (fallback)
    // If it passed filters but just had a lower score
    exclusions.push({
      spotName: nearMiss.spot.name,
      reason: `Another option was a stronger overall fit for your criteria.`
    });
  }

  return exclusions;
}

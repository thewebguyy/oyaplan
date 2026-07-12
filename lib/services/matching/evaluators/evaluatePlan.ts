import { Plan, ForgeInput, PlanEvaluation } from '../../../types';
import { generateTrustSignals } from '../trustEvaluator';
import { changeEvaluator } from './changeEvaluator';
import { exclusionEvaluator } from './exclusionEvaluator';

export interface EvaluatePlanArgs {
  currentPlan: Plan;
  previousPlan?: Plan;
  candidatePlans: Plan[];
  input: ForgeInput;
}

export function evaluatePlan({
  currentPlan,
  previousPlan,
  candidatePlans,
  input
}: EvaluatePlanArgs): PlanEvaluation {
  
  // 1. Trust Evaluator
  const trustSignals = generateTrustSignals(currentPlan.spot, currentPlan.totalCost, input.budget);

  // 2. Change Evaluator (Only runs if there's a previous plan, e.g. after adjustment)
  const changes = previousPlan 
    ? changeEvaluator(currentPlan, previousPlan, input)
    : undefined;

  // 3. Exclusion Evaluator
  const exclusions = exclusionEvaluator(currentPlan, candidatePlans, input);

  return {
    plan: currentPlan,
    trustSignals,
    changes,
    exclusions
  };
}

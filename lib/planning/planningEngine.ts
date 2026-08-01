import { Spot } from '../types';
import { PlanningContext, ExplainedPlan, CandidateEngine, CostEngine, ConstraintEngine, RankingEngine, ExplainabilityEngine, PlanningRequest } from './types';
import { DefaultCandidateEngine } from './candidateEngine';
import { DefaultCostEngine } from './costEngine';
import { DefaultConstraintEngine } from './constraintEngine';
import { DefaultRankingEngine, DEFAULT_RANKING_CONFIG_V1 } from './rankingEngine';
import { DefaultExplainabilityEngine } from './explainability';
import { MatrixTransportProvider } from './transport';

export function PlanningEngineV1(
  context: PlanningContext,
  spots: Spot[],
  isAdjacent: boolean = false,
  engines?: {
    candidateEngine?: CandidateEngine;
    costEngine?: CostEngine;
    constraintEngine?: ConstraintEngine;
    rankingEngine?: RankingEngine;
    explainabilityEngine?: ExplainabilityEngine;
  }
): ExplainedPlan[] {
  const candidateEngine = engines?.candidateEngine ?? new DefaultCandidateEngine();
  const costEngine = engines?.costEngine ?? new DefaultCostEngine();
  const constraintEngine = engines?.constraintEngine ?? new DefaultConstraintEngine();
  const rankingEngine = engines?.rankingEngine ?? new DefaultRankingEngine();
  const explainabilityEngine = engines?.explainabilityEngine ?? new DefaultExplainabilityEngine();

  const candidates = candidateEngine.run(spots, context);
  const costed = costEngine.run(candidates, context);
  const constrained = constraintEngine.run(costed, context);
  const ranked = rankingEngine.run(constrained, context);
  
  return explainabilityEngine.run(ranked, context, isAdjacent);
}

export function createPlanningContext(
  request: PlanningRequest,
  rankingConfig = DEFAULT_RANKING_CONFIG_V1,
  transportProvider = new MatrixTransportProvider()
): PlanningContext {
  return {
    request,
    timestamp: Date.now(),
    rankingConfig,
    transportProvider
  };
}
export { DEFAULT_RANKING_CONFIG_V1 };

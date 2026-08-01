import { Spot } from '../types';
import { PlanningContext, ExplainedPlan, CandidateEngine, CostEngine, ConstraintEngine, RankingEngine, ExplainabilityEngine, PlanningRequest, TransportProvider } from './types';
import { DefaultCandidateEngine } from './candidateEngine';
import { DefaultCostEngine } from './costEngine';
import { DefaultConstraintEngine } from './constraintEngine';
import { DefaultRankingEngine, DEFAULT_RANKING_CONFIG_V1 } from './rankingEngine';
import { DefaultExplainabilityEngine } from './explainability';
import { MatrixTransportProvider } from './transport';
import { TravelEstimator } from '../travel/types';
import { MatrixTravelEstimator } from '../travel/MatrixTravelEstimator';
import { TravelEngine, DefaultTravelEngine } from './travelEngine';

export interface PlanningDependencies {
  transportProvider: TransportProvider;
  travelEstimator?: TravelEstimator;
}

export const DEFAULT_PLANNING_DEPS: PlanningDependencies = {
  transportProvider: new MatrixTransportProvider(),
  travelEstimator: new MatrixTravelEstimator()
};

export function PlanningEngine(
  context: PlanningContext,
  dependencies: PlanningDependencies = DEFAULT_PLANNING_DEPS,
  spots: Spot[],
  isAdjacent: boolean = false,
  engines?: {
    candidateEngine?: CandidateEngine;
    costEngine?: CostEngine;
    constraintEngine?: ConstraintEngine;
    rankingEngine?: RankingEngine;
    travelEngine?: TravelEngine;
    explainabilityEngine?: ExplainabilityEngine;
  }
): ExplainedPlan[] {
  const candidateEngine = engines?.candidateEngine ?? new DefaultCandidateEngine();
  const costEngine = engines?.costEngine ?? new DefaultCostEngine();
  const constraintEngine = engines?.constraintEngine ?? new DefaultConstraintEngine();
  const rankingEngine = engines?.rankingEngine ?? new DefaultRankingEngine();
  const travelEngine = engines?.travelEngine ?? new DefaultTravelEngine();
  const explainabilityEngine = engines?.explainabilityEngine ?? new DefaultExplainabilityEngine();

  const travelEstimator = dependencies.travelEstimator || new MatrixTravelEstimator();

  const candidates = candidateEngine.run(spots, context);
  const costed = costEngine.run(candidates, context, dependencies.transportProvider);
  const constrained = constraintEngine.run(costed, context);
  const ranked = rankingEngine.run(constrained, context);
  const travelled = travelEngine.run(ranked, context, travelEstimator);
  
  return explainabilityEngine.run(travelled, context, isAdjacent);
}

export function createPlanningContext(
  request: PlanningRequest,
  rankingConfig = DEFAULT_RANKING_CONFIG_V1
): PlanningContext {
  return {
    request,
    timestamp: Date.now(),
    rankingConfig
  };
}
export { DEFAULT_RANKING_CONFIG_V1 };
export { MatrixTransportProvider };

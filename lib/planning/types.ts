import { Spot, DecisionConfidence, PlanExplanation, RecoverySuggestion } from '../types';

export interface PlanningRequest {
  startArea?: string;
  squadSize: number;
  budget: number;
  vibe: string;
  pinnedSpotId?: string;
  categoryGroup?: string;
  daypart?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Any time';
  isAdjacent?: boolean;
}

export interface TransportProvider {
  estimate(origin: string, destination: string, defaultMatrix?: Record<string, number>): number;
}

export interface RankingConfig {
  version: string;
  budgetWeight: number;
  verificationWeight: number;
  confidenceWeight: number;
  trendingWeight: number;
  featuredWeight: number;
  pinnedWeight: number;
}

export interface PlanningContext {
  request: PlanningRequest;
  timestamp: number;
  rankingConfig: RankingConfig;
  transportProvider: TransportProvider;
}

// Stage 1: Filtered Spot (Spot + validation status check)
export interface PlanningCandidate {
  spot: Spot;
}

// Stage 2: Costed Plan
export interface CostedPlan {
  spot: Spot;
  activityCost: number;
  transportCost: number;
  totalCost: number;
}

// Stage 3: Ranked Plan (Costed + total Score computed)
export interface RankedPlan extends CostedPlan {
  score: number;
}

// Stage 4: Explained Plan (Complete domain plan structure)
export interface ExplainedPlan extends RankedPlan {
  whyItFits: string;
  title: string;
  subtitle: string;
  decisionConfidence: DecisionConfidence;
  decisionSummary: string;
  explanation: PlanExplanation;
  isAdjacentZoneSuggestion?: boolean;
  travelInfo?: string;
}

// Engine Interfaces
export interface CandidateEngine {
  run(spots: Spot[], context: PlanningContext): PlanningCandidate[];
}

export interface CostEngine {
  run(candidates: PlanningCandidate[], context: PlanningContext): CostedPlan[];
}

export interface ConstraintEngine {
  run(plans: CostedPlan[], context: PlanningContext): CostedPlan[];
}

export interface RankingEngine {
  run(plans: CostedPlan[], context: PlanningContext): RankedPlan[];
}

export interface ExplainabilityEngine {
  run(plans: RankedPlan[], context: PlanningContext, isAdjacent?: boolean): ExplainedPlan[];
}

export interface RecoveryEngine {
  run(spots: Spot[], context: PlanningContext): RecoverySuggestion[];
}


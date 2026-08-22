import { Spot, DecisionConfidence, PlanExplanation, RecoverySuggestion } from '../types';
import { TransportMode } from './transportProfiles';

export interface PlanningRequest {
  startArea?: string;
  squadSize: number;
  budget: number;
  vibe: string;
  pinnedSpotId?: string;
  categoryGroup?: string;
  daypart?: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Any time';
  isAdjacent?: boolean;
  transportMode?: TransportMode;
  departureAt?: Date;
  routeOverrides?: Record<string, { low: number; high: number; source: string; confidence: number }>;
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

import { Origin } from '../location/types';
import { TravelEstimate } from '../travel/types';

export interface PlanningContext {
  request: PlanningRequest;
  timestamp: number;
  rankingConfig: RankingConfig;
  origin?: Origin;
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
  transportMinCost?: number;
  transportMaxCost?: number;
  transportMode?: TransportMode;
  transportConfidenceScore?: number;
  transportConfidenceLabel?: string;
  transportConfidenceBadgeColor?: "green" | "yellow" | "orange";
  transportAssumptions?: string;
  totalCost: number;
}

// Stage 3: Ranked Plan (Costed + total Score computed)
export interface RankedPlan extends CostedPlan {
  score: number;
}

// Stage 3.5: Travelled Plan (Optional travel/ETA data bound post-ranking)
export interface TravelledPlan extends RankedPlan {
  travelEstimate?: TravelEstimate;
}

// Stage 4: Explained Plan (Complete domain plan structure)
export interface ExplainedPlan extends TravelledPlan {
  whyItFits: string;
  title: string;
  subtitle: string;
  decisionConfidence: DecisionConfidence;
  decisionSummary: string;
  explanation: PlanExplanation;
  isAdjacentZoneSuggestion?: boolean;
  travelInfo?: string;
  budgetRemaining?: number;
}

// Engine Interfaces
export interface CandidateEngine {
  run(spots: Spot[], context: PlanningContext): PlanningCandidate[];
}

export interface CostEngine {
  run(candidates: PlanningCandidate[], context: PlanningContext, transportProvider: TransportProvider): CostedPlan[];
}

export interface ConstraintEngine {
  run(plans: CostedPlan[], context: PlanningContext): CostedPlan[];
}

export interface RankingEngine {
  run(plans: CostedPlan[], context: PlanningContext): RankedPlan[];
}

export interface ExplainabilityEngine {
  run(plans: TravelledPlan[], context: PlanningContext, isAdjacent?: boolean): ExplainedPlan[];
}

export interface RecoveryEngine {
  run(spots: Spot[], context: PlanningContext): RecoverySuggestion[];
}


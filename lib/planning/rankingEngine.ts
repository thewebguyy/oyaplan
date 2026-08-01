import { CostedPlan, PlanningContext, RankedPlan, RankingEngine, RankingConfig } from './types';

export const DEFAULT_RANKING_CONFIG_V1: RankingConfig = {
  version: "1.0",
  budgetWeight: 80,
  verificationWeight: 1,
  confidenceWeight: 20,
  trendingWeight: 1,
  featuredWeight: 30,
  pinnedWeight: 1000
};

export class DefaultRankingEngine implements RankingEngine {
  run(plans: CostedPlan[], context: PlanningContext): RankedPlan[] {
    const { budget, vibe, pinnedSpotId } = context.request;
    const config = context.rankingConfig;

    const scored = plans.map((plan) => {
      const { spot, totalCost } = plan;

      // 1. Cost Score (closer to budget is better)
      const costScore = (1 - Math.abs(budget - totalCost) / budget) * config.budgetWeight;

      // 2. Vibe matching score
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);

      // 3. Featured Boost
      const featuredBoost = spot.is_featured ? config.featuredWeight : 0;

      // 4. Tie breaker weight (hash of spot ID segment)
      const idWeight =
        spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
      const tieBreaker = idWeight * config.trendingWeight;

      // 5. Confidence score boost
      const confidenceScore = Number(spot.computed_confidence_score || 50.00);
      const confidenceBoost = (confidenceScore / 100) * config.confidenceWeight;

      // 6. Status verification boost
      let statusBoost = 0;
      const status = spot.verified_by || 'verified';
      if (status === 'fresh')              statusBoost = 25;
      else if (status === 'community_verified') statusBoost = 20;
      else if (status === 'owner_verified')     statusBoost = 30;
      else if (status === 'stale')              statusBoost = -20;
      else if (status === 'needs_review')       statusBoost = -40;
      else if (status === 'incomplete')         statusBoost = -30;

      const verificationBoost = statusBoost * config.verificationWeight;

      // 7. Pinned boost (always wins)
      const pinnedBoost = spot.id === pinnedSpotId ? config.pinnedWeight : 0;

      const score =
        costScore +
        vibeScore +
        featuredBoost +
        tieBreaker +
        pinnedBoost +
        confidenceBoost +
        verificationBoost;

      return {
        ...plan,
        score
      };
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score);
  }
}

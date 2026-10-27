import { describe, it, expect } from 'vitest';
import { DefaultCandidateEngine } from '../planning/candidateEngine';
import { DefaultRankingEngine, DEFAULT_RANKING_CONFIG_V1 } from '../planning/rankingEngine';
import { 
  deriveSpotTrustStatus, 
  shouldDisplayConfidencePercentage, 
  getVerificationText 
} from '../planning/presentation/decisionCardMapper';
import { Spot } from '../types';
import { PlanningContext, CostedPlan } from '../planning/types';

function createMockSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: 'test-spot-1',
    name: 'Test Spot',
    address: '123 Test St',
    address_slug: 'ikeja',
    area_id: 'ikeja-area',
    active: true,
    is_featured: false,
    transport_matrix: {},
    category: 'restaurant',
    has_food: true,
    price_tier: 2,
    price_per_person: 10000,
    price_source: 'historical_estimate',
    price_updated_at: new Date().toISOString(),
    vibe_tags: ['Chill'],
    ...overrides,
  };
}

describe('Forensic Architecture Reconciliation & Trust Invariants', () => {
  describe('Candidate Engine: 60-day freshness exclusion', () => {
    const engine = new DefaultCandidateEngine();

    it('excludes spots whose pricing has not been verified in 60+ days when unpinned', () => {
      const sixtyFiveDaysAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString();
      const freshSpot = createMockSpot({ id: 'fresh', name: 'Fresh Spot', price_updated_at: new Date().toISOString() });
      const staleSpot = createMockSpot({ id: 'stale', name: 'Stale Spot', price_updated_at: sixtyFiveDaysAgo });

      const context: PlanningContext = {
        request: {
          vibe: 'Chill',
          budget: 50000,
          squadSize: 2,
          daypart: 'Evening',
          startArea: 'ikeja',
        },
        timestamp: Date.now(),
        rankingConfig: DEFAULT_RANKING_CONFIG_V1,
      };

      const candidates = engine.run([freshSpot, staleSpot], context);
      const candidateIds = candidates.map(c => c.spot.id);

      expect(candidateIds).toContain('fresh');
      expect(candidateIds).not.toContain('stale');
    });

    it('retains 60+ day unverified spots if they are explicitly pinned by the user', () => {
      const sixtyFiveDaysAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString();
      const pinnedStaleSpot = createMockSpot({ id: 'pinned-stale', name: 'Pinned Stale Spot', price_updated_at: sixtyFiveDaysAgo });

      const context: PlanningContext = {
        request: {
          vibe: 'Chill',
          budget: 50000,
          squadSize: 2,
          daypart: 'Evening',
          startArea: 'ikeja',
          pinnedSpotId: 'pinned-stale',
        },
        timestamp: Date.now(),
        rankingConfig: DEFAULT_RANKING_CONFIG_V1,
      };

      const candidates = engine.run([pinnedStaleSpot], context);
      expect(candidates.map(c => c.spot.id)).toContain('pinned-stale');
    });
  });

  describe('Ranking Engine: 30-day deprioritization penalty', () => {
    const rankingEngine = new DefaultRankingEngine();

    it('applies a -25 statusBoost penalty to spots whose verification is 30+ days old', () => {
      const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
      
      const freshPlan: CostedPlan = {
        spot: createMockSpot({ 
          id: 'cand-1', 
          price_updated_at: new Date().toISOString(),
          computed_confidence_score: 80,
          verified_by: 'manual',
        }),
        activityCost: 20000,
        transportCost: 5000,
        totalCost: 25000,
      };

      const stalePlan: CostedPlan = {
        spot: createMockSpot({ 
          id: 'cand-1', 
          price_updated_at: thirtyFiveDaysAgo,
          computed_confidence_score: 80,
          verified_by: 'manual',
        }),
        activityCost: 20000,
        transportCost: 5000,
        totalCost: 25000,
      };

      const context: PlanningContext = {
        request: {
          vibe: 'Chill',
          budget: 50000,
          squadSize: 2,
          daypart: 'Evening',
          startArea: 'ikeja',
        },
        timestamp: Date.now(),
        rankingConfig: DEFAULT_RANKING_CONFIG_V1,
      };

      const freshRanked = rankingEngine.run([freshPlan], context);
      const staleRanked = rankingEngine.run([stalePlan], context);

      // Difference in score between identical fit/confidence spots should be exactly 25 due to statusBoost penalty
      expect(freshRanked[0].score - staleRanked[0].score).toBe(25);
    });
  });

  describe('Trust Status Derivation: Zero unearned verification', () => {
    it('labels unverified seed spots as estimated or pending, NEVER verified', () => {
      const seedSpot = createMockSpot({
        verified_by: 'seed',
        price_source: 'historical_estimate',
        price_updated_at: new Date().toISOString(),
      });

      const status = deriveSpotTrustStatus(seedSpot);
      expect(status).toBe('estimated');
      expect(status).not.toBe('verified');
    });

    it('labels spots without verified_by as estimated or pending', () => {
      const unverifiedSpot = createMockSpot({
        verified_by: undefined,
        price_source: 'web_scraping',
        price_updated_at: new Date().toISOString(),
      });

      const status = deriveSpotTrustStatus(unverifiedSpot);
      expect(status).toBe('estimated');
      expect(status).not.toBe('verified');
    });

    it('labels spots with manual/owner verification within 30 days as verified', () => {
      const verifiedSpot = createMockSpot({
        verified_by: 'admin',
        price_source: 'manual_verification',
        price_updated_at: new Date().toISOString(),
      });

      const status = deriveSpotTrustStatus(verifiedSpot);
      expect(status).toBe('verified');
    });

    it('demotes manual/owner verified spots older than 30 days to estimated or pending', () => {
      const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
      const staleVerifiedSpot = createMockSpot({
        verified_by: 'admin',
        price_source: 'manual_verification',
        price_updated_at: thirtyFiveDaysAgo,
      });

      const status = deriveSpotTrustStatus(staleVerifiedSpot);
      expect(status).toBe('estimated');
      expect(status).not.toBe('verified');
    });

    it('labels temporarily closed spots as unavailable', () => {
      const closedSpot = createMockSpot({
        is_temporarily_closed: true,
      });

      const status = deriveSpotTrustStatus(closedSpot);
      expect(status).toBe('unavailable');
    });
  });

  describe('Confidence Display Gating', () => {
    it('gates confidence percentage when venue lacks 1 manual verification and 3 user reports', () => {
      // 0 manual verifications, 0 user reports
      expect(shouldDisplayConfidencePercentage({
        manual_verifications_count: 0,
        user_reported_outcomes_count: 0,
      })).toBe(false);

      // 1 manual verification, but only 2 user reports (requires 3)
      expect(shouldDisplayConfidencePercentage({
        manual_verifications_count: 1,
        user_reported_outcomes_count: 2,
      })).toBe(false);

      // 0 manual verifications, but 5 user reports
      expect(shouldDisplayConfidencePercentage({
        manual_verifications_count: 0,
        user_reported_outcomes_count: 5,
      })).toBe(false);

      // 1 manual verification AND 3 user reports
      expect(shouldDisplayConfidencePercentage({
        manual_verifications_count: 1,
        user_reported_outcomes_count: 3,
      })).toBe(true);
    });
  });

  describe('Truthful Verification Text', () => {
    it('returns "Estimated price" for unverified sources even if updated today', () => {
      const text = getVerificationText(new Date().toISOString(), false);
      expect(text).toBe('Estimated price');
    });

    it('returns "Verified today" only when source is verified and updated today', () => {
      const text = getVerificationText(new Date().toISOString(), true);
      expect(text).toBe('Verified today');
    });

    it('returns "Pricing unverified" when pricing is 60+ days old', () => {
      const sixtyFiveDaysAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString();
      const text = getVerificationText(sixtyFiveDaysAgo, true);
      expect(text).toBe('Pricing unverified');
    });

    it('returns "Needs update" when pricing is 30-59 days old', () => {
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
      const text = getVerificationText(fortyDaysAgo, true);
      expect(text).toBe('Needs update');
    });
  });
});

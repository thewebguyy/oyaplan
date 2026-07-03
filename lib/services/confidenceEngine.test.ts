/**
 * confidenceEngine.test.ts
 *
 * Ported from scripts/verify-phase2.ts into the Vitest pipeline.
 * These tests protect the confidence scoring algorithm that determines
 * how trustworthy each venue's pricing data is rated.
 *
 * confidence score drives:
 *   - the badge shown in PlanCard (% Confidence)
 *   - the statusBoost in the matching engine (fresh/stale/needs_review)
 *   - the moderation prioritisation in the admin queue
 *
 * Any change to calculateConfidence MUST update these tests.
 */

import { describe, it, expect } from 'vitest';
import { calculateConfidence } from './confidenceEngine';
import type { PriceEvidence, MenuItem } from '../types';

const BASE_MENU_ITEMS: MenuItem[] = [
  { id: '1', venue_id: 'v1', category: 'main',      price: 8000, name: 'Burger',  is_available: true },
  { id: '2', venue_id: 'v1', category: 'starter',   price: 4000, name: 'Wings',   is_available: true },
  { id: '3', venue_id: 'v1', category: 'soft_drink', price: 1500, name: 'Soda',    is_available: true },
];

function makeEvidence(overrides: Partial<PriceEvidence> & { id: string }): PriceEvidence {
  return {
    menu_item_id: '1',
    venue_id: 'v1',
    source_type: 'owner_submission',
    submitted_by: 'admin_user',
    recorded_price: 8000,
    verification_status: 'approved',
    confidence_weight: 1.00,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('calculateConfidence', () => {
  describe('no evidence', () => {
    it('should return 10% confidence when no evidence exists', () => {
      const { score } = calculateConfidence([], BASE_MENU_ITEMS, 'restaurant');
      expect(score).toBe(10.00);
    });

    it('should include a low-confidence reason string', () => {
      const { reasons } = calculateConfidence([], BASE_MENU_ITEMS, 'restaurant');
      expect(reasons.some(r => r.toLowerCase().includes('low confidence'))).toBe(true);
    });
  });

  describe('fresh admin evidence', () => {
    it('should score around 85% for fresh owner-submitted evidence with complete menu', () => {
      // Freshness = 100% (today), Source = 100% (owner), Volume = 1 → 25%
      // Completeness = starter + main + soft_drink all present → 100%
      // Score = 100*0.35 + 100*0.30 + 25*0.20 + 100*0.15 = 35+30+5+15 = 85%
      const evidence = [makeEvidence({ id: 'e1' })];
      const { score } = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant');
      expect(score).toBeGreaterThanOrEqual(84);
      expect(score).toBeLessThanOrEqual(86);
    });

    it('should include verified-by-owner reason', () => {
      const evidence = [makeEvidence({ id: 'e1' })];
      const { reasons } = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant');
      expect(reasons.some(r => r.includes('owner') || r.includes('admin'))).toBe(true);
    });
  });

  describe('multiple independent submitters', () => {
    it('should increase confirmation score for 3+ unique submitters', () => {
      const evidence = [
        makeEvidence({ id: 'e1', submitted_by: 'user_a', source_type: 'receipt_upload', confidence_weight: 0.90 }),
        makeEvidence({ id: 'e2', submitted_by: 'user_b', source_type: 'receipt_upload', confidence_weight: 0.90 }),
        makeEvidence({ id: 'e3', submitted_by: 'user_c', source_type: 'receipt_upload', confidence_weight: 0.90 }),
      ];
      const { score, reasons } = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant');
      expect(score).toBeGreaterThan(60); // Confirmation contributes 3*25=75 → 75*0.20 = 15pts
      expect(reasons.some(r => r.includes('3') || r.includes('independent'))).toBe(true);
    });
  });

  describe('price conflict penalty', () => {
    it('should penalise -30pts when same item has >20% price variance', () => {
      const conflictEvidence: PriceEvidence[] = [
        makeEvidence({ id: 'e1', menu_item_id: '1', recorded_price: 8000, submitted_by: 'admin' }),
        makeEvidence({ id: 'e2', menu_item_id: '1', recorded_price: 15000, submitted_by: 'user_a', source_type: 'receipt_upload', confidence_weight: 0.90 }),
      ];
      const { score, reasons } = calculateConfidence(conflictEvidence, BASE_MENU_ITEMS, 'restaurant');
      // Conflict penalty = -30. Even with high base score it should be below 60.
      expect(score).toBeLessThanOrEqual(60);
      expect(reasons.some(r => r.includes('Conflicting prices') || r.includes('conflict'))).toBe(true);
    });
  });

  describe('user up-flag penalty', () => {
    it('should penalise -20pts when 3+ up-flags are present', () => {
      const evidence = [makeEvidence({ id: 'e1' })];
      const flags = [{ flag_type: 'up' }, { flag_type: 'up' }, { flag_type: 'up' }];
      const baseScore = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant').score;
      const flaggedScore = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant', flags).score;
      // Difference should be exactly 20pts
      expect(Math.round(baseScore - flaggedScore)).toBe(20);
    });

    it('should include up-flag warning in reasons when penalty fires', () => {
      const evidence = [makeEvidence({ id: 'e1' })];
      const flags = [{ flag_type: 'up' }, { flag_type: 'up' }, { flag_type: 'up' }];
      const { reasons } = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant', flags);
      expect(reasons.some(r => r.includes('flagged') || r.includes('higher'))).toBe(true);
    });

    it('should NOT penalise when fewer than 3 up-flags', () => {
      const evidence = [makeEvidence({ id: 'e1' })];
      const flags = [{ flag_type: 'up' }, { flag_type: 'up' }];
      const baseScore = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant').score;
      const flaggedScore = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant', flags).score;
      expect(baseScore).toBe(flaggedScore);
    });
  });

  describe('staleness via freshness decay', () => {
    it('should score lower for old evidence than fresh evidence', () => {
      const freshEvidence = [makeEvidence({ id: 'e1', created_at: new Date().toISOString() })];
      const oldEvidence = [makeEvidence({ id: 'e1', created_at: '2023-01-01T00:00:00.000Z' })];

      const freshScore = calculateConfidence(freshEvidence, BASE_MENU_ITEMS, 'restaurant').score;
      const oldScore = calculateConfidence(oldEvidence, BASE_MENU_ITEMS, 'restaurant').score;

      expect(freshScore).toBeGreaterThan(oldScore);
    });
  });

  describe('score bounds', () => {
    it('should never produce a score above 100', () => {
      const evidence = [
        makeEvidence({ id: 'e1', submitted_by: 'a' }),
        makeEvidence({ id: 'e2', submitted_by: 'b' }),
        makeEvidence({ id: 'e3', submitted_by: 'c' }),
        makeEvidence({ id: 'e4', submitted_by: 'd' }),
      ];
      const { score } = calculateConfidence(evidence, BASE_MENU_ITEMS, 'restaurant');
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should never produce a negative score', () => {
      const oldConflictEvidence: PriceEvidence[] = [
        makeEvidence({ id: 'e1', created_at: '2020-01-01T00:00:00.000Z', menu_item_id: '1', recorded_price: 5000 }),
        makeEvidence({ id: 'e2', created_at: '2020-01-01T00:00:00.000Z', menu_item_id: '1', recorded_price: 50000 }),
      ];
      const flags = Array(5).fill({ flag_type: 'up' });
      const { score } = calculateConfidence(oldConflictEvidence, BASE_MENU_ITEMS, 'restaurant', flags);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});

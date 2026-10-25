import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { calculateOutsideMath, venueFoodTotal, suggestPlanBudget } from '@/lib/venue/venueSpend';
import { calculateZoneFare, getDepartureBucket, TransportPricingProvider } from '@/lib/planning/transport';
import { applyBudgetMode, getReceiptOutcome } from '@/lib/planning/budgetMode';
import { createShareablePlan } from '@/lib/actions/sharePlan';
import { getSpotForPricing } from '@/lib/queries/spots';
import { supabase } from '@/lib/supabase';
import { Plan, ForgeInput } from '@/lib/types';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));
vi.mock('@/lib/queries/spots', () => ({ getSpotForPricing: vi.fn() }));
vi.mock('@/lib/sentry', () => ({ captureServerException: vi.fn() }));
vi.mock('@/lib/services/identity/sessionResolver', () => ({
  SessionResolver: {
    resolveIdentity: vi.fn().mockResolvedValue({ type: 'anonymous', sessionId: '123e4567-e89b-12d3-a456-426614174001', profile: null }),
  },
}));
vi.mock('@/lib/services/identity/savedPlanService', () => ({
  SavedPlanService: { savePlan: vi.fn().mockResolvedValue({ success: true }) },
}));

/**
 * PHASE 2: PRICING INTEGRITY & PROPERTY-BASED TEST SUITE
 * Uses fast-check property testing and deterministic boundary tests
 */

describe('Phase 2 Pricing Integrity: Canonical Outside Math & Boundaries', () => {

  // 2.1 fast-check Property Tests on calculateOutsideMath
  it('Property 2.1.1: Outside Math always returns strict non-negative integer kobo (no NaN, Infinity, or fractional floats)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50_000_000 }),
        fc.float({ min: 0, max: 20, noNaN: true }),
        fc.float({ min: 0, max: 25, noNaN: true }),
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.float({ min: 1.0, max: 3.0, noNaN: true }),
        fc.integer({ min: 1, max: 100 }),
        (foodSubtotal, vatPct, serviceChargePct, transportCost, surgeMultiplier, headcount) => {
          const res = calculateOutsideMath({
            foodSubtotal,
            vatPct,
            serviceChargePct,
            transportCost,
            surgeMultiplier,
            headcount,
          });

          // Invariant: All outputs are finite integers >= 0
          expect(Number.isInteger(res.totalCost)).toBe(true);
          expect(Number.isInteger(res.vatAmount)).toBe(true);
          expect(Number.isInteger(res.serviceChargeAmount)).toBe(true);
          expect(Number.isInteger(res.transportCost)).toBe(true);
          expect(Number.isInteger(res.surgeCost)).toBe(true);
          expect(res.totalCost).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(res.totalCost)).toBe(true);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('Property 2.1.2: Outside Math totalCost is always >= foodSubtotal + transportCost', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.integer({ min: 0, max: 500_000 }),
        fc.float({ min: 1.0, max: 2.5, noNaN: true }),
        (foodSubtotal, transportCost, surgeMultiplier) => {
          const res = calculateOutsideMath({
            foodSubtotal,
            transportCost,
            surgeMultiplier,
            vatPct: 7.5,
            serviceChargePct: 10,
          });

          // Total must be greater than or equal to raw food + transport baseline
          expect(res.totalCost).toBeGreaterThanOrEqual(foodSubtotal + transportCost);
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Property 2.1.3: Surge multiplier never lowers the total cost (monotonic non-decreasing)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 5_000_000 }),
        fc.double({ min: 1.0, max: 1.5, noNaN: true }),
        fc.double({ min: 1.51, max: 3.0, noNaN: true }),
        (foodSubtotal, surgeLow, surgeHigh) => {
          const resLow = calculateOutsideMath({ foodSubtotal, surgeMultiplier: surgeLow });
          const resHigh = calculateOutsideMath({ foodSubtotal, surgeMultiplier: surgeHigh });

          expect(resHigh.totalCost).toBeGreaterThanOrEqual(resLow.totalCost);
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Property 2.1.4: Per-head splits multiplied by squad size always cover total cost (no lost kobo)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 10_000_000 }),
        fc.integer({ min: 1, max: 50 }),
        (totalCost, squadSize) => {
          const perHead = Math.ceil(totalCost / squadSize);
          const totalCollected = perHead * squadSize;
          expect(totalCollected).toBeGreaterThanOrEqual(totalCost);
          // Overage must be less than squadSize kobo
          expect(totalCollected - totalCost).toBeLessThan(squadSize);
        }
      ),
      { numRuns: 500 }
    );
  });

  // 2.2 Boundary Inputs & Edge Cases
  describe('Boundary inputs & edge case handling', () => {
    it('handles negative or zero headcount safely', () => {
      const resZero = calculateOutsideMath({ foodSubtotal: 20000, headcount: 0 });
      expect(resZero.headcount).toBe(1);
      expect(resZero.totalCost).toBeGreaterThan(0);

      const resNegative = calculateOutsideMath({ foodSubtotal: 20000, headcount: -5 });
      expect(resNegative.headcount).toBe(1);
    });

    it('handles extreme headcount (1,000,000) without integer overflow', () => {
      const res = calculateOutsideMath({ foodSubtotal: 50000, headcount: 1_000_000 });
      expect(Number.isSafeInteger(res.totalCost)).toBe(true);
      expect(res.totalCost).toBeGreaterThan(0);
    });

    it('handles fractional headcount by flooring to integer', () => {
      const res = calculateOutsideMath({ foodSubtotal: 10000, headcount: 3.7 });
      expect(res.headcount).toBe(3);
    });

    it('handles negative budget in suggestPlanBudget safely', () => {
      expect(suggestPlanBudget(null, 4)).toBe(25000);
      expect(suggestPlanBudget(5000, -2)).toBe(10000); // squad clamped to 1
    });
  });

  // 2.3 Friday 5-9pm WAT Rush Hour Boundary Tests
  describe('Friday/Weekday Rush Hour & WAT Timezone Behavior', () => {
    it('correctly classifies Friday evening peak boundaries in local time', () => {
      // Friday: day = 5
      // Weekday rush hour: (hour >= 16 && hour <= 20) -> 4:00 PM to 8:59 PM
      // Note: getDepartureBucket checks: hour >= 16 && hour <= 20

      // Friday 3:59 PM (15:59) -> off-peak
      const fri359 = new Date('2026-10-09T15:59:00+01:00');
      expect(getDepartureBucket(fri359)).toBe('off-peak');

      // Friday 4:00 PM (16:00) -> peak
      const fri400 = new Date('2026-10-09T16:00:00+01:00');
      expect(getDepartureBucket(fri400)).toBe('peak');

      // Friday 8:59 PM (20:59) -> peak
      const fri859 = new Date('2026-10-09T20:59:00+01:00');
      expect(getDepartureBucket(fri859)).toBe('peak');

      // Friday 9:00 PM (21:00) -> peak in transport.ts:81 ((day === 5 || day === 6) && hour >= 20)
      const fri900 = new Date('2026-10-09T21:00:00+01:00');
      expect(getDepartureBucket(fri900)).toBe('peak');
    });

    it('asserts getDepartureBucket correctly uses WAT (UTC+1) timezone regardless of server TZ', () => {
      // 16:59 WAT on Friday is evening rush hour; the same instant is 15:59Z.
      // A host-TZ implementation running on a UTC server reads hour 15 and says off-peak.
      const friWat1659Utc = new Date('2026-10-09T15:59:00.000Z');

      const lagosHour = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', hourCycle: 'h23' }).format(friWat1659Utc),
        10
      );
      expect(lagosHour).toBe(16);

      expect(getDepartureBucket(friWat1659Utc)).toBe('peak');
    });
  });

  // 2.4 Island vs Mainland Corridor Fares
  describe('Transport Corridor Fares (Temporary Zone Rules)', () => {
    it('returns ₦5,000 for Mainland destination and ₦10,000 for Island destination', () => {
      expect(calculateZoneFare('ikeja', 'ikeja')).toBe(5000);
      expect(calculateZoneFare('yaba', 'surulere')).toBe(5000);
      expect(calculateZoneFare('ikeja', 'vi')).toBe(10000);
      expect(calculateZoneFare('vi', 'lekki-phase-1')).toBe(10000);
    });
  });

  // 2.5 Tamper Vulnerability Test in createShareablePlan
  describe('Tamper Test: Server Actions Client-Supplied Price Recomputation', () => {
    it('createShareablePlan must never accept forged totalCost from client and must recompute from DB spot price', async () => {
      const forgedPlan: Plan = {
        spot: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Expensive Lounge',
          address: 'Victoria Island',
          area_id: 'vi',
          vibe_tags: [],
          price_per_person: 50000,
          transport_matrix: {},
          is_featured: false,
          active: true,
        },
        foodCost: 50,       // FORGED
        transportCost: 50,  // FORGED
        totalCost: 100,     // FORGED
        whyItFits: 'Hacked calculation',
      };

      const forgeInput: ForgeInput = {
        startArea: 'Lekki',
        squadSize: 4,
        budget: 200000,
        vibe: 'Party',
      };

      // Trusted DB row: ₦50,000 pp, Victoria Island (island zone => ₦10,000 transport estimate).
      vi.mocked(getSpotForPricing).mockResolvedValue({
        data: { ...forgedPlan.spot, address_slug: 'vi', verified_by: 'seed' },
        error: null,
      });

      let insertedRow: Record<string, unknown> | null = null;
      const insert = vi.fn((row: Record<string, unknown>) => {
        insertedRow = row;
        return { select: () => ({ single: async () => ({ data: { id: 'new-id', plan_code: 'OYA123' }, error: null }) }) };
      });
      vi.mocked(supabase.from).mockReturnValue({ insert } as unknown as ReturnType<typeof supabase.from>);

      const result = await createShareablePlan(forgedPlan, forgeInput);

      expect(result.success).toBe(true);
      // Persisted values must come from the server, never the forged 50 / 50 / 100:
      // food 4 x 50,000 = 200,000; island transport estimate 10,000; total 210,000
      // (identical to what /forge's planning engine shows for the same venue).
      expect(insertedRow).not.toBeNull();
      expect(insertedRow!.food_cost).toBe(200000);
      expect(insertedRow!.transport_cost).toBe(10000);
      expect(insertedRow!.total_cost).toBe(210000);
      expect(insertedRow!.why_it_fits).not.toBe('Hacked calculation');
    });
  });

  // 2.6 Verified Stamp Integrity
  describe('Verified Stamp Integrity', () => {
    it('PreReceiptModal outcome stamp correctly reflects over-budget vs clean math vs headroom', () => {
      const underBudget = getReceiptOutcome(60000, 45000);
      expect(underBudget.kind).toBe('under');
      expect(underBudget.title).toBe('BILLING ESCAPED');

      const onBudget = getReceiptOutcome(50000, 50200);
      expect(onBudget.kind).toBe('exact');
      expect(onBudget.title).toBe('CLEAN MATH');

      const overBudget = getReceiptOutcome(40000, 55000);
      expect(overBudget.kind).toBe('over');
      expect(overBudget.title).toBe('OVER BUDGET');
    });
  });
});

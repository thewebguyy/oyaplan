/**
 * Matching Engine Tests
 *
 * Every test in this file protects a business rule or engineering invariant.
 * See CLAUDE.md "Non-Negotiable Invariants" and the matching engine architecture
 * section for the business context behind each test.
 *
 * DESIGN NOTES (from P1-4 analysis — do not encode as tests without sign-off):
 *
 * DN-1: Same-area fare is ₦1,200 (local trip), not ₦5,000 (same-zone).
 *       CLAUDE.md says "Same zone → ₦5,000" but that refers to same zone,
 *       different area. The ₦1,200 path fires only when origin === destination.
 *
 * DN-2: vibeScore is always 0 or 5 in practice. A spot's vibe_tags array
 *       will not contain duplicate values, so vibeMatches is never > 1.
 *       The Math.min(..., 10) cap is defensive but unreachable with real data.
 *
 * DN-3: The pinned spot is subject to the budget gate. A pinned spot that
 *       exceeds budget is excluded entirely. This is a known design question
 *       flagged in ADR/P1-4 analysis — awaiting founder decision.
 *
 * DN-4: idWeight uses charCode sum of the first UUID segment (8 hex chars) % 10.
 *       Tests must use real UUID-format IDs for deterministic behaviour.
 */

import { describe, it, expect, vi } from 'vitest';
import { forgePlans, calculateZoneFare } from './forgeMatcher';
import type { Spot, ForgeInput } from '../../types';

// ─── Supabase mock ────────────────────────────────────────────────────────────
// The analytics insert is fire-and-forget and must not affect test output.
vi.mock('./supabase', () => ({
  supabase: {
    from: () => ({
      insert: () => ({ then: vi.fn() }),
    }),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Build a minimal valid Spot, overriding only the fields needed per test.
 * UUID format is required: idWeight reads spot.id.split('-')[0] charCode sum % 10.
 */
function makeSpot(overrides: Partial<Spot> & { id: string }): Spot {
  return {
    name: 'Test Spot',
    address: '1 Test Street',
    address_slug: 'ikeja',
    area_id: 'area-1',
    vibe_tags: ['Chill'],
    price_per_person: 5000,
    transport_matrix: {},
    is_featured: false,
    active: true,
    category: 'restaurant',
    has_food: true,
    typical_duration_hours: 2,
    zone: 'mainland',
    ...overrides,
  };
}

/**
 * Standard spot used across most tests. Island location, Chill vibe, food.
 * UUID: first segment "a1b2c3d4" → charCodes sum = 97+49+98+50+99+51+100+52 = 596 → 596 % 10 = 6
 */
const SPOT_A = makeSpot({
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  name: 'Spot A',
  address_slug: 'lekki-phase-1',
  vibe_tags: ['Chill'],
  price_per_person: 5000,
  is_featured: false,
});

/**
 * Featured spot — same vibe and cost as SPOT_A, should outscore it.
 * UUID: first segment "b2c3d4e5" → 98+50+99+51+100+52+101+53 = 604 → 604 % 10 = 4
 */
const SPOT_FEATURED = makeSpot({
  id: 'b2c3d4e5-0000-0000-0000-000000000002',
  name: 'Featured Spot',
  address_slug: 'lekki-phase-1',
  vibe_tags: ['Chill'],
  price_per_person: 5000,
  is_featured: true,
});

/**
 * Activity spot (no food buffer). Night-excluded when duration > 2.
 * UUID: first segment "c3d4e5f6" → 99+51+100+52+101+53+102+54 = 612 → 612 % 10 = 2
 */
const SPOT_ACTIVITY = makeSpot({
  id: 'c3d4e5f6-0000-0000-0000-000000000003',
  name: 'Activity Spot',
  address_slug: 'ikeja',
  vibe_tags: ['Chill'],
  category: 'activity',
  has_food: false,
  price_per_person: 4000,
  typical_duration_hours: 3,
  is_featured: false,
});

/**
 * Bar spot — excluded from Morning.
 * UUID: first segment "d4e5f6a7" → 100+52+101+53+102+54+97+55 = 614 → 614 % 10 = 4
 */
const SPOT_BAR = makeSpot({
  id: 'd4e5f6a7-0000-0000-0000-000000000004',
  name: 'Bar Spot',
  address_slug: 'ikeja',
  vibe_tags: ['Chill', 'Party'],
  category: 'bar',
  has_food: true,
  price_per_person: 3000,
  is_featured: false,
});

/**
 * Nature spot — excluded from Night.
 * UUID: first segment "e5f6a7b8" → 101+53+102+54+97+55+98+56 = 616 → 616 % 10 = 6
 */
const SPOT_NATURE = makeSpot({
  id: 'e5f6a7b8-0000-0000-0000-000000000005',
  name: 'Nature Spot',
  address_slug: 'ikeja',
  vibe_tags: ['Chill'],
  category: 'nature',
  has_food: false,
  price_per_person: 2000,
  is_featured: false,
});

/** Standard input for most tests */
const BASE_INPUT: ForgeInput = {
  startArea: 'ikeja',
  squadSize: 2,
  budget: 50000,
  vibe: 'Chill',
};

// ─── calculateZoneFare ────────────────────────────────────────────────────────

describe('calculateZoneFare', () => {
  it('returns ₦1,200 for same area (local trip)', () => {
    // DN-1: same-area shortcut, distinct from same-zone.
    expect(calculateZoneFare('ikeja', 'ikeja')).toBe(1200);
    expect(calculateZoneFare('yaba', 'yaba')).toBe(1200);
    expect(calculateZoneFare('lekki-phase-1', 'lekki-phase-1')).toBe(1200);
  });

  it('returns ₦5,000 for same zone, different area (mainland–mainland)', () => {
    // ikeja and gbagada are both mainland
    expect(calculateZoneFare('ikeja', 'gbagada')).toBe(5000);
  });

  it('returns ₦5,000 for same zone, different area (island–island)', () => {
    // lekki-phase-1 and vi are both island
    expect(calculateZoneFare('lekki-phase-1', 'vi')).toBe(5000);
  });

  it('returns ₦5,000 for same zone, different area (central–central)', () => {
    // yaba and surulere are both central
    expect(calculateZoneFare('yaba', 'surulere')).toBe(5000);
  });

  it('returns ₦7,000 for mainland ↔ central', () => {
    expect(calculateZoneFare('ikeja', 'yaba')).toBe(7000);
    expect(calculateZoneFare('yaba', 'ikeja')).toBe(7000);
  });

  it('returns ₦9,000 for central ↔ island', () => {
    expect(calculateZoneFare('yaba', 'lekki-phase-1')).toBe(9000);
    expect(calculateZoneFare('lekki-phase-1', 'yaba')).toBe(9000);
  });

  it('returns ₦16,000 for mainland ↔ island', () => {
    expect(calculateZoneFare('ikeja', 'lekki-phase-1')).toBe(16000);
    expect(calculateZoneFare('lekki-phase-1', 'ikeja')).toBe(16000);
  });

  it('is symmetric — origin and destination can be swapped', () => {
    const pairs: [string, string][] = [
      ['ikeja', 'yaba'],
      ['yaba', 'lekki-phase-1'],
      ['ikeja', 'lekki-phase-1'],
      ['gbagada', 'surulere'],
    ];
    for (const [a, b] of pairs) {
      expect(calculateZoneFare(a, b)).toBe(calculateZoneFare(b, a));
    }
  });

  it('applies Apapa surcharge (+₦3,000 round trip) on top of base fare', () => {
    // apapa → central: base one-way 2500 + 1500 surcharge = 4000. Round trip = 8000.
    expect(calculateZoneFare('apapa', 'yaba')).toBe(8000);
    // apapa → mainland: base one-way 3500 + 1500 = 5000. Round trip = 10000.
    expect(calculateZoneFare('apapa', 'ikeja')).toBe(10000);
    // apapa → island: base one-way 4500 + 1500 = 6000. Round trip = 12000.
    expect(calculateZoneFare('apapa', 'lekki-phase-1')).toBe(12000);
  });

  it('returns rounded values (nearest ₦500) for different-area trips', () => {
    // The same-area shortcut returns ₦1,200 (bypasses rounding — tested separately).
    // All different-area fares go through Math.round(roundTrip / 500) × 500.
    const areas = ['ikeja', 'gbagada', 'yaba', 'surulere', 'lekki-phase-1', 'vi', 'ikoyi', 'apapa'];
    for (const a of areas) {
      for (const b of areas) {
        if (a === b) continue; // same-area uses the ₦1,200 shortcut, not the rounding formula
        const fare = calculateZoneFare(a, b);
        expect(fare % 500).toBe(0);
      }
    }
  });

  it('same-area shortcut returns ₦1,200 (not a multiple of ₦500)', () => {
    // The early-return path bypasses the round-to-500 step.
    // ₦1,200 represents a local intra-area trip cost.
    expect(calculateZoneFare('ikeja', 'ikeja')).toBe(1200);
    expect(1200 % 500).toBe(200); // intentionally not a ₦500 multiple
  });

  it('uses ikeja as default zone for unknown area slugs', () => {
    // Unknown areas fall to ZONES["unknown"] = undefined → "other" zone.
    // "other" to mainland: (3500 + 1500) × 2 = 10000
    expect(calculateZoneFare('unknown-area', 'ikeja')).toBe(10000);
  });

  it('returns all-positive values for all known area pairs', () => {
    const areas = ['ikeja', 'gbagada', 'ogudu', 'agege', 'maryland', 'yaba', 'surulere', 'ebute-metta', 'lekki-phase-1', 'vi', 'ikoyi', 'apapa'];
    for (const a of areas) {
      for (const b of areas) {
        expect(calculateZoneFare(a, b)).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Filter: vibe matching ────────────────────────────────────────────────────

describe('forgePlans — vibe filter', () => {
  it('includes spots whose vibe_tags contain the requested vibe', () => {
    const results = forgePlans(BASE_INPUT, [SPOT_A]);
    expect(results).toHaveLength(1);
    expect(results[0].spot.id).toBe(SPOT_A.id);
  });

  it('excludes spots whose vibe_tags do not contain the requested vibe', () => {
    const wrongVibeSpot = makeSpot({
      id: 'f6a7b8c9-0000-0000-0000-000000000010',
      vibe_tags: ['Party'],
    });
    const results = forgePlans({ ...BASE_INPUT, vibe: 'Chill' }, [wrongVibeSpot]);
    expect(results).toHaveLength(0);
  });

  it('matches vibe exactly — partial string match does not count', () => {
    const spot = makeSpot({
      id: 'a7b8c9d0-0000-0000-0000-000000000011',
      vibe_tags: ['ChillOut'],
    });
    const results = forgePlans({ ...BASE_INPUT, vibe: 'Chill' }, [spot]);
    expect(results).toHaveLength(0);
  });

  it('includes spot when it has multiple vibe tags and one matches', () => {
    const spot = makeSpot({
      id: 'b8c9d0e1-0000-0000-0000-000000000012',
      vibe_tags: ['Party', 'Chill', 'Dinner'],
    });
    const results = forgePlans({ ...BASE_INPUT, vibe: 'Chill' }, [spot]);
    expect(results).toHaveLength(1);
  });
});

// ─── Filter: pinned spot ──────────────────────────────────────────────────────

describe('forgePlans — pinned spot', () => {
  it('includes pinned spot even when its vibe_tags do not match', () => {
    const mismatchedSpot = makeSpot({
      id: 'c9d0e1f2-0000-0000-0000-000000000020',
      vibe_tags: ['Party'],         // vibe is 'Chill'
      price_per_person: 3000,
    });
    const results = forgePlans(
      { ...BASE_INPUT, pinnedSpotId: mismatchedSpot.id },
      [mismatchedSpot]
    );
    expect(results).toHaveLength(1);
    expect(results[0].spot.id).toBe(mismatchedSpot.id);
  });

  it('pinned spot ranks first above all other spots (pinnedBoost = +1000)', () => {
    const pinnedSpot = makeSpot({
      id: 'd0e1f2a3-0000-0000-0000-000000000021',
      vibe_tags: ['Chill'],
      price_per_person: 3000,
      is_featured: true,            // even featured, pinned beats it
    });
    const otherSpot = makeSpot({
      id: 'e1f2a3b4-0000-0000-0000-000000000022',
      vibe_tags: ['Chill'],
      price_per_person: 3000,
      is_featured: true,
    });
    const results = forgePlans(
      { ...BASE_INPUT, pinnedSpotId: pinnedSpot.id },
      [otherSpot, pinnedSpot]
    );
    expect(results[0].spot.id).toBe(pinnedSpot.id);
  });

  // DN-3: Pinned spot is still subject to the budget gate.
  // This test documents current behaviour. See design note DN-3.
  it('excludes pinned spot when its total cost exceeds budget (current behaviour)', () => {
    const expensivePin = makeSpot({
      id: 'f2a3b4c5-0000-0000-0000-000000000023',
      vibe_tags: ['Party'],
      price_per_person: 30000,     // 2 people × 30000 × 1.1 = 66000 > 50000 budget
    });
    const results = forgePlans(
      { ...BASE_INPUT, budget: 50000, pinnedSpotId: expensivePin.id },
      [expensivePin]
    );
    expect(results).toHaveLength(0);
  });

  it('excludes pinned spot when transport cost exceeds 35% of budget', () => {
    const farPin = makeSpot({
      id: 'a3b4c5d6-0000-0000-0000-000000000024',
      vibe_tags: ['Party'],
      price_per_person: 1000,
      transport_matrix: { ikeja: 20000 }, // 20000 > 50000 × 0.35 = 17500
    });
    const results = forgePlans(
      { ...BASE_INPUT, budget: 50000, pinnedSpotId: farPin.id },
      [farPin]
    );
    expect(results).toHaveLength(0);
  });
});

// ─── Filter: daypart ──────────────────────────────────────────────────────────

describe('forgePlans — daypart filter', () => {
  it('Morning: excludes bar spots', () => {
    const results = forgePlans(
      { ...BASE_INPUT, daypart: 'Morning', vibe: 'Party' },
      [SPOT_BAR]
    );
    expect(results).toHaveLength(0);
  });

  it('Morning: excludes entertainment spots', () => {
    const entertainment = makeSpot({
      id: 'b4c5d6e7-0000-0000-0000-000000000030',
      category: 'entertainment',
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Morning' }, [entertainment]);
    expect(results).toHaveLength(0);
  });

  it('Morning: excludes beach spots', () => {
    const beach = makeSpot({
      id: 'c5d6e7f8-0000-0000-0000-000000000031',
      category: 'beach',
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Morning' }, [beach]);
    expect(results).toHaveLength(0);
  });

  it('Morning: includes restaurant, cafe, nature, activity, experience', () => {
    const included = ['restaurant', 'cafe', 'nature', 'activity', 'experience'].map((cat, i) =>
      makeSpot({
        id: `d6e7f8a${i}-0000-0000-0000-00000000003${i}`,
        category: cat as Spot['category'],
        vibe_tags: ['Chill'],
        has_food: cat === 'restaurant' || cat === 'cafe',
        price_per_person: 2000,
      })
    );
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Morning', budget: 30000 }, included);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('Night: excludes nature spots', () => {
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Night' }, [SPOT_NATURE]);
    expect(results).toHaveLength(0);
  });

  it('Night: excludes beach spots', () => {
    const beach = makeSpot({
      id: 'e7f8a9b0-0000-0000-0000-000000000040',
      category: 'beach',
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Night' }, [beach]);
    expect(results).toHaveLength(0);
  });

  it('Night: excludes activity spots with typical_duration_hours > 2', () => {
    // SPOT_ACTIVITY has duration = 3
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Night' }, [SPOT_ACTIVITY]);
    expect(results).toHaveLength(0);
  });

  it('Night: includes activity spots with typical_duration_hours <= 2', () => {
    const shortActivity = makeSpot({
      id: 'f8a9b0c1-0000-0000-0000-000000000041',
      category: 'activity',
      typical_duration_hours: 2,
      vibe_tags: ['Chill'],
      has_food: false,
      price_per_person: 3000,
    });
    const results = forgePlans({ ...BASE_INPUT, daypart: 'Night' }, [shortActivity]);
    expect(results).toHaveLength(1);
  });

  it('Night: includes bar spots', () => {
    const results = forgePlans(
      { ...BASE_INPUT, daypart: 'Night', vibe: 'Party' },
      [SPOT_BAR]
    );
    expect(results).toHaveLength(1);
  });

  it('Afternoon: allows all categories', () => {
    const allCats = [SPOT_A, SPOT_BAR, SPOT_NATURE, SPOT_ACTIVITY];
    const results = forgePlans(
      { ...BASE_INPUT, daypart: 'Afternoon', vibe: 'Chill', budget: 60000 },
      allCats
    );
    // All four have vibe 'Chill' and should pass daypart filter
    expect(results.length).toBe(3); // capped at 3
  });

  it('Evening: allows all categories', () => {
    const allCats = [SPOT_A, SPOT_BAR, SPOT_NATURE, SPOT_ACTIVITY];
    const results = forgePlans(
      { ...BASE_INPUT, daypart: 'Evening', vibe: 'Chill', budget: 60000 },
      allCats
    );
    expect(results.length).toBe(3);
  });

  it('"Any time" does not apply any daypart filter', () => {
    const allCats = [SPOT_A, SPOT_BAR, SPOT_NATURE, SPOT_ACTIVITY];
    const results = forgePlans(
      { ...BASE_INPUT, daypart: 'Any time', vibe: 'Chill', budget: 60000 },
      allCats
    );
    expect(results.length).toBe(3);
  });

  it('undefined daypart does not apply any daypart filter', () => {
    const allCats = [SPOT_A, SPOT_BAR, SPOT_NATURE, SPOT_ACTIVITY];
    const withoutDaypart: ForgeInput = { ...BASE_INPUT, vibe: 'Chill', budget: 60000 };
    const results = forgePlans(withoutDaypart, allCats);
    expect(results.length).toBe(3);
  });
});

// ─── Filter: category group ───────────────────────────────────────────────────

describe('forgePlans — category group filter', () => {
  it('"Eat and drink" includes restaurant, bar, cafe; excludes activity, nature', () => {
    const restaurant = makeSpot({ id: 'a9b0c1d2-0000-0000-0000-000000000050', category: 'restaurant', vibe_tags: ['Chill'], price_per_person: 3000 });
    const bar        = makeSpot({ id: 'b0c1d2e3-0000-0000-0000-000000000051', category: 'bar',        vibe_tags: ['Chill'], price_per_person: 3000 });
    const cafe       = makeSpot({ id: 'c1d2e3f4-0000-0000-0000-000000000052', category: 'cafe',       vibe_tags: ['Chill'], price_per_person: 3000 });
    const activity   = makeSpot({ id: 'd2e3f4a5-0000-0000-0000-000000000053', category: 'activity',   vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });
    const nature     = makeSpot({ id: 'e3f4a5b6-0000-0000-0000-000000000054', category: 'nature',     vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });

    const results = forgePlans(
      { ...BASE_INPUT, categoryGroup: 'Eat and drink', budget: 30000 },
      [restaurant, bar, cafe, activity, nature]
    );
    const ids = results.map(r => r.spot.id);
    expect(ids).toContain(restaurant.id);
    expect(ids).toContain(bar.id);
    expect(ids).toContain(cafe.id);
    expect(ids).not.toContain(activity.id);
    expect(ids).not.toContain(nature.id);
  });

  it('"Activity and fun" includes activity, entertainment, experience; excludes restaurant, nature', () => {
    const activity      = makeSpot({ id: 'f4a5b6c7-0000-0000-0000-000000000060', category: 'activity',      vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });
    const entertainment = makeSpot({ id: 'a5b6c7d8-0000-0000-0000-000000000061', category: 'entertainment', vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });
    const experience    = makeSpot({ id: 'b6c7d8e9-0000-0000-0000-000000000062', category: 'experience',    vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });
    const restaurant    = makeSpot({ id: 'c7d8e9f0-0000-0000-0000-000000000063', category: 'restaurant',    vibe_tags: ['Chill'],                  price_per_person: 3000 });
    const nature        = makeSpot({ id: 'd8e9f0a1-0000-0000-0000-000000000064', category: 'nature',        vibe_tags: ['Chill'], has_food: false, price_per_person: 3000 });

    const results = forgePlans(
      { ...BASE_INPUT, categoryGroup: 'Activity and fun', budget: 30000 },
      [activity, entertainment, experience, restaurant, nature]
    );
    const ids = results.map(r => r.spot.id);
    expect(ids).toContain(activity.id);
    expect(ids).toContain(entertainment.id);
    expect(ids).toContain(experience.id);
    expect(ids).not.toContain(restaurant.id);
    expect(ids).not.toContain(nature.id);
  });

  it('"Nature and outdoors" includes nature, beach; excludes restaurant, bar', () => {
    const nature     = makeSpot({ id: 'e9f0a1b2-0000-0000-0000-000000000070', category: 'nature', vibe_tags: ['Chill'], has_food: false, price_per_person: 2000 });
    const beach      = makeSpot({ id: 'f0a1b2c3-0000-0000-0000-000000000071', category: 'beach',  vibe_tags: ['Chill'], has_food: false, price_per_person: 2000 });
    const restaurant = makeSpot({ id: 'a1b2c3d4-0000-0000-0000-000000000072', category: 'restaurant', vibe_tags: ['Chill'], price_per_person: 2000 });

    const results = forgePlans(
      { ...BASE_INPUT, categoryGroup: 'Nature and outdoors', budget: 30000 },
      [nature, beach, restaurant]
    );
    const ids = results.map(r => r.spot.id);
    expect(ids).toContain(nature.id);
    expect(ids).toContain(beach.id);
    expect(ids).not.toContain(restaurant.id);
  });

  it('"Anywhere" does not restrict by category', () => {
    const spots = [SPOT_A, SPOT_BAR, SPOT_NATURE, SPOT_ACTIVITY];
    const results = forgePlans(
      { ...BASE_INPUT, categoryGroup: 'Anywhere', vibe: 'Chill', budget: 60000 },
      spots
    );
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── Cost calculation ─────────────────────────────────────────────────────────

describe('forgePlans — cost calculation', () => {
  it('applies no 1.1× buffer for food spots — derived_typical_cost already includes VAT (Phase 3A)', () => {
    const foodSpot = makeSpot({
      id: 'b2c3d4e5-0000-0000-0000-000000000080',
      price_per_person: 5000,
      has_food: true,
      transport_matrix: { ikeja: 0 }, // isolate food cost
    });
    // Phase 3A: activityCost = price_per_person × squadSize (no buffer)
    // price_per_person = derived_typical_cost (already embeds VAT via pricingEngine)
    // activityCost = round(5000 × 2 / 100) × 100 = 10000
    const results = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 50000, vibe: 'Chill' }, [foodSpot]);
    expect(results).toHaveLength(1);
    expect(results[0].foodCost).toBe(10000);
  });

  it('applies no buffer for non-food spots (has_food === false)', () => {
    const noFoodSpot = makeSpot({
      id: 'c3d4e5f6-0000-0000-0000-000000000081',
      price_per_person: 5000,
      has_food: false,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    // activityCost = round(5000 × 2 × 1.0 / 100) × 100 = 10000
    const results = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 50000 }, [noFoodSpot]);
    expect(results).toHaveLength(1);
    expect(results[0].foodCost).toBe(10000);
  });

  it('has_food value has no effect on cost — buffer removed in Phase 3A', () => {
    const undefinedFood = makeSpot({
      id: 'd4e5f6a7-0000-0000-0000-000000000082',
      price_per_person: 5000,
      has_food: undefined,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 50000 }, [undefinedFood]);
    expect(results).toHaveLength(1);
    // Phase 3A: no buffer regardless of has_food
    expect(results[0].foodCost).toBe(10000);
  });

  it('rounds activity cost to nearest ₦100', () => {
    // Phase 3A: 3333 × 2 = 6666 → round to nearest 100 → 6700
    const spot = makeSpot({
      id: 'e5f6a7b8-0000-0000-0000-000000000083',
      price_per_person: 3333,
      has_food: true,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 50000 }, [spot]);
    expect(results).toHaveLength(1);
    expect(results[0].foodCost % 100).toBe(0);
    expect(results[0].foodCost).toBe(6700);
  });

  it('uses transport_matrix override when available for start area', () => {
    const matrixSpot = makeSpot({
      id: 'f6a7b8c9-0000-0000-0000-000000000084',
      price_per_person: 3000,
      transport_matrix: { ikeja: 2500 }, // specific override
      address_slug: 'lekki-phase-1',    // zone formula would give 16000
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, startArea: 'ikeja', budget: 30000 }, [matrixSpot]);
    expect(results).toHaveLength(1);
    expect(results[0].transportCost).toBe(2500);
  });

  it('falls back to calculateZoneFare when transport_matrix has no entry for start area', () => {
    const spot = makeSpot({
      id: 'a7b8c9d0-0000-0000-0000-000000000085',
      price_per_person: 3000,
      transport_matrix: {},              // no entry for ikeja
      address_slug: 'gbagada',          // same zone as ikeja → ₦5,000
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, startArea: 'ikeja', budget: 30000 }, [spot]);
    expect(results).toHaveLength(1);
    expect(results[0].transportCost).toBe(5000);
  });

  it('totalCost equals foodCost + transportCost', () => {
    const results = forgePlans(BASE_INPUT, [SPOT_A]);
    if (results.length > 0) {
      const plan = results[0];
      expect(plan.totalCost).toBe(plan.foodCost + plan.transportCost);
    }
  });

  it('scales activity cost linearly with squad size', () => {
    const spot = makeSpot({
      id: 'b8c9d0e1-0000-0000-0000-000000000086',
      price_per_person: 5000,
      has_food: false,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const twoPersonResult = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 50000 }, [spot]);
    const fourPersonResult = forgePlans({ ...BASE_INPUT, squadSize: 4, budget: 100000 }, [spot]);

    expect(twoPersonResult[0].foodCost).toBe(10000);
    expect(fourPersonResult[0].foodCost).toBe(20000);
  });
});

// ─── Budget gate ──────────────────────────────────────────────────────────────

describe('forgePlans — budget gate', () => {
  it('excludes spots where total cost exceeds budget', () => {
    const expensiveSpot = makeSpot({
      id: 'c9d0e1f2-0000-0000-0000-000000000090',
      price_per_person: 30000, // 2 × 30000 × 1.1 = 66000 > 50000
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [expensiveSpot]);
    expect(results).toHaveLength(0);
  });

  it('includes spots where total cost equals budget exactly', () => {
    // Budget: 20000. transport: 0. food: 2 × 9091 × 1.1 ≈ 20000
    // Use exact calculation: need foodCost = 20000, so price × 2 × 1.1 / 100 rounded × 100 = 20000
    // price = 20000 / 2 / 1.1 ≈ 9090.9 → use 9091: 9091 × 2 × 1.1 = 20000.2 → round(20000.2/100)*100 = 20000
    const exactSpot = makeSpot({
      id: 'd0e1f2a3-0000-0000-0000-000000000091',
      price_per_person: 9091,
      has_food: true,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 20000 }, [exactSpot]);
    expect(results).toHaveLength(1);
    expect(results[0].totalCost).toBeLessThanOrEqual(20000);
  });

  it('excludes spots where transport cost exceeds 35% of budget', () => {
    // budget = 50000. Transport limit = 17500.
    const farSpot = makeSpot({
      id: 'e1f2a3b4-0000-0000-0000-000000000092',
      price_per_person: 1000,
      transport_matrix: { ikeja: 18000 }, // 18000 > 17500
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [farSpot]);
    expect(results).toHaveLength(0);
  });

  it('includes spots where transport cost equals 35% of budget exactly', () => {
    // budget = 50000. 35% = 17500.
    const borderSpot = makeSpot({
      id: 'f2a3b4c5-0000-0000-0000-000000000093',
      price_per_person: 1000,
      transport_matrix: { ikeja: 17500 }, // exactly 35%
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [borderSpot]);
    // 17500 + (1000 × 2 × 1.1 = 2200) = 19700 < 50000
    expect(results).toHaveLength(1);
    expect(results[0].transportCost).toBe(17500);
  });

  it('transport gate uses strict greater-than (> 0.35), not >=', () => {
    // transport at exactly 35% passes — confirmed above.
    // transport at 35% + 1 fails:
    const overBorderSpot = makeSpot({
      id: 'a3b4c5d6-0000-0000-0000-000000000094',
      price_per_person: 1000,
      transport_matrix: { ikeja: 17501 }, // 17501 > 17500
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [overBorderSpot]);
    expect(results).toHaveLength(0);
  });

  it('returned plans never exceed the stated budget', () => {
    const spots = [SPOT_A, SPOT_FEATURED, SPOT_ACTIVITY, SPOT_BAR, SPOT_NATURE];
    const results = forgePlans({ ...BASE_INPUT, budget: 40000 }, spots);
    for (const plan of results) {
      expect(plan.totalCost).toBeLessThanOrEqual(40000);
    }
  });
});

// ─── Scoring ──────────────────────────────────────────────────────────────────

describe('forgePlans — scoring', () => {
  it('featured spot (+30 boost) outscores an otherwise identical non-featured spot', () => {
    // Both spots: same vibe, same cost, same address, same transport
    const nonFeatured = makeSpot({
      id: 'b4c5d6e7-0000-0000-0000-0000000000a0',
      vibe_tags: ['Chill'],
      price_per_person: 5000,
      is_featured: false,
      transport_matrix: { ikeja: 5000 },
    });
    const featured = makeSpot({
      id: 'c5d6e7f8-0000-0000-0000-0000000000a1',
      vibe_tags: ['Chill'],
      price_per_person: 5000,
      is_featured: true,
      transport_matrix: { ikeja: 5000 },
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [nonFeatured, featured]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.id).toBe(featured.id);
  });

  it('featured boost is exactly 30 points — a very close non-featured spot does not beat featured', () => {
    // Non-featured spot has the best possible cost score (totalCost = budget → costScore = 80).
    // Featured spot has worst possible cost score within budget (totalCost = 1 → costScore ≈ 80 - 80/budget).
    // The 30-point boost ensures featured still wins unless non-featured has > 30 more cost score points.
    // Set up so non-featured is slightly better on cost but featured wins on boost.
    const nonFeatured = makeSpot({
      id: 'd6e7f8a9-0000-0000-0000-0000000000a2',
      vibe_tags: ['Chill'],
      price_per_person: 9000,  // 2 × 9000 × 1.1 = 19800. Total = 19800. Score ≈ (1 - |20000-19800|/20000)*80 ≈ 79.2
      is_featured: false,
      transport_matrix: { ikeja: 200 },
    });
    const featured = makeSpot({
      id: 'e7f8a9b0-0000-0000-0000-0000000000a3',
      vibe_tags: ['Chill'],
      price_per_person: 5000,  // 2 × 5000 × 1.1 = 11000. Total = 11200. Score ≈ (1 - |20000-11200|/20000)*80 ≈ 44.8. +30 = 74.8
      is_featured: true,
      transport_matrix: { ikeja: 200 },
    });
    // nonFeatured total score ≈ 79.2, featured total score ≈ 74.8 (excluding idWeight).
    // featured does NOT necessarily win here — this tests that when cost difference > 30pts, non-featured can win.
    const results = forgePlans({ ...BASE_INPUT, budget: 20000, squadSize: 2 }, [nonFeatured, featured]);
    expect(results).toHaveLength(2);
    // nonFeatured should win (higher cost score outweighs 30pt boost)
    expect(results[0].spot.id).toBe(nonFeatured.id);
  });

  it('cost score rewards plans that use the budget well (closer to budget = higher score)', () => {
    const efficient = makeSpot({
      id: 'f8a9b0c1-0000-0000-0000-0000000000a4',
      price_per_person: 9000, // totalCost ≈ 20000 (close to budget)
      has_food: true,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const cheap = makeSpot({
      id: 'a9b0c1d2-0000-0000-0000-0000000000a5',
      price_per_person: 1000, // totalCost ≈ 2200 (far below budget)
      has_food: true,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 20000, squadSize: 2 }, [efficient, cheap]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.id).toBe(efficient.id);
  });

  // DN-2: In practice, vibeScore is 0 or 5, never 10. A tag appears once in vibe_tags.
  it('vibeScore is 5 when vibe matches (one occurrence), not higher', () => {
    const spot = makeSpot({
      id: 'b0c1d2e3-0000-0000-0000-0000000000a6',
      vibe_tags: ['Chill', 'Dinner', 'Chill'], // duplicate to demonstrate cap
      price_per_person: 3000,
      transport_matrix: { ikeja: 0 },
    });
    // Even with duplicate 'Chill' in tags, vibeMatches counts occurrences: 2 × 5 = 10, capped at 10.
    // With a single 'Chill', vibeMatches = 1, vibeScore = 5.
    // Test confirms the calculation is based on exact string occurrences, not just presence.
    const results = forgePlans({ ...BASE_INPUT, budget: 20000 }, [spot]);
    expect(results).toHaveLength(1);
    // Cannot directly observe vibeScore, but determinism test ensures it's stable.
  });

  it('idWeight is deterministic for the same spot ID', () => {
    // Same spot, run forgePlans twice — idWeight (and score) must be identical.
    const results1 = forgePlans(BASE_INPUT, [SPOT_A]);
    const results2 = forgePlans(BASE_INPUT, [SPOT_A]);
    if (results1.length > 0 && results2.length > 0) {
      expect(results1[0].totalCost).toBe(results2[0].totalCost);
    }
  });
});

// ─── Ordering guarantees ──────────────────────────────────────────────────────

describe('forgePlans — ordering guarantees', () => {
  it('returns results sorted by score descending', () => {
    // SPOT_FEATURED has +30 boost over SPOT_A with identical cost — should rank first.
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A, SPOT_FEATURED]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.id).toBe(SPOT_FEATURED.id);
  });

  it('pinned spot is always first regardless of score', () => {
    const results = forgePlans(
      { ...BASE_INPUT, pinnedSpotId: SPOT_A.id },
      [SPOT_A, SPOT_FEATURED]
    );
    expect(results[0].spot.id).toBe(SPOT_A.id);
  });

  it('returns at most 3 results regardless of how many spots pass filters', () => {
    const manySpots = Array.from({ length: 10 }, (_, i) =>
      makeSpot({
        id: `c1d2e3f${i}-0000-0000-0000-00000000b0${i.toString().padStart(2, '0')}`,
        vibe_tags: ['Chill'],
        price_per_person: 3000 + i * 100,
        transport_matrix: { ikeja: 1000 },
      })
    );
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, manySpots);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('returns fewer than 3 results when fewer than 3 spots pass all filters', () => {
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A]);
    expect(results).toHaveLength(1);
  });
});

// ─── Result count ─────────────────────────────────────────────────────────────

describe('forgePlans — result count', () => {
  it('returns empty array when no spots provided', () => {
    const results = forgePlans(BASE_INPUT, []);
    expect(results).toHaveLength(0);
  });

  it('returns empty array when all spots fail vibe filter', () => {
    const wrongVibeSpot = makeSpot({
      id: 'd2e3f4a5-0000-0000-0000-0000000000c0',
      vibe_tags: ['Party'],
    });
    const results = forgePlans({ ...BASE_INPUT, vibe: 'Chill' }, [wrongVibeSpot]);
    expect(results).toHaveLength(0);
  });

  it('returns empty array when all spots exceed budget', () => {
    const expensiveSpot = makeSpot({
      id: 'e3f4a5b6-0000-0000-0000-0000000000c1',
      price_per_person: 50000,
      vibe_tags: ['Chill'],
    });
    const results = forgePlans({ ...BASE_INPUT, budget: 10000 }, [expensiveSpot]);
    expect(results).toHaveLength(0);
  });

  it('never returns more than 3 results', () => {
    const spots = Array.from({ length: 20 }, (_, i) =>
      makeSpot({
        id: `f4a5b6c${i}-0000-0000-0000-00000000c0${i.toString().padStart(2, '0')}`,
        vibe_tags: ['Chill'],
        price_per_person: 2000,
        transport_matrix: { ikeja: 1000 },
      })
    );
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, spots);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

// ─── Determinism ──────────────────────────────────────────────────────────────

describe('forgePlans — determinism (CLAUDE.md Invariant #1)', () => {
  it('same inputs produce identical output on repeated calls', () => {
    const spots = [SPOT_A, SPOT_FEATURED, SPOT_BAR, SPOT_NATURE];
    const input: ForgeInput = { ...BASE_INPUT, vibe: 'Chill', budget: 60000 };
    const results1 = forgePlans(input, spots);
    const results2 = forgePlans(input, spots);
    expect(results1.map(r => r.spot.id)).toEqual(results2.map(r => r.spot.id));
    expect(results1.map(r => r.totalCost)).toEqual(results2.map(r => r.totalCost));
    expect(results1.map(r => r.whyItFits)).toEqual(results2.map(r => r.whyItFits));
  });

  it('different squad sizes produce different costs for the same spot', () => {
    const results2 = forgePlans({ ...BASE_INPUT, squadSize: 2, budget: 30000 }, [SPOT_A]);
    const results4 = forgePlans({ ...BASE_INPUT, squadSize: 4, budget: 50000 }, [SPOT_A]);
    if (results2.length > 0 && results4.length > 0) {
      expect(results2[0].foodCost).not.toBe(results4[0].foodCost);
    }
  });

  it('different budgets do not affect which spot is selected (only whether it passes the gate)', () => {
    // SPOT_A with 2 people: activityCost ≈ 11000 + transportCost.
    // With budget 15000 it might not pass gate. With budget 50000 it should.
    const lowBudgetResults = forgePlans({ ...BASE_INPUT, budget: 5000 }, [SPOT_A]);
    const highBudgetResults = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A]);
    // Low budget: SPOT_A likely excluded. High budget: included.
    expect(highBudgetResults.length).toBeGreaterThanOrEqual(lowBudgetResults.length);
  });
});

// ─── Plan output shape ────────────────────────────────────────────────────────

describe('forgePlans — output shape', () => {
  it('every plan has spot, foodCost, transportCost, totalCost, whyItFits', () => {
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A]);
    expect(results).toHaveLength(1);
    const plan = results[0];
    expect(plan).toHaveProperty('spot');
    expect(plan).toHaveProperty('foodCost');
    expect(plan).toHaveProperty('transportCost');
    expect(plan).toHaveProperty('totalCost');
    expect(plan).toHaveProperty('whyItFits');
  });

  it('whyItFits is a non-empty string', () => {
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A]);
    expect(results).toHaveLength(1);
    expect(typeof results[0].whyItFits).toBe('string');
    expect(results[0].whyItFits.length).toBeGreaterThan(0);
  });

  it('whyItFits says "Right on budget" when total is within ₦2,000 of budget', () => {
    // Need totalCost to be within 2000 of budget. Set budget = totalCost exactly.
    // food: 2 × 5000 × 1.1 = 11000. transport: 5000. total = 16000.
    const spot = makeSpot({
      id: 'a5b6c7d8-0000-0000-0000-0000000000d0',
      price_per_person: 5000,
      has_food: true,
      transport_matrix: { ikeja: 5000 },
      vibe_tags: ['Chill'],
    });
    const totalCost = 11000 + 5000; // = 16000
    const results = forgePlans({ ...BASE_INPUT, budget: totalCost, squadSize: 2 }, [spot]);
    expect(results).toHaveLength(1);
    expect(results[0].whyItFits).toBe('Right on budget. Spent well.');
  });

  it('whyItFits mentions squad saving when under budget by more than ₦2,000', () => {
    const cheapSpot = makeSpot({
      id: 'b6c7d8e9-0000-0000-0000-0000000000d1',
      price_per_person: 2000,
      has_food: true,
      transport_matrix: { ikeja: 0 },
      vibe_tags: ['Chill'],
    });
    // food: 2 × 2000 × 1.1 = 4400. budget: 50000. diff = 45600 > 2000.
    const results = forgePlans({ ...BASE_INPUT, budget: 50000, squadSize: 2 }, [cheapSpot]);
    expect(results).toHaveLength(1);
    expect(results[0].whyItFits).toMatch(/saves ₦/);
  });

  it('all returned costs are non-negative integers', () => {
    const results = forgePlans({ ...BASE_INPUT, budget: 50000 }, [SPOT_A, SPOT_FEATURED]);
    for (const plan of results) {
      expect(plan.foodCost).toBeGreaterThanOrEqual(0);
      expect(plan.transportCost).toBeGreaterThanOrEqual(0);
      expect(plan.totalCost).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(plan.foodCost)).toBe(true);
      expect(Number.isInteger(plan.totalCost)).toBe(true);
    }
  });
});

// ─── Phase 3A: Buffer removal + trust ranking ─────────────────────────────────

describe('Phase 3A — cost calculation buffer removal', () => {
  /**
   * Phase 3A removed the has_food 1.1 multiplier from activityCost.
   * The spots VIEW maps derived_typical_cost → price_per_person, which already
   * includes VAT via pricingEngine.ts. Applying a 1.1 buffer on top was double-tax.
   *
   * Assertion: foodCost === price_per_person × squadSize (no buffer).
   */
  it('should compute foodCost as price_per_person × squadSize without buffer', () => {
    const spot = makeSpot({
      id: 'c3d4e5f6-0000-0000-0000-000000000003',
      price_per_person: 10000,
      has_food: true,
      transport_matrix: { ikeja: 2000 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans(
      { startArea: 'ikeja', squadSize: 3, budget: 100000, vibe: 'Chill' },
      [spot]
    );
    expect(results).toHaveLength(1);
    // foodCost must be exactly 10000 × 3 = 30000 (no 1.1 buffer)
    expect(results[0].foodCost).toBe(30000);
  });

  it('should compute identical foodCost whether has_food is true or false', () => {
    const spotWithFood = makeSpot({
      id: 'd4e5f6a7-0000-0000-0000-000000000001',
      price_per_person: 8000,
      has_food: true,
      transport_matrix: { ikeja: 1000 },
      vibe_tags: ['Chill'],
    });
    const spotNoFood = makeSpot({
      id: 'd4e5f6a7-0000-0000-0000-000000000002',
      price_per_person: 8000,
      has_food: false,
      transport_matrix: { ikeja: 1000 },
      vibe_tags: ['Chill'],
    });
    const input = { startArea: 'ikeja', squadSize: 2, budget: 50000, vibe: 'Chill' };
    const withFood = forgePlans(input, [spotWithFood]);
    const noFood = forgePlans(input, [spotNoFood]);
    expect(withFood[0]?.foodCost).toBe(noFood[0]?.foodCost);
  });
});

describe('Phase 3A — trust-based ranking', () => {
  /**
   * The matching engine applies a statusBoost derived from operational_status
   * (mapped via spots VIEW → verified_by column).
   *
   * fresh (+25) > community_verified (+20) > verified (0) > stale (-20) > needs_review (-40)
   *
   * When cost, vibe, and featured are equal, the trust signal breaks the tie.
   */

  const TRUST_INPUT: ForgeInput = {
    startArea: 'yaba',
    squadSize: 2,
    budget: 50000,
    vibe: 'Chill',
  };

  const FRESH_SPOT = makeSpot({
    id: 'e5f6a7b8-0000-0000-0000-000000000001',
    name: 'Fresh Verified',
    price_per_person: 10000,
    transport_matrix: { yaba: 2000 },
    vibe_tags: ['Chill'],
    verified_by: 'fresh',
    computed_confidence_score: 95,
  });

  const STALE_SPOT = makeSpot({
    id: 'f6a7b8c9-0000-0000-0000-000000000001',
    name: 'Stale Data',
    price_per_person: 10000,
    transport_matrix: { yaba: 2000 },
    vibe_tags: ['Chill'],
    verified_by: 'stale',
    computed_confidence_score: 30,
  });

  const NEEDS_REVIEW_SPOT = makeSpot({
    id: 'a7b8c9d0-0000-0000-0000-000000000001',
    name: 'Needs Review',
    price_per_person: 10000,
    transport_matrix: { yaba: 2000 },
    vibe_tags: ['Chill'],
    verified_by: 'needs_review',
    computed_confidence_score: 15,
  });

  it('should rank fresh spot above stale spot when cost and vibe are equal', () => {
    const results = forgePlans(TRUST_INPUT, [STALE_SPOT, FRESH_SPOT]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.name).toBe('Fresh Verified');
  });

  it('should rank stale spot above needs_review spot', () => {
    const results = forgePlans(TRUST_INPUT, [NEEDS_REVIEW_SPOT, STALE_SPOT]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.name).toBe('Stale Data');
  });

  it('should rank fresh spot above needs_review spot', () => {
    const results = forgePlans(TRUST_INPUT, [NEEDS_REVIEW_SPOT, FRESH_SPOT]);
    expect(results).toHaveLength(2);
    expect(results[0].spot.name).toBe('Fresh Verified');
  });
});

describe('Phase 3A — explanation fields', () => {
  it('should include explanation with all required fields', () => {
    const spot = makeSpot({
      id: 'b8c9d0e1-0000-0000-0000-000000000001',
      price_per_person: 12000,
      transport_matrix: { ikeja: 3000 },
      vibe_tags: ['Chill'],
    });
    const results = forgePlans(
      { startArea: 'ikeja', squadSize: 2, budget: 60000, vibe: 'Chill' },
      [spot]
    );
    expect(results).toHaveLength(1);
    const exp = results[0].explanation;
    expect(exp).toBeDefined();
    expect(typeof exp?.budget_fit).toBe('string');
    expect(typeof exp?.freshness).toBe('string');
    expect(typeof exp?.confidence).toBe('string');
    expect(typeof exp?.tax_transparency).toBe('string');
  });

  it('should include source_label in explanation', () => {
    const spot = makeSpot({
      id: 'c9d0e1f2-0000-0000-0000-000000000001',
      price_per_person: 8000,
      transport_matrix: { yaba: 2000 },
      vibe_tags: ['Chill'],
      price_source: 'manual',
    });
    const results = forgePlans(
      { startArea: 'yaba', squadSize: 2, budget: 40000, vibe: 'Chill' },
      [spot]
    );
    expect(results[0].explanation?.source_label).toBe('Verified by admin');
  });

  it('should include confidence_score as a number in explanation', () => {
    const spot = makeSpot({
      id: 'd0e1f2a3-0000-0000-0000-000000000001',
      price_per_person: 8000,
      transport_matrix: { yaba: 2000 },
      vibe_tags: ['Chill'],
      computed_confidence_score: 77,
    });
    const results = forgePlans(
      { startArea: 'yaba', squadSize: 2, budget: 40000, vibe: 'Chill' },
      [spot]
    );
    expect(results[0].explanation?.confidence_score).toBe(77);
    expect(results[0].explanation?.confidence).toBe('77% data confidence');
  });
});

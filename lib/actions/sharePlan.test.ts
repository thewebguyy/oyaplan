import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShareablePlan } from './sharePlan';
import { supabase } from '../supabase';
import { getSpotForPricing } from '../queries/spots';
import { Plan, ForgeInput, Spot } from '../types';
import { SessionResolver } from '../services/identity/sessionResolver';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../queries/spots', () => ({
  getSpotForPricing: vi.fn(),
}));

vi.mock('../sentry', () => ({
  captureServerException: vi.fn(),
}));

vi.mock('../services/identity/sessionResolver', () => ({
  SessionResolver: {
    resolveIdentity: vi.fn().mockResolvedValue({
      type: 'anonymous',
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      profile: null,
    }),
  },
}));

vi.mock('../services/identity/savedPlanService', () => ({
  SavedPlanService: {
    savePlan: vi.fn().mockResolvedValue({ success: true }),
  },
}));

const SPOT_ID = '123e4567-e89b-12d3-a456-426614174000';

// Trusted database row (what getSpotForPricing returns).
const dbSpot: Spot = {
  id: SPOT_ID,
  name: 'Spot',
  address: 'Address',
  area_id: 'area-id',
  address_slug: 'ikeja', // mainland => ₦5,000 zone estimate
  vibe_tags: [],
  price_per_person: 1000,
  transport_matrix: {},
  is_featured: false,
  active: true,
  verified_by: 'seed',
  price_source: 'historical_estimate',
};

describe('createShareablePlan action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSpotForPricing).mockResolvedValue({ data: { ...dbSpot }, error: null });
  });

  // Client-supplied plan. Only spot.id is trusted as a reference.
  const validSpot = {
    id: SPOT_ID,
    name: 'Spot',
    address: 'Address',
    area_id: 'area-id',
    vibe_tags: [],
    price_per_person: 1000,
    transport_matrix: {},
    is_featured: false,
    active: true,
  };

  const validPlan: Plan = {
    spot: validSpot,
    foodCost: 3000,
    transportCost: 5000,
    totalCost: 8000,
    whyItFits: 'Fits well',
  };

  const validInput: ForgeInput = {
    startArea: 'Lekki',
    squadSize: 3,
    budget: 10000,
    vibe: 'Chill',
  };

  function mockInsertSuccess() {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-uuid' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as unknown as ReturnType<typeof supabase.from>);
    return mockInsert;
  }

  function expectNothingPersisted() {
    expect(supabase.from).not.toHaveBeenCalled();
  }

  describe('legitimate sharing', () => {
    it('should accept valid inputs and insert into DB', async () => {
      const mockInsert = mockInsertSuccess();

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: true, id: 'new-uuid' });
      expect(mockInsert).toHaveBeenCalled();
      expect(getSpotForPricing).toHaveBeenCalledWith(SPOT_ID);
    });

    it('persists server-computed costs that match the planning engine (food + zone transport)', async () => {
      const mockInsert = mockInsertSuccess();

      await createShareablePlan(validPlan, validInput);

      const row = mockInsert.mock.calls[0][0];
      expect(row.food_cost).toBe(3000); // 1000 x 3
      expect(row.transport_cost).toBe(5000); // mainland zone estimate
      expect(row.total_cost).toBe(8000);
      expect(row.spot_id).toBe(SPOT_ID);
    });

    it('prices island venues with the island zone estimate and labels transport as a zone estimate', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({
        data: { ...dbSpot, address_slug: 'lekki-phase-1' },
        error: null,
      });
      const mockInsert = mockInsertSuccess();

      await createShareablePlan(validPlan, validInput);

      const row = mockInsert.mock.calls[0][0];
      expect(row.transport_cost).toBe(10000);
      expect(row.total_cost).toBe(13000);
      expect(row.transport_estimate.calculationVersion).toBe('temporary-zone-v1');
    });
  });

  describe('tampered client values', () => {
    it('ignores forged client costs and stores the server-computed total', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({
        data: { ...dbSpot, price_per_person: 50000, address_slug: 'vi' },
        error: null,
      });
      const mockInsert = mockInsertSuccess();
      const forged: Plan = { ...validPlan, foodCost: 50, transportCost: 50, totalCost: 100, whyItFits: 'Hacked' };

      const result = await createShareablePlan(forged, { ...validInput, squadSize: 4, budget: 300000 });

      expect(result.success).toBe(true);
      const row = mockInsert.mock.calls[0][0];
      expect(row.food_cost).toBe(200000);
      expect(row.transport_cost).toBe(10000);
      expect(row.total_cost).toBe(210000);
      expect(row.why_it_fits).not.toBe('Hacked');
    });

    it('ignores a forged venue price embedded in the client spot object', async () => {
      const mockInsert = mockInsertSuccess();
      const forged: Plan = { ...validPlan, spot: { ...validSpot, price_per_person: 1 } };

      await createShareablePlan(forged, validInput);

      expect(mockInsert.mock.calls[0][0].food_cost).toBe(3000);
    });

    it('does not trust a client-supplied verified status or explanation', async () => {
      const mockInsert = mockInsertSuccess();
      const forged = {
        ...validPlan,
        explanation: { status: 'verified', freshness: 'Prices updated today', confidence: '100% data confidence' },
      } as unknown as Plan;

      await createShareablePlan(forged, validInput);

      const row = mockInsert.mock.calls[0][0];
      expect(row.explanation.status).toBe('seed'); // from DB verified_by, not the client
      expect(row.explanation.freshness).toBe('Estimated from historical data');
      expect(row.explanation.confidence_score).toBe(50);
    });

    it('does not let the client choose the owning user', async () => {
      const mockInsert = mockInsertSuccess();
      const forgedInput = { ...validInput, userId: 'victim-user-id' } as ForgeInput;

      await createShareablePlan(validPlan, forgedInput);

      expect(mockInsert.mock.calls[0][0].user_id).toBeNull();
    });

    it('uses the DB venue id, not any other id the client smuggles in', async () => {
      const mockInsert = mockInsertSuccess();
      const forged = { ...validPlan, spot_id: '00000000-0000-4000-8000-000000000000' } as unknown as Plan;

      await createShareablePlan(forged, validInput);

      expect(mockInsert.mock.calls[0][0].spot_id).toBe(SPOT_ID);
    });
  });

  describe('malformed input', () => {
    it('should reject if spot id is not a uuid', async () => {
      const invalidPlan = { ...validPlan, spot: { ...validSpot, id: 'not-a-uuid' } };

      const result = await createShareablePlan(invalidPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expect(getSpotForPricing).not.toHaveBeenCalled();
      expectNothingPersisted();
    });

    it('should reject if cost is a negative number', async () => {
      const invalidPlan = { ...validPlan, totalCost: -100 };

      const result = await createShareablePlan(invalidPlan as Plan, validInput);

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expectNothingPersisted();
    });

    it.each([
      ['negative food cost', { foodCost: -1 }],
      ['negative transport cost', { transportCost: -5000 }],
      ['fractional total', { totalCost: 100.5 }],
      ['NaN total', { totalCost: NaN }],
      ['Infinity total', { totalCost: Infinity }],
      ['string total', { totalCost: '100' }],
    ])('should reject %s', async (_label, patch) => {
      const result = await createShareablePlan({ ...validPlan, ...patch } as unknown as Plan, validInput);

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expect(getSpotForPricing).not.toHaveBeenCalled();
      expectNothingPersisted();
    });

    it('should reject if budget is a negative number', async () => {
      const invalidInput = { ...validInput, budget: -100 };

      const result = await createShareablePlan(validPlan, invalidInput);

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expectNothingPersisted();
    });

    it.each([
      ['zero squad', { squadSize: 0 }],
      ['negative squad', { squadSize: -2 }],
      ['fractional squad', { squadSize: 2.5 }],
      ['oversized squad', { squadSize: 51 }],
      ['absurd budget', { budget: 2_000_001 }],
    ])('should reject %s', async (_label, patch) => {
      const result = await createShareablePlan(validPlan, { ...validInput, ...patch });

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expectNothingPersisted();
    });

    it('should reject a missing spot', async () => {
      const result = await createShareablePlan({ ...validPlan, spot: undefined } as unknown as Plan, validInput);

      expect(result).toEqual({ success: false, error: 'Invalid plan data' });
      expectNothingPersisted();
    });
  });

  describe('unauthorized or unavailable venue references', () => {
    it('rejects a well-formed uuid that does not exist in the database', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({ data: null, error: null });

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Venue is not available' });
      expectNothingPersisted();
    });

    it('rejects an inactive venue', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({ data: { ...dbSpot, active: false }, error: null });

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Venue is not available' });
      expectNothingPersisted();
    });

    it('rejects a temporarily closed venue', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({
        data: { ...dbSpot, is_temporarily_closed: true, temporary_closure_start: null, temporary_closure_end: null },
        error: null,
      });

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Venue is not available' });
      expectNothingPersisted();
    });

    it('fails safely (no insert) when the venue lookup errors', async () => {
      vi.mocked(getSpotForPricing).mockResolvedValue({ data: null, error: 'db down' });

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Failed to create plan' });
      expectNothingPersisted();
    });
  });

  describe('missing pricing data', () => {
    it.each([
      ['null price', null],
      ['zero price', 0],
      ['negative price', -500],
      ['non-numeric price', 'free' as unknown as number],
      ['NaN price', NaN],
    ])('refuses to fabricate a total for a venue with %s', async (_label, price) => {
      vi.mocked(getSpotForPricing).mockResolvedValue({
        data: { ...dbSpot, price_per_person: price as unknown as number },
        error: null,
      });

      const result = await createShareablePlan(validPlan, validInput);

      expect(result).toEqual({ success: false, error: 'Pricing is unavailable for this venue' });
      expectNothingPersisted();
    });
  });

  describe('identity attribution', () => {
    it('attributes the plan to the server-resolved session', async () => {
      const mockInsert = mockInsertSuccess();

      await createShareablePlan(validPlan, validInput);

      const row = mockInsert.mock.calls[0][0];
      expect(row.session_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(vi.mocked(SessionResolver.resolveIdentity)).toHaveBeenCalled();
    });
  });
});

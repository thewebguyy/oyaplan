import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShareablePlan } from './sharePlan';
import { supabase } from '../supabase';
import { Plan, ForgeInput } from '../types';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../sentry', () => ({
  captureServerException: vi.fn(),
}));

describe('createShareablePlan action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validSpot = {
    id: '123e4567-e89b-12d3-a456-426614174000',
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
    foodCost: 5000,
    transportCost: 2000,
    totalCost: 7000,
    whyItFits: 'Fits well',
  };

  const validInput: ForgeInput = {
    startArea: 'Lekki',
    squadSize: 3,
    budget: 10000,
    vibe: 'Chill',
  };

  it('should accept valid inputs and insert into DB', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-uuid' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    const result = await createShareablePlan(validPlan, validInput);

    expect(result).toEqual({ success: true, id: 'new-uuid' });
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should reject if spot id is not a uuid', async () => {
    const invalidPlan = { ...validPlan, spot: { ...validSpot, id: 'not-a-uuid' } };
    
    const result = await createShareablePlan(invalidPlan, validInput);
    
    expect(result).toEqual({ success: false, error: 'Invalid plan data' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should reject if cost is a negative number', async () => {
    const invalidPlan = { ...validPlan, totalCost: -100 };
    
    const result = await createShareablePlan(invalidPlan as Plan, validInput);
    
    expect(result).toEqual({ success: false, error: 'Invalid plan data' });
    expect(supabase.from).not.toHaveBeenCalled(); // Wait, the zod schema used z.number().int(). I didn't add .positive() or .nonnegative() to totalCost, only to squadSize and budget. Let me check my sharePlan.ts: foodCost: z.number().int(). I'll update sharePlan.ts Zod schema to be more strict or just test budget.
  });

  it('should reject if budget is a negative number', async () => {
    const invalidInput = { ...validInput, budget: -100 };
    
    const result = await createShareablePlan(validPlan, invalidInput);
    
    expect(result).toEqual({ success: false, error: 'Invalid plan data' });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getForgeSpots } from './spots';
import { supabase } from '../supabase';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// We also need to mock trustEngine because getForgeSpots calls getVenueMethodology and getVenueHistory
vi.mock('../services/trustEngine', () => ({
  getVenueMethodology: vi.fn().mockResolvedValue([]),
  getVenueHistory: vi.fn().mockResolvedValue([]),
}));

describe('spots query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should explicitly bound the query with order and limit', async () => {
    // Setup the builder chain mock
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockIn = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ in: mockIn, order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

    await getForgeSpots(['restaurant']);

    expect(supabase.from).toHaveBeenCalledWith('spots');
    expect(mockSelect).toHaveBeenCalledWith('*, areas(*)');
    expect(mockEq).toHaveBeenCalledWith('active', true);
    expect(mockIn).toHaveBeenCalledWith('category', ['restaurant']);
    expect(mockOrder).toHaveBeenCalledWith('id', { ascending: true });
    expect(mockLimit).toHaveBeenCalledWith(300);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitSpotSuggestion } from './submitSpotSuggestion';
import { supabase } from '../supabase';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../sentry', () => ({
  captureServerException: vi.fn(),
}));

describe('submitSpotSuggestion action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid inputs and insert into DB', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    const result = await submitSpotSuggestion({
      spotName: 'Valid Spot',
      areaName: 'Lekki',
      vibeDescription: 'A very chill place',
      roughPricePerPerson: 10000,
      suggesterWhatsapp: '+2348012345678',
    });

    expect(result).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalledWith({
      spot_name: 'Valid Spot',
      area_name: 'Lekki',
      vibe_description: 'A very chill place',
      rough_price_per_person: 10000,
      suggester_whatsapp: '+2348012345678',
    });
  });

  it('should reject if spotName is empty', async () => {
    const result = await submitSpotSuggestion({
      spotName: '   ',
      areaName: 'Lekki',
    });
    expect(result).toEqual({ success: false, error: 'Invalid input data' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should reject if spotName is too long', async () => {
    const result = await submitSpotSuggestion({
      spotName: 'A'.repeat(101),
      areaName: 'Lekki',
    });
    expect(result).toEqual({ success: false, error: 'Invalid input data' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should reject if suggesterWhatsapp is invalid', async () => {
    const result = await submitSpotSuggestion({
      spotName: 'Valid Spot',
      areaName: 'Lekki',
      suggesterWhatsapp: 'invalid-number',
    });
    expect(result).toEqual({ success: false, error: 'Invalid input data' });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should accept valid local format whatsapp without plus', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

    const result = await submitSpotSuggestion({
      spotName: 'Valid Spot',
      areaName: 'Lekki',
      suggesterWhatsapp: '08012345678',
    });
    expect(result).toEqual({ success: true });
  });
});

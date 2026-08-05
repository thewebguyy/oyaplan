import { describe, it, expect, beforeEach } from 'vitest';
import { Spot } from '@/lib/types';

const STORAGE_KEY = 'oyaplan_saved_ideas';

// In-memory mock for localStorage in node test environment
class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const mockLocalStorage = new MockLocalStorage();

const mockSpot1: Spot = {
  id: 'spot-1',
  name: 'Yellow Chilli',
  address: '35 Joel Ogunnaike St, Ikeja',
  address_slug: 'ikeja',
  area_id: '11111111-1111-1111-1111-111111111111',
  vibe_tags: ['Dinner', 'Foodie'],
  price_per_person: 12500,
  price_updated_at: '2025-01-01',
  price_source: 'chowdeck',
  is_featured: false,
  transport_matrix: {},
  active: true,
  category: 'restaurant',
  has_food: true,
  typical_duration_hours: 2,
  subcategory: 'mid-range',
  price_tier: 3,
  crowd_type: 'young-professionals',
  best_daypart: 'evening',
};

const mockSpot2: Spot = {
  id: 'spot-2',
  name: 'Shiro Lagos',
  address: 'Landmark Centre, VI',
  address_slug: 'vi',
  area_id: '88888888-8888-8888-8888-888888888888',
  vibe_tags: ['Dinner', 'Foodie'],
  price_per_person: 35000,
  price_updated_at: '2025-01-01',
  price_source: 'instagram',
  is_featured: false,
  transport_matrix: {},
  active: true,
  category: 'restaurant',
  has_food: true,
  typical_duration_hours: 3,
  subcategory: 'fine-dining',
  price_tier: 4,
  crowd_type: 'upscale',
  best_daypart: 'night',
};

function saveSpotToStorage(storage: MockLocalStorage, spot: Spot): Spot[] {
  const stored = storage.getItem(STORAGE_KEY);
  const current: Spot[] = stored ? JSON.parse(stored) : [];
  if (current.some(s => s.id === spot.id)) return current;
  const updated = [spot, ...current];
  storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function removeSpotFromStorage(storage: MockLocalStorage, spotId: string): Spot[] {
  const stored = storage.getItem(STORAGE_KEY);
  const current: Spot[] = stored ? JSON.parse(stored) : [];
  const updated = current.filter(s => s.id !== spotId);
  storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

describe('Saved Spots persistence and duplicate prevention logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should initialize empty when no spots are saved', () => {
    const stored = mockLocalStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();
  });

  it('should save a spot and prevent duplicate saves', () => {
    saveSpotToStorage(mockLocalStorage, mockSpot1);
    let current = JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]');
    expect(current).toHaveLength(1);

    // Duplicate save attempt
    saveSpotToStorage(mockLocalStorage, mockSpot1);
    current = JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]');
    expect(current).toHaveLength(1);
  });

  it('should order newly saved spots newest-first', () => {
    saveSpotToStorage(mockLocalStorage, mockSpot1);
    saveSpotToStorage(mockLocalStorage, mockSpot2);

    const current: Spot[] = JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]');
    expect(current).toHaveLength(2);
    expect(current[0].id).toBe('spot-2');
    expect(current[1].id).toBe('spot-1');
  });

  it('should remove a spot from storage', () => {
    saveSpotToStorage(mockLocalStorage, mockSpot1);
    saveSpotToStorage(mockLocalStorage, mockSpot2);

    removeSpotFromStorage(mockLocalStorage, 'spot-1');
    const current: Spot[] = JSON.parse(mockLocalStorage.getItem(STORAGE_KEY) || '[]');
    expect(current).toHaveLength(1);
    expect(current[0].id).toBe('spot-2');
  });
});

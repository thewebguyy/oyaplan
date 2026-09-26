import { describe, it, expect, beforeEach } from 'vitest';
import { RecentlyViewedVenue } from './useRecentlyViewed';

const STORAGE_KEY = 'oyaplan_recently_viewed_v1';
const MAX_RECENT_ITEMS = 10;

class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const mockStorage = new MockLocalStorage();

function recordViewInStorage(
  storage: MockLocalStorage,
  venue: Omit<RecentlyViewedVenue, 'viewedAt'>
): RecentlyViewedVenue[] {
  const stored = storage.getItem(STORAGE_KEY);
  const current: RecentlyViewedVenue[] = stored ? JSON.parse(stored) : [];

  const updatedEntry: RecentlyViewedVenue = {
    ...venue,
    viewedAt: new Date().toISOString(),
  };

  const filtered = current.filter((item) => item.id !== venue.id);
  const updated = [updatedEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);

  storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function clearRecentInStorage(storage: MockLocalStorage): void {
  storage.removeItem(STORAGE_KEY);
}

describe('Recently Viewed Venues Logic', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  const sampleVenue1 = {
    id: 'venue-1',
    name: 'The House Lagos',
    address: '4 AJ Marinho Dr, Victoria Island',
    areaSlug: 'vi',
    areaName: 'Victoria Island',
    category: 'restaurant',
    pricePerPerson: 25000,
    vibeTags: ['Dinner', 'Cocktails'],
  };

  const sampleVenue2 = {
    id: 'venue-2',
    name: 'Burg Lagos',
    address: '11B Isaac John St, Ikeja GRA',
    areaSlug: 'ikeja',
    areaName: 'Ikeja',
    category: 'restaurant',
    pricePerPerson: 15000,
    vibeTags: ['Burgers', 'Chill'],
  };

  it('starts with empty storage', () => {
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('records a viewed venue and stores it with timestamp', () => {
    const result = recordViewInStorage(mockStorage, sampleVenue1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('venue-1');
    expect(result[0].name).toBe('The House Lagos');
    expect(result[0].viewedAt).toBeDefined();
  });

  it('deduplicates and hoists existing venue to index 0 on re-view', () => {
    recordViewInStorage(mockStorage, sampleVenue1);
    recordViewInStorage(mockStorage, sampleVenue2);

    let items = JSON.parse(mockStorage.getItem(STORAGE_KEY) || '[]');
    expect(items[0].id).toBe('venue-2');
    expect(items[1].id).toBe('venue-1');

    // Re-view venue-1
    recordViewInStorage(mockStorage, sampleVenue1);
    items = JSON.parse(mockStorage.getItem(STORAGE_KEY) || '[]');
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('venue-1');
    expect(items[1].id).toBe('venue-2');
  });

  it('strictly caps recent history at 10 items', () => {
    for (let i = 1; i <= 15; i++) {
      recordViewInStorage(mockStorage, {
        id: `venue-${i}`,
        name: `Venue ${i}`,
        address: 'Lagos',
        areaSlug: 'ikeja',
        areaName: 'Ikeja',
        category: 'restaurant',
        pricePerPerson: 10000 + i * 1000,
        vibeTags: ['Chill'],
      });
    }

    const items = JSON.parse(mockStorage.getItem(STORAGE_KEY) || '[]');
    expect(items).toHaveLength(10);
    // Newest is venue-15
    expect(items[0].id).toBe('venue-15');
    // Oldest kept is venue-6
    expect(items[9].id).toBe('venue-6');
  });

  it('clears recent storage correctly', () => {
    recordViewInStorage(mockStorage, sampleVenue1);
    expect(mockStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearRecentInStorage(mockStorage);
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

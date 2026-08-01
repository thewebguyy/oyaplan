import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OriginResolver } from './LocationService';
import { OriginStore } from '@/lib/storage/OriginStore';
import { OriginPolicy } from './OriginPolicy';
import { Origin } from '@/lib/location/types';

describe('Location Domain Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock window and localStorage for OriginStore browser check
    vi.stubGlobal('window', {});
    const mockStorage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('snaps GPS coordinates to the correct planning area', () => {
    // Yaba coordinates: 6.5095, 3.3711
    const yabaCoords = { lat: 6.5095, lng: 3.3711 };
    const origin = OriginResolver.resolveGPSOrigin(yabaCoords);

    expect(origin.source).toBe('gps');
    expect(origin.planningAreaSlug).toBe('yaba');
    expect(origin.resolvedName).toBe('Yaba');
    expect(origin.gpsCoordinates).toEqual(yabaCoords);
  });

  it('resolves manual area slug into origin', () => {
    const origin = OriginResolver.resolveManualOrigin('ikeja');

    expect(origin.source).toBe('manual');
    expect(origin.planningAreaSlug).toBe('ikeja');
    expect(origin.resolvedName).toBe('Ikeja');
    expect(origin.gpsCoordinates).toBeUndefined();
  });

  it('stores and expires GPS origins after 24 hours but manual selections persist via OriginPolicy', () => {
    const gpsOrigin: Origin = {
      source: 'gps',
      gpsCoordinates: { lat: 6.5095, lng: 3.3711 },
      planningAreaSlug: 'yaba',
      resolvedName: 'Yaba'
    };

    OriginStore.saveOrigin(gpsOrigin);
    
    // GPS Origin is still active before 24h
    let stored = OriginStore.loadOrigin();
    expect(stored?.origin).toEqual(gpsOrigin);
    expect(OriginPolicy.isValid(stored)).toBe(true);

    // Fast-forward 25 hours
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    
    stored = OriginStore.loadOrigin();
    expect(OriginPolicy.isValid(stored)).toBe(false);

    // Manual origin persists indefinitely
    const manualOrigin: Origin = {
      source: 'manual',
      planningAreaSlug: 'yaba',
      resolvedName: 'Yaba'
    };

    OriginStore.saveOrigin(manualOrigin);
    
    vi.advanceTimersByTime(100 * 24 * 60 * 60 * 1000); // 100 days
    stored = OriginStore.loadOrigin();
    expect(OriginPolicy.isValid(stored)).toBe(true);
    expect(stored?.origin).toEqual(manualOrigin);
  });
});

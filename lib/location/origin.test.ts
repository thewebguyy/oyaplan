import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocationService } from './LocationService';
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

  describe('LocationService.resolve — GPS coordinate snapping', () => {
    it('resolves Yaba coordinates to display area "Yaba" and planning area "yaba"', () => {
      const yabaCoords = { lat: 6.5095, lng: 3.3711 };
      const resolution = LocationService.resolve(yabaCoords);

      expect(resolution.status).toBe('supported');
      if (resolution.status !== 'supported') return;

      expect(resolution.origin.source).toBe('gps');
      expect(resolution.origin.planningAreaSlug).toBe('yaba');
      expect(resolution.origin.displayArea.name).toBe('Yaba');
      expect(resolution.origin.displayArea.slug).toBe('yaba');
      expect(resolution.origin.gpsCoordinates).toEqual(yabaCoords);
    });

    it('resolves Ikorodu coordinates to display area "Ikorodu" and planning area "ikeja"', () => {
      // Ikorodu is ~17.6km from Ikeja — within Lagos, but outside a planning area
      const ikoroduCoords = { lat: 6.6194, lng: 3.5104 };
      const resolution = LocationService.resolve(ikoroduCoords);

      expect(resolution.status).toBe('supported');
      if (resolution.status !== 'supported') return;

      // Display: honest — user is in Ikorodu
      expect(resolution.origin.displayArea.name).toBe('Ikorodu');
      expect(resolution.origin.displayArea.slug).toBe('ikorodu');

      // Planning: snaps to closest active planning area
      expect(resolution.origin.planningAreaSlug).toBe('ikeja');

      // They must differ — this is the key invariant
      expect(resolution.origin.displayArea.slug).not.toBe(resolution.origin.planningAreaSlug);
    });

    it('returns outside-service-area for coordinates far outside Lagos (e.g. Abuja)', () => {
      // Abuja coordinates: 9.0765, 7.3986 — well beyond 50km from any Lagos neighborhood
      const abujaCoords = { lat: 9.0765, lng: 7.3986 };
      const resolution = LocationService.resolve(abujaCoords);

      expect(resolution.status).toBe('outside-service-area');
    });
  });

  describe('LocationService.resolveManualOrigin', () => {
    it('resolves manual area slug — display area and planning area are the same', () => {
      const origin = LocationService.resolveManualOrigin('ikeja');

      expect(origin.source).toBe('manual');
      expect(origin.planningAreaSlug).toBe('ikeja');
      expect(origin.displayArea.name).toBe('Ikeja');
      expect(origin.displayArea.slug).toBe('ikeja');
      expect(origin.gpsCoordinates).toBeUndefined();
    });
  });

  describe('OriginStore + OriginPolicy — expiry behaviour', () => {
    it('GPS origins expire after 24 hours; manual selections persist indefinitely', () => {
      const gpsOrigin: Origin = {
        source: 'gps',
        gpsCoordinates: { lat: 6.5095, lng: 3.3711 },
        planningAreaSlug: 'yaba',
        displayArea: { slug: 'yaba', name: 'Yaba' },
      };

      OriginStore.saveOrigin(gpsOrigin);
      
      // GPS origin is valid before 24h
      let stored = OriginStore.loadOrigin();
      expect(stored?.origin).toEqual(gpsOrigin);
      expect(OriginPolicy.isValid(stored)).toBe(true);

      // Fast-forward 25 hours — GPS origin has expired
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      stored = OriginStore.loadOrigin();
      expect(OriginPolicy.isValid(stored)).toBe(false);

      // Manual origin persists indefinitely
      const manualOrigin: Origin = {
        source: 'manual',
        planningAreaSlug: 'yaba',
        displayArea: { slug: 'yaba', name: 'Yaba' },
      };

      OriginStore.saveOrigin(manualOrigin);
      vi.advanceTimersByTime(100 * 24 * 60 * 60 * 1000); // 100 days
      stored = OriginStore.loadOrigin();
      expect(OriginPolicy.isValid(stored)).toBe(true);
      expect(stored?.origin).toEqual(manualOrigin);
    });
  });
});

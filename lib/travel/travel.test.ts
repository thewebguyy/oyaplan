import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MatrixTravelEstimator } from './MatrixTravelEstimator';

describe('Travel Domain Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates correct distance, ETA and fares using MatrixTravelEstimator', () => {
    const yabaCoords = { lat: 6.5095, lng: 3.3711 };
    const lekkiCoords = { lat: 6.4474, lng: 3.4723 };

    const estimator = new MatrixTravelEstimator();

    // 1. Mock off-peak hours (e.g., 2:00 PM)
    const offPeakTime = new Date('2026-08-03T14:00:00Z'); // Monday 2:00 PM
    vi.setSystemTime(offPeakTime);

    const offPeakEstimate = estimator.estimateTravel(yabaCoords, lekkiCoords);
    expect(offPeakEstimate.source).toBe('matrix');
    expect(offPeakEstimate.mode).toBe('car');
    expect(offPeakEstimate.distanceKm).toBeGreaterThan(5);
    expect(offPeakEstimate.estimatedMinutes).toBeGreaterThan(10);
    // Yaba to Lekki zone fare is standard mainland/island (or central/island -> Yaba is central, Lekki is island -> roundtrip 9000)
    expect(offPeakEstimate.transportCost).toBe(9000);

    // 2. Mock peak hours (e.g., 8:00 AM)
    const peakTime = new Date('2026-08-03T08:00:00Z'); // Monday 8:00 AM
    vi.setSystemTime(peakTime);

    const peakEstimate = estimator.estimateTravel(yabaCoords, lekkiCoords);
    expect(peakEstimate.estimatedMinutes).toBeGreaterThan(offPeakEstimate.estimatedMinutes);
  });
});

import { describe, it, expect } from 'vitest';
import { 
  getDepartureBucket, 
  calculateZoneFare, 
  TransportPricingProvider, 
  TransportConfidenceProvider, 
  TransportDisplayFormatter 
} from './transport';
import { calculateTransportTime, getAreaCoordinates } from '@/lib/utils/calculateTransportTime';

describe('Transport pricing and confidence engine logic', () => {

  describe('getDepartureBucket()', () => {
    it('identifies weekday peak morning rush hours (7-10 AM)', () => {
      const mondayMorning = new Date('2026-08-24T08:30:00'); // Monday 8:30 AM
      expect(getDepartureBucket(mondayMorning)).toBe('peak');
    });

    it('identifies weekday peak evening rush hours (4-8 PM)', () => {
      const wednesdayEvening = new Date('2026-08-26T17:45:00'); // Wednesday 5:45 PM
      expect(getDepartureBucket(wednesdayEvening)).toBe('peak');
    });

    it('identifies Friday night peak hours (>= 8 PM)', () => {
      const fridayNight = new Date('2026-08-28T21:00:00'); // Friday 9:00 PM
      expect(getDepartureBucket(fridayNight)).toBe('peak');
    });

    it('identifies off-peak weekday afternoon', () => {
      const tuesdayAfternoon = new Date('2026-08-25T14:00:00'); // Tuesday 2:00 PM
      expect(getDepartureBucket(tuesdayAfternoon)).toBe('off-peak');
    });

    it('identifies late-night low supply hours', () => {
      const thursdayLateNight = new Date('2026-08-27T02:00:00'); // Thursday 2:00 AM
      expect(getDepartureBucket(thursdayLateNight)).toBe('late-night');
    });
  });

  describe('calculateZoneFare() fallback pricing buckets and vehicle capacity scaling', () => {
    it('calculates correct fare for Ajah to VI (same zone fallback)', () => {
      // ajah (island fallback) to vi (island) -> 5000 one way -> 10000 round trip
      const fare = calculateZoneFare('ajah', 'vi');
      expect(fare).toBe(10000);
    });

    it('calculates correct fare for Chevron to Ikeja (island fallback to mainland cross-water)', () => {
      // chevron (island fallback) to ikeja (mainland) -> 13000 one way -> 26000 round trip
      const fare = calculateZoneFare('chevron', 'ikeja');
      expect(fare).toBe(26000);
    });

    it('calculates correct fare for Festac to Yaba (other fallback to central)', () => {
      // festac (other fallback) to yaba (central) -> 6000 base + 2500 surcharge = 8500 one way -> 17000 round trip
      const fare = calculateZoneFare('festac', 'yaba');
      expect(fare).toBe(17000);
    });

    it('models solo outings (partySize = 1) with full vehicle fare', () => {
      const fare = calculateZoneFare('yaba', 'vi', 1);
      expect(fare).toBe(16000); // Solo is non-zero (8000 * 2)
    });

    it('scales vehicle requirements for party of 6 (requires 2 vehicles)', () => {
      const singleCarFare = calculateZoneFare('yaba', 'vi', 4);
      const twoCarFare = calculateZoneFare('yaba', 'vi', 6);
      expect(singleCarFare).toBe(16000);
      expect(twoCarFare).toBe(32000); // Exactly 2x vehicle cost
    });
  });

  describe('Missing route data and no fake fallback handling', () => {
    it('returns status unavailable and reason NO_ROUTE_DATA when route cannot be resolved', () => {
      // "anywhere" is a reserved string that means origin is unknown
      const range = TransportPricingProvider.calculateRange('anywhere', 'vi');
      expect(range.status).toBe('unavailable');
      expect(range.reason).toBe('NO_ROUTE_DATA');
      expect(range.midpointCost).toBe(0);
    });

    it('returns status unavailable for completely unknown zones without matrix entry', () => {
      // "moon" is not in the zones and we don't have a matrix
      const range = TransportPricingProvider.calculateRange('moon', 'mars');
      expect(range.status).toBe('unavailable');
      expect(range.reason).toBe('NO_ROUTE_DATA');
      expect(range.midpointCost).toBe(0);
    });

    it('returns unavailable instead of fabricating a 1500 or 5000 fallback', () => {
      const estimate = TransportPricingProvider.calculateEstimate('unknown', 'unknown', 2);
      expect(estimate.status).toBe('unavailable');
      expect(estimate.midpointCost).toBe(0);
    });
  });

  describe('Vehicle capacity scaling invariants', () => {
    it('scales correctly for edge case party sizes', () => {
      const estimateOne = TransportPricingProvider.calculateEstimate('yaba', 'vi', 1);
      const estimateFour = TransportPricingProvider.calculateEstimate('yaba', 'vi', 4);
      const estimateFive = TransportPricingProvider.calculateEstimate('yaba', 'vi', 5);
      const estimateEight = TransportPricingProvider.calculateEstimate('yaba', 'vi', 8);

      expect(estimateOne.vehiclesRequired).toBe(1);
      expect(estimateFour.vehiclesRequired).toBe(1);
      expect(estimateFive.vehiclesRequired).toBe(2);
      expect(estimateEight.vehiclesRequired).toBe(2);
    });
  });

  describe('TransportPricingProvider.calculateRange() and calculateEstimate()', () => {
    it('produces valid fare ranges for standard Uber modes', () => {
      const range = TransportPricingProvider.calculateRange('yaba', 'vi', 'ride-hailing', undefined, undefined, 2);
      // yaba (central) to vi (island) -> 8000 one way -> 16000 round trip
      expect(range.midpointCost).toBe(16000);
      expect(range.minCost).toBeLessThan(range.midpointCost);
      expect(range.maxCost).toBeGreaterThan(range.midpointCost);
      expect(range.costPerPerson).toBe(8000);
    });

    it('produces canonical TransportEstimate with explicit domain properties', () => {
      const estimate = TransportPricingProvider.calculateEstimate('yaba', 'vi', 6, 'ride-hailing');
      expect(estimate.partySize).toBe(6);
      expect(estimate.vehiclesRequired).toBe(2);
      expect(estimate.vehicleCapacity).toBe(4);
      expect(estimate.isCrossWater).toBe(false);
      expect(estimate.midpointCost).toBe(32000);
      expect(estimate.costPerPerson).toBe(5300); // Math.round(32000 / 6 / 100) * 100
      expect(estimate.calculationVersion).toBe('2026-v3');
    });
  });

  describe('TransportConfidenceProvider.evaluate()', () => {
    it('reduces score slightly for peak times', () => {
      const peakTime = new Date('2026-08-24T08:30:00'); // Peak
      const offPeakTime = new Date('2026-08-24T14:30:00'); // Off-peak

      const peakEval = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing', false, peakTime);
      const offPeakEval = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing', false, offPeakTime);

      expect(peakEval.score).toBeLessThan(offPeakEval.score);
    });

    it('respects override confidence directly if passed', () => {
      const confidence = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing', true, undefined, 95);
      expect(confidence.score).toBe(95);
      expect(confidence.label).toBe('High confidence');
      expect(confidence.badgeColor).toBe('green');
    });
  });

  describe('TransportDisplayFormatter.formatAssumptions()', () => {
    it('formats correct dynamic assumptions string for peak hours', () => {
      const peakTime = new Date('2026-08-24T08:30:00'); // Peak
      const str = TransportDisplayFormatter.formatAssumptions('yaba', 'ride-hailing', peakTime);
      expect(str).toContain('Peak-time');
      expect(str).toContain('Yaba');
    });
  });

  describe('Comprehensive Lagos neighborhood and corridor coverage', () => {
    it('resolves valid fare ranges for previously unmapped neighborhoods', () => {
      // Oshodi (mainland) to VI (island) cross-water
      const oshodiToVi = TransportPricingProvider.calculateEstimate('oshodi', 'vi', 2);
      expect(oshodiToVi.status).toBe('available');
      expect(oshodiToVi.isCrossWater).toBe(true);
      expect(oshodiToVi.midpointCost).toBe(26000); // 13000 * 2 round trip

      // Bariga (mainland) to Ikeja (mainland) same zone
      const barigaToIkeja = TransportPricingProvider.calculateEstimate('bariga', 'ikeja', 2);
      expect(barigaToIkeja.status).toBe('available');
      expect(barigaToIkeja.isCrossWater).toBe(false);
      expect(barigaToIkeja.midpointCost).toBe(10000); // 5000 * 2 round trip

      // Sangotedo (island) to Lekki Phase 1 (island) same zone
      const sangotedoToLekki = TransportPricingProvider.calculateEstimate('sangotedo', 'lekki-phase-1', 2);
      expect(sangotedoToLekki.status).toBe('available');
      expect(sangotedoToLekki.isCrossWater).toBe(false);
      expect(sangotedoToLekki.midpointCost).toBe(10000);

      // Lagos Island to Yaba (island to central)
      const islandToYaba = TransportPricingProvider.calculateEstimate('lagos-island', 'yaba', 2);
      expect(islandToYaba.status).toBe('available');
      expect(islandToYaba.midpointCost).toBe(16000); // 8000 * 2 round trip
    });

    it('handles casing and whitespace gracefully', () => {
      const estimate = TransportPricingProvider.calculateEstimate('  Oshodi  ', 'VI', 1);
      expect(estimate.status).toBe('available');
      expect(estimate.isCrossWater).toBe(true);
      expect(estimate.midpointCost).toBe(26000);
    });
  });

  describe('calculateTransportTime() route distance and timing precision', () => {
    it('resolves actual coordinates for newly mapped neighborhoods', () => {
      const oshodiCoords = getAreaCoordinates('oshodi');
      expect(oshodiCoords.lat).toBeCloseTo(6.5559, 3);
      expect(oshodiCoords.lng).toBeCloseTo(3.3381, 3);

      const sangotedoCoords = getAreaCoordinates('sangotedo');
      expect(sangotedoCoords.lat).toBeCloseTo(6.4406, 3);
      expect(sangotedoCoords.lng).toBeCloseTo(3.6221, 3);
    });

    it('calculates short distance for close mainland trips without defaulting to Lekki', () => {
      // Venue in Ikeja: lat 6.6018, lng 3.3515
      const ikejaVenueCoords = { lat: 6.6018, lng: 3.3515 };
      // Departure from Maryland (adjacent to Ikeja)
      const estimate = calculateTransportTime('maryland', ikejaVenueCoords);

      // Distance from Maryland to Ikeja should be ~5-7km, NOT 25km (which was the old Lekki fallback)
      expect(estimate.distanceKm).toBeLessThan(10);
      expect(estimate.distanceKm).toBeGreaterThan(1);
      expect(estimate.estimatedMinutes).toBeLessThan(45);
    });
  });

});

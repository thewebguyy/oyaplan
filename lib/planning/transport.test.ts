import { describe, it, expect } from 'vitest';
import { 
  getDepartureBucket, 
  calculateZoneFare, 
  TransportPricingProvider, 
  TransportConfidenceProvider, 
  TransportDisplayFormatter 
} from './transport';

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
      // ajah (island fallback) to vi (island) -> 3500 one way -> 7000 round trip
      const fare = calculateZoneFare('ajah', 'vi');
      expect(fare).toBe(7000);
    });

    it('calculates correct fare for Chevron to Ikeja (island fallback to mainland cross-water)', () => {
      // chevron (island fallback) to ikeja (mainland) -> 8500 one way -> 17000 round trip
      const fare = calculateZoneFare('chevron', 'ikeja');
      expect(fare).toBe(17000);
    });

    it('calculates correct fare for Festac to Yaba (other fallback to central)', () => {
      // festac (other fallback) to yaba (central) -> 4000 base + 1500 surcharge = 5500 one way -> 11000 round trip
      const fare = calculateZoneFare('festac', 'yaba');
      expect(fare).toBe(11000);
    });

    it('models solo outings (partySize = 1) with full vehicle fare', () => {
      const fare = calculateZoneFare('yaba', 'vi', 1);
      expect(fare).toBe(11000); // Solo is non-zero
    });

    it('scales vehicle requirements for party of 6 (requires 2 vehicles)', () => {
      const singleCarFare = calculateZoneFare('yaba', 'vi', 4);
      const twoCarFare = calculateZoneFare('yaba', 'vi', 6);
      expect(singleCarFare).toBe(11000);
      expect(twoCarFare).toBe(22000); // Exactly 2x vehicle cost
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
      // yaba (central) to vi (island) -> 5500 one way -> 11000 round trip
      expect(range.midpointCost).toBe(11000);
      expect(range.minCost).toBeLessThan(range.midpointCost);
      expect(range.maxCost).toBeGreaterThan(range.midpointCost);
    });

    it('produces canonical TransportEstimate with explicit domain properties', () => {
      const estimate = TransportPricingProvider.calculateEstimate('yaba', 'vi', 6, 'ride-hailing');
      expect(estimate.partySize).toBe(6);
      expect(estimate.vehiclesRequired).toBe(2);
      expect(estimate.vehicleCapacity).toBe(4);
      expect(estimate.isCrossWater).toBe(false);
      expect(estimate.midpointCost).toBe(22000);
      expect(estimate.calculationVersion).toBe('2026-v2');
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
      const confidence = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing', true, undefined, 90);
      expect(confidence.score).toBe(90);
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

});

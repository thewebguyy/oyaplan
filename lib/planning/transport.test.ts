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

  describe('calculateZoneFare() fallback pricing buckets', () => {
    it('calculates correct fare for Ajah to VI (same zone fallback)', () => {
      // ajah (island fallback) to vi (island)
      const fare = calculateZoneFare('ajah', 'vi');
      expect(fare).toBe(5000); // Same zone different area is 2500 one way -> 5000 round trip
    });

    it('calculates correct fare for Chevron to Ikeja (island fallback to mainland)', () => {
      // chevron (island fallback) to ikeja (mainland)
      const fare = calculateZoneFare('chevron', 'ikeja');
      expect(fare).toBe(16000); // Island to mainland is 8000 one way -> 16000 round trip
    });

    it('calculates correct fare for Festac to Yaba (other fallback to central)', () => {
      // festac (other fallback) to yaba (central)
      const fare = calculateZoneFare('festac', 'yaba');
      expect(fare).toBe(8000); // Other to central is 2500 base + 1500 surcharge = 4000 one way -> 8000 round trip
    });
  });

  describe('TransportPricingProvider.calculateRange()', () => {
    it('produces valid fare ranges for standard Uber modes', () => {
      const range = TransportPricingProvider.calculateRange('yaba', 'vi', 'ride-hailing');
      // yaba (central) to vi (island) -> 4500 one way -> 9000 round trip
      expect(range.midpointCost).toBe(9000);
      expect(range.minCost).toBeLessThan(range.midpointCost);
      expect(range.maxCost).toBeGreaterThan(range.midpointCost);
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

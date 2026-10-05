import { describe, it, expect } from 'vitest';
import { 
  getDepartureBucket, 
  calculateZoneFare, 
  TransportPricingProvider, 
  TransportConfidenceProvider, 
  TransportDisplayFormatter,
  MAINLAND_TRANSPORT_ESTIMATE,
  ISLAND_TRANSPORT_ESTIMATE,
  classifyDestinationZone,
  getTemporaryTransportEstimate
} from './transport';
import { calculateTransportTime, getAreaCoordinates } from '@/lib/utils/calculateTransportTime';

describe('Transport pricing and canonical temporary rules', () => {

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

  describe('Destination Zone Classification & Temporary Rules', () => {
    it('correctly classifies Mainland destinations', () => {
      expect(classifyDestinationZone('yaba')).toBe('mainland');
      expect(classifyDestinationZone('surulere')).toBe('mainland');
      expect(classifyDestinationZone('ikeja')).toBe('mainland');
      expect(classifyDestinationZone('maryland')).toBe('mainland');
      expect(classifyDestinationZone('gbagada')).toBe('mainland');
      expect(classifyDestinationZone('magodo')).toBe('mainland');
      expect(classifyDestinationZone('festac')).toBe('mainland');
    });

    it('correctly classifies Island destinations', () => {
      expect(classifyDestinationZone('vi')).toBe('island');
      expect(classifyDestinationZone('victoria-island')).toBe('island');
      expect(classifyDestinationZone('lekki')).toBe('island');
      expect(classifyDestinationZone('lekki-phase-1')).toBe('island');
      expect(classifyDestinationZone('ikoyi')).toBe('island');
      expect(classifyDestinationZone('ajah')).toBe('island');
      expect(classifyDestinationZone('chevron')).toBe('island');
    });

    it('returns ₦5,000 for Mainland destinations and ₦10,000 for Island destinations', () => {
      expect(getTemporaryTransportEstimate('yaba').cost).toBe(MAINLAND_TRANSPORT_ESTIMATE);
      expect(getTemporaryTransportEstimate('ikeja').cost).toBe(MAINLAND_TRANSPORT_ESTIMATE);
      expect(getTemporaryTransportEstimate('vi').cost).toBe(ISLAND_TRANSPORT_ESTIMATE);
      expect(getTemporaryTransportEstimate('lekki-phase-1').cost).toBe(ISLAND_TRANSPORT_ESTIMATE);
    });
  });

  describe('calculateZoneFare() Canonical Temporary Rules', () => {
    it('calculates ₦10,000 for Island destinations regardless of origin', () => {
      expect(calculateZoneFare('yaba', 'vi')).toBe(10000);
      expect(calculateZoneFare('ikeja', 'lekki-phase-1')).toBe(10000);
      expect(calculateZoneFare('ajah', 'vi')).toBe(10000);
    });

    it('calculates ₦5,000 for Mainland destinations regardless of origin', () => {
      expect(calculateZoneFare('vi', 'yaba')).toBe(5000);
      expect(calculateZoneFare('lekki', 'ikeja')).toBe(5000);
      expect(calculateZoneFare('festac', 'yaba')).toBe(5000);
      expect(calculateZoneFare('ikeja', 'gbagada')).toBe(5000);
    });

    it('does not multiply total transport by party size (total outing estimate)', () => {
      const fareFor1 = calculateZoneFare('yaba', 'vi', 1);
      const fareFor4 = calculateZoneFare('yaba', 'vi', 4);
      const fareFor6 = calculateZoneFare('yaba', 'vi', 6);
      expect(fareFor1).toBe(10000);
      expect(fareFor4).toBe(10000);
      expect(fareFor6).toBe(10000);
    });
  });

  describe('Missing route data and no fake fallback handling', () => {
    it('returns status unavailable and reason NO_ROUTE_DATA when route cannot be resolved', () => {
      const range = TransportPricingProvider.calculateRange('anywhere', 'unknown');
      expect(range.status).toBe('unavailable');
      expect(range.reason).toBe('NO_ROUTE_DATA');
      expect(range.midpointCost).toBe(0);
    });
  });

  describe('TransportPricingProvider.calculateRange() and calculateEstimate()', () => {
    it('produces canonical temporary estimate for Island destination', () => {
      const range = TransportPricingProvider.calculateRange('yaba', 'vi', 'ride-hailing', undefined, undefined, 2);
      expect(range.midpointCost).toBe(10000);
      expect(range.minCost).toBe(10000);
      expect(range.maxCost).toBe(10000);
      expect(range.costPerPerson).toBe(5000); // 10000 / 2
    });

    it('produces canonical TransportEstimate with explicit domain properties', () => {
      const estimate = TransportPricingProvider.calculateEstimate('yaba', 'vi', 4, 'ride-hailing');
      expect(estimate.partySize).toBe(4);
      expect(estimate.midpointCost).toBe(10000);
      expect(estimate.costPerPerson).toBe(2500); // 10000 / 4
      expect(estimate.calculationVersion).toBe('temporary-zone-v1');
    });

    it('produces canonical temporary estimate for Mainland destination', () => {
      const estimate = TransportPricingProvider.calculateEstimate('lekki', 'yaba', 4, 'ride-hailing');
      expect(estimate.partySize).toBe(4);
      expect(estimate.midpointCost).toBe(5000);
      expect(estimate.costPerPerson).toBe(1250); // 5000 / 4
    });
  });

  describe('TransportConfidenceProvider.evaluate()', () => {
    it('returns deterministic zone estimate status', () => {
      const evalResult = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing');
      expect(evalResult.badgeColor).toBe('green');
      expect(evalResult.label).toContain('Deterministic');
    });

    it('respects override confidence directly if passed', () => {
      const confidence = TransportConfidenceProvider.evaluate('yaba', 'vi', 'ride-hailing', true, undefined, 95);
      expect(confidence.score).toBe(95);
      expect(confidence.label).toBe('High confidence');
      expect(confidence.badgeColor).toBe('green');
    });
  });

  describe('TransportDisplayFormatter.formatAssumptions()', () => {
    it('formats correct canonical assumptions string with destination zone and disclaimer', () => {
      const str = TransportDisplayFormatter.formatAssumptions('vi');
      expect(str).toContain('Estimated transport');
      expect(str).toContain('Island zone: ₦10,000');
      expect(str).toContain('Transport estimate based on destination zone.');
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
      const ikejaVenueCoords = { lat: 6.6018, lng: 3.3515 };
      const estimate = calculateTransportTime('maryland', ikejaVenueCoords);

      expect(estimate.distanceKm).toBeLessThan(10);
      expect(estimate.distanceKm).toBeGreaterThan(1);
      expect(estimate.estimatedMinutes).toBeLessThan(45);
    });
  });

});

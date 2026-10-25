import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLagosTimeParts, isLagosWeekdayRushHour, LAGOS_TIME_ZONE } from './lagosTime';
import { getDepartureBucket } from '@/lib/planning/transport';
import { MatrixTravelEstimator } from '@/lib/travel/MatrixTravelEstimator';
import { BaseRouteTimeProvider } from '@/lib/travel/routeTimeProvider';
import { calculateTransportTime } from './calculateTransportTime';

/**
 * Lagos peak / off-peak classification must not depend on the host timezone.
 * Every assertion below is repeated under several process timezones, including
 * ones whose calendar day differs from Lagos at the boundaries.
 */

const HOST_TIME_ZONES = [
  'UTC', // Vercel / most servers
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Pacific/Kiritimati', // UTC+14
  'Africa/Lagos',
];

// [label, ISO instant, expected bucket]. All instants carry an explicit offset.
const BUCKET_BOUNDARIES: Array<[string, string, 'peak' | 'off-peak' | 'late-night']> = [
  ['Mon 06:59 WAT (just before AM rush)', '2026-10-05T06:59:00+01:00', 'off-peak'],
  ['Mon 07:00 WAT (AM rush starts)', '2026-10-05T07:00:00+01:00', 'peak'],
  ['Mon 10:59 WAT (AM rush ends)', '2026-10-05T10:59:00+01:00', 'peak'],
  ['Mon 11:00 WAT', '2026-10-05T11:00:00+01:00', 'off-peak'],
  ['Fri 15:59 WAT (just before PM rush)', '2026-10-09T15:59:00+01:00', 'off-peak'],
  ['Fri 16:00 WAT (PM rush starts)', '2026-10-09T16:00:00+01:00', 'peak'],
  ['Fri 16:59 WAT (the failing WAT case)', '2026-10-09T16:59:00+01:00', 'peak'],
  ['Fri 20:59 WAT (PM rush ends)', '2026-10-09T20:59:00+01:00', 'peak'],
  ['Fri 21:00 WAT (Friday night)', '2026-10-09T21:00:00+01:00', 'peak'],
  ['Fri 23:30 WAT (Friday night, not yet late-night)', '2026-10-09T23:30:00+01:00', 'peak'],
  ['Sat 00:30 WAT (late-night; UTC is still Friday)', '2026-10-10T00:30:00+01:00', 'late-night'],
  ['Sat 20:00 WAT (Saturday night)', '2026-10-10T20:00:00+01:00', 'peak'],
  ['Sat 17:00 WAT (weekend afternoon, no rush hour)', '2026-10-10T17:00:00+01:00', 'off-peak'],
  ['Sun 08:00 WAT (weekend morning)', '2026-10-11T08:00:00+01:00', 'off-peak'],
  ['Mon 00:30 WAT (late-night; UTC is still Sunday)', '2026-10-12T00:30:00+01:00', 'late-night'],
  ['Mon 04:59 WAT', '2026-10-12T04:59:00+01:00', 'late-night'],
  ['Mon 05:00 WAT', '2026-10-12T05:00:00+01:00', 'off-peak'],
  ['Thu 22:59 WAT', '2026-10-08T22:59:00+01:00', 'off-peak'],
  ['Thu 23:00 WAT', '2026-10-08T23:00:00+01:00', 'late-night'],
];

const YABA = { lat: 6.5095, lng: 3.3711 };
const LEKKI = { lat: 6.4474, lng: 3.4723 };

let originalTz: string | undefined;

function setHostTimeZone(tz: string) {
  process.env.TZ = tz;
}

describe('getLagosTimeParts', () => {
  it('uses the Africa/Lagos zone', () => {
    expect(LAGOS_TIME_ZONE).toBe('Africa/Lagos');
  });

  it('returns Lagos hour/weekday for an instant whose UTC day differs', () => {
    // 2026-10-09T23:30Z is Fri in UTC but Sat 00:30 in Lagos.
    expect(getLagosTimeParts(new Date('2026-10-09T23:30:00Z'))).toEqual({ hour: 0, day: 6, isWeekend: true });
  });

  it('renders midnight as hour 0, never 24', () => {
    expect(getLagosTimeParts(new Date('2026-10-09T23:00:00Z')).hour).toBe(0); // 00:00 WAT
  });

  it('treats an invalid Date as "now" instead of throwing', () => {
    expect(() => getLagosTimeParts(new Date('not-a-date'))).not.toThrow();
    expect(() => getDepartureBucket(new Date('not-a-date'))).not.toThrow();
  });
});

describe.each(HOST_TIME_ZONES)('Lagos peak classification with host TZ=%s', (hostTz) => {
  beforeEach(() => {
    originalTz = process.env.TZ;
    setHostTimeZone(hostTz);
  });

  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
    vi.useRealTimers();
  });

  it('actually switched the process timezone (guards against a vacuous test)', () => {
    const expectedOffsetMinutes: Record<string, number> = {
      UTC: 0,
      'America/Los_Angeles': 420, // PDT in October
      'Asia/Tokyo': -540,
      'Pacific/Kiritimati': -840,
      'Africa/Lagos': -60,
    };
    expect(new Date('2026-10-09T12:00:00Z').getTimezoneOffset()).toBe(expectedOffsetMinutes[hostTz]);
  });

  it.each(BUCKET_BOUNDARIES)('getDepartureBucket: %s', (_label, iso, expected) => {
    expect(getDepartureBucket(new Date(iso))).toBe(expected);
  });

  it('isLagosWeekdayRushHour agrees with the bucket for peak weekday rush only', () => {
    expect(isLagosWeekdayRushHour(new Date('2026-10-09T16:59:00+01:00'))).toBe(true);
    expect(isLagosWeekdayRushHour(new Date('2026-10-09T15:59:00+01:00'))).toBe(false);
    expect(isLagosWeekdayRushHour(new Date('2026-10-10T17:00:00+01:00'))).toBe(false); // Saturday
  });

  it('MatrixTravelEstimator: weekday rush is slower than off-peak at the exact boundaries', () => {
    const estimator = new MatrixTravelEstimator();
    const justBefore = estimator.estimateTravel(YABA, LEKKI, new Date('2026-10-09T15:59:00+01:00'));
    const rushStart = estimator.estimateTravel(YABA, LEKKI, new Date('2026-10-09T16:00:00+01:00'));
    const rushEnd = estimator.estimateTravel(YABA, LEKKI, new Date('2026-10-09T20:59:00+01:00'));

    expect(rushStart.estimatedMinutes).toBeGreaterThan(justBefore.estimatedMinutes);
    expect(rushEnd.estimatedMinutes).toBe(rushStart.estimatedMinutes);
  });

  it('MatrixTravelEstimator: weekend afternoon is never treated as rush hour', () => {
    const estimator = new MatrixTravelEstimator();
    const sat = estimator.estimateTravel(YABA, LEKKI, new Date('2026-10-10T17:00:00+01:00'));
    const fri = estimator.estimateTravel(YABA, LEKKI, new Date('2026-10-09T15:59:00+01:00'));
    expect(sat.estimatedMinutes).toBe(fri.estimatedMinutes);
  });

  it('MatrixTravelEstimator: defaults to "now" evaluated in Lagos time', () => {
    vi.useFakeTimers();
    const estimator = new MatrixTravelEstimator();

    vi.setSystemTime(new Date('2026-10-09T16:00:00+01:00')); // rush
    const rush = estimator.estimateTravel(YABA, LEKKI);
    vi.setSystemTime(new Date('2026-10-09T15:59:00+01:00')); // not rush
    const calm = estimator.estimateTravel(YABA, LEKKI);

    expect(rush.estimatedMinutes).toBeGreaterThan(calm.estimatedMinutes);
  });

  it('BaseRouteTimeProvider: uses Lagos time for "now"', async () => {
    vi.useFakeTimers();
    const provider = new BaseRouteTimeProvider();

    vi.setSystemTime(new Date('2026-10-09T16:59:00+01:00')); // rush in Lagos
    const rush = await provider.estimate(YABA, LEKKI);
    vi.setSystemTime(new Date('2026-10-09T15:59:00+01:00')); // not rush in Lagos
    const calm = await provider.estimate(YABA, LEKKI);

    expect(rush.durationMinutes).toBeGreaterThan(calm.durationMinutes);
  });

  it('calculateTransportTime: departureAt is judged in Lagos time', () => {
    const rush = calculateTransportTime('yaba', LEKKI, '2026-10-09T16:00:00+01:00');
    const calm = calculateTransportTime('yaba', LEKKI, '2026-10-09T15:59:00+01:00');
    expect(rush.estimatedMinutes).toBeGreaterThan(calm.estimatedMinutes);
  });
});

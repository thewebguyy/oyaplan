import { describe, it, expect } from 'vitest';
import { evaluateVenueClosure, isVenueCurrentlyClosed } from './closureUtils';

describe('Time-Aware Venue Closure Logic', () => {
  it('returns open if venue is not temporarily closed', () => {
    const venue = { is_temporarily_closed: false };
    expect(isVenueCurrentlyClosed(venue)).toBe(false);
  });

  it('returns closed if venue is temporarily closed with no dates specified', () => {
    const venue = {
      is_temporarily_closed: true,
      temporary_closure_reason: 'Renovation'
    };
    expect(isVenueCurrentlyClosed(venue)).toBe(true);
    const result = evaluateVenueClosure(venue);
    expect(result.isClosed).toBe(true);
    expect(result.reason).toBe('Renovation');
  });

  it('recognizes expired closure as reopened', () => {
    const venue = {
      is_temporarily_closed: true,
      temporary_closure_start: '2026-09-01',
      temporary_closure_end: '2026-09-10', // In the past relative to 2026-09-24
      temporary_closure_reason: 'Flooding'
    };
    const targetDate = new Date('2026-09-24T12:00:00Z');
    expect(isVenueCurrentlyClosed(venue, targetDate)).toBe(false);
  });

  it('recognizes upcoming future closure as currently open', () => {
    const venue = {
      is_temporarily_closed: true,
      temporary_closure_start: '2026-10-01', // In the future relative to 2026-09-24
      temporary_closure_end: '2026-10-15',
      temporary_closure_reason: 'Scheduled maintenance'
    };
    const targetDate = new Date('2026-09-24T12:00:00Z');
    expect(isVenueCurrentlyClosed(venue, targetDate)).toBe(false);
  });

  it('recognizes currently active closure', () => {
    const venue = {
      is_temporarily_closed: true,
      temporary_closure_start: '2026-09-20',
      temporary_closure_end: '2026-09-30',
      temporary_closure_reason: 'Power overhaul'
    };
    const targetDate = new Date('2026-09-24T12:00:00Z');
    expect(isVenueCurrentlyClosed(venue, targetDate)).toBe(true);
  });
});

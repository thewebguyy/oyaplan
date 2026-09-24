import { describe, it, expect } from 'vitest';
import {
  validateTablePolicy,
  validateTablePolicies,
  getApplicableTablePolicy,
  isTimeInWindow
} from './tablePolicyValidation';
import { TablePolicy } from '../types';

describe('TablePolicy Validation Contract', () => {
  const validPolicy: TablePolicy = {
    version: 1,
    id: 'tp-123',
    name: 'VIP Booth',
    seating_type: 'vip_booth',
    minimum_spend: 150000,
    mandatory_bottle_policy: true,
    bottle_count_minimum: 2,
    applicable_days: ['friday', 'saturday'],
    applicable_start_time: '21:00',
    applicable_end_time: '03:00',
    min_squad_size: 4,
    max_squad_size: 8,
    notes: 'Includes dedicated host',
    verification_status: 'owner_submitted',
    last_verified_at: '2026-09-24T00:00:00Z',
    source: 'owner_portal'
  };

  it('validates a correct TablePolicy', () => {
    const validated = validateTablePolicy(validPolicy);
    expect(validated.id).toBe('tp-123');
    expect(validated.minimum_spend).toBe(150000);
  });

  it('strictly rejects unknown fields to prevent silent corruption', () => {
    const corrupted = {
      ...validPolicy,
      extra_unknown_field: 'malicious or unrecognized payload'
    };
    expect(() => validateTablePolicy(corrupted)).toThrow(/unauthorized field: "extra_unknown_field"/);
  });

  it('rejects version mismatch', () => {
    const invalid = { ...validPolicy, version: 2 };
    expect(() => validateTablePolicy(invalid)).toThrow(/version must be 1/);
  });

  it('rejects negative minimum spend', () => {
    const invalid = { ...validPolicy, minimum_spend: -5000 };
    expect(() => validateTablePolicy(invalid)).toThrow(/non-negative number/);
  });

  it('rejects min_squad_size greater than max_squad_size', () => {
    const invalid = { ...validPolicy, min_squad_size: 10, max_squad_size: 4 };
    expect(() => validateTablePolicy(invalid)).toThrow(/cannot be less than "min_squad_size"/);
  });
});

describe('Overnight Window Evaluation', () => {
  it('handles standard same-day windows', () => {
    expect(isTimeInWindow('14:00', '12:00', '18:00')).toBe(true);
    expect(isTimeInWindow('11:00', '12:00', '18:00')).toBe(false);
    expect(isTimeInWindow('19:00', '12:00', '18:00')).toBe(false);
  });

  it('correctly handles overnight windows crossing midnight (20:00 -> 03:00)', () => {
    // 22:30 is between 20:00 and midnight
    expect(isTimeInWindow('22:30', '20:00', '03:00')).toBe(true);
    // 01:30 is between midnight and 03:00
    expect(isTimeInWindow('01:30', '20:00', '03:00')).toBe(true);
    // 19:30 is before start
    expect(isTimeInWindow('19:30', '20:00', '03:00')).toBe(false);
    // 04:00 is after end
    expect(isTimeInWindow('04:00', '20:00', '03:00')).toBe(false);
    // 12:00 is noon, outside window
    expect(isTimeInWindow('12:00', '20:00', '03:00')).toBe(false);
  });
});

describe('Deterministic Policy Selection', () => {
  const fridayOvernightVIP: TablePolicy = {
    version: 1,
    id: 'vip-fri',
    name: 'Friday VIP Booth',
    seating_type: 'vip_booth',
    minimum_spend: 200000,
    mandatory_bottle_policy: true,
    bottle_count_minimum: 2,
    applicable_days: ['friday'],
    applicable_start_time: '21:00',
    applicable_end_time: '04:00',
    min_squad_size: 4,
    max_squad_size: 10,
    notes: null,
    verification_status: 'verified',
    last_verified_at: '2026-09-24T00:00:00Z',
    source: 'owner_portal'
  };

  const generalAllWeekVIP: TablePolicy = {
    version: 1,
    id: 'vip-general',
    name: 'General VIP Table',
    seating_type: 'vip_booth',
    minimum_spend: 100000,
    mandatory_bottle_policy: false,
    bottle_count_minimum: null,
    applicable_days: ['all'],
    applicable_start_time: null,
    applicable_end_time: null,
    min_squad_size: null,
    max_squad_size: null,
    notes: null,
    verification_status: 'verified',
    last_verified_at: '2026-09-24T00:00:00Z',
    source: 'owner_portal'
  };

  it('selects more specific day policy over "all" policy', () => {
    // 2026-09-25 is a Friday
    const result = getApplicableTablePolicy([generalAllWeekVIP, fridayOvernightVIP], {
      date: '2026-09-25',
      time: '23:00',
      squadSize: 6,
      seatingType: 'vip_booth'
    });

    expect(result.status).toBe('applicable');
    if (result.status === 'applicable') {
      expect(result.policy.id).toBe('vip-fri');
    }
  });

  it('falls back to "all" policy on non-Friday days', () => {
    // 2026-09-23 is a Wednesday
    const result = getApplicableTablePolicy([generalAllWeekVIP, fridayOvernightVIP], {
      date: '2026-09-23',
      time: '23:00',
      squadSize: 6,
      seatingType: 'vip_booth'
    });

    expect(result.status).toBe('applicable');
    if (result.status === 'applicable') {
      expect(result.policy.id).toBe('vip-general');
    }
  });

  it('returns ambiguous when two conflicting policies have identical specificity', () => {
    const conflictingPolicy: TablePolicy = {
      ...fridayOvernightVIP,
      id: 'vip-fri-conflict',
      minimum_spend: 350000 // different spend, same specificity
    };

    const result = getApplicableTablePolicy([fridayOvernightVIP, conflictingPolicy], {
      date: '2026-09-25',
      time: '23:00',
      squadSize: 6,
      seatingType: 'vip_booth'
    });

    expect(result.status).toBe('ambiguous');
    if (result.status === 'ambiguous') {
      expect(result.candidates.length).toBe(2);
    }
  });

  it('returns not_applicable when squad size is out of bounds', () => {
    const result = getApplicableTablePolicy([fridayOvernightVIP], {
      date: '2026-09-25',
      time: '23:00',
      squadSize: 15, // Max is 10
      seatingType: 'vip_booth'
    });

    expect(result.status).toBe('not_applicable');
  });
});

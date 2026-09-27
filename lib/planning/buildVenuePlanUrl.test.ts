import { describe, it, expect } from 'vitest';
import { buildVenuePlanUrl, normalizeVibeToCanonicalSlug } from './buildVenuePlanUrl';

describe('buildVenuePlanUrl and vibe normalization', () => {
  describe('normalizeVibeToCanonicalSlug()', () => {
    it('normalizes display-formatted vibes', () => {
      expect(normalizeVibeToCanonicalSlug('Dinner')).toBe('date-night');
      expect(normalizeVibeToCanonicalSlug('Date Night')).toBe('date-night');
      expect(normalizeVibeToCanonicalSlug('Foodie')).toBe('foodie');
      expect(normalizeVibeToCanonicalSlug('Chill')).toBe('chill');
      expect(normalizeVibeToCanonicalSlug('Party')).toBe('party');
      expect(normalizeVibeToCanonicalSlug('Quick')).toBe('quick-link');
      expect(normalizeVibeToCanonicalSlug('Brunch')).toBe('brunch');
    });

    it('handles casing and whitespace gracefully', () => {
      expect(normalizeVibeToCanonicalSlug('  DINNER  ')).toBe('date-night');
      expect(normalizeVibeToCanonicalSlug('date_night')).toBe('date-night');
      expect(normalizeVibeToCanonicalSlug('SERIOUS CHOP')).toBe('foodie');
      expect(normalizeVibeToCanonicalSlug('birthday turn up')).toBe('party');
    });

    it('falls back to chill for unknown or missing vibes', () => {
      expect(normalizeVibeToCanonicalSlug('')).toBe('chill');
      expect(normalizeVibeToCanonicalSlug(null)).toBe('chill');
      expect(normalizeVibeToCanonicalSlug(undefined)).toBe('chill');
      expect(normalizeVibeToCanonicalSlug('nonexistent_vibe_123')).toBe('chill');
    });
  });

  describe('buildVenuePlanUrl()', () => {
    it('constructs a valid URL with minimal required parameters', () => {
      const url = buildVenuePlanUrl({
        venueId: '11111111-1111-1111-1111-111111111111',
      });

      expect(url).toContain('/forge?');
      expect(url).toContain('pinned=11111111-1111-1111-1111-111111111111');
      expect(url).toContain('squad=2');
      expect(url).toContain('budget=50000');
      expect(url).toContain('vibe=chill');
      expect(url).toContain('fresh=true');
    });

    it('preserves full planning context from venue click-through', () => {
      const url = buildVenuePlanUrl({
        venueId: 'venue-123',
        area: 'VI',
        squad: 4,
        budget: 80000,
        vibe: 'Dinner',
        mode: 'ride-hailing',
      });

      expect(url).toContain('pinned=venue-123');
      expect(url).toContain('area=vi');
      expect(url).toContain('squad=4');
      expect(url).toContain('budget=80000');
      expect(url).toContain('vibe=date-night');
      expect(url).toContain('mode=ride-hailing');
    });

    it('recovers safe defaults on invalid budget or squad', () => {
      const url = buildVenuePlanUrl({
        venueId: 'venue-123',
        squad: 0,
        budget: 200,
        vibe: 'outing',
      });

      expect(url).toContain('squad=2');
      expect(url).toContain('budget=50000');
      expect(url).toContain('vibe=chill');
    });

    it('preserves departure time when available', () => {
      const date = new Date('2026-08-25T18:00:00.000Z');
      const url = buildVenuePlanUrl({
        venueId: 'venue-123',
        departureAt: date,
      });

      expect(url).toContain(`departureAt=${encodeURIComponent('2026-08-25T18:00:00.000Z')}`);
    });
  });
});

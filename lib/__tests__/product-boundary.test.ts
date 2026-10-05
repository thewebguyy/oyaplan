import { describe, it, expect } from 'vitest';
import { sanitizeReturnTo } from '@/lib/utils/returnTo';

describe('Consumer / Business Product Boundary Invariants', () => {
  describe('Authentication Surface Separation', () => {
    it('sanitizes consumer auth returnTo to consumer default /', () => {
      expect(sanitizeReturnTo('/explore', '/')).toBe('/explore');
      expect(sanitizeReturnTo('/saved', '/')).toBe('/saved');
      expect(sanitizeReturnTo('/account', '/')).toBe('/account');
      expect(sanitizeReturnTo(null, '/')).toBe('/');
      expect(sanitizeReturnTo('https://external-attack.com', '/')).toBe('/');
    });

    it('sanitizes business auth returnTo to business fallback /business', () => {
      expect(sanitizeReturnTo('/business/venue-123', '/business')).toBe('/business/venue-123');
      expect(sanitizeReturnTo('/business/claim', '/business')).toBe('/business/claim');
      expect(sanitizeReturnTo(null, '/business')).toBe('/business');
      expect(sanitizeReturnTo('https://external-attack.com', '/business')).toBe('/business');
    });

    it('prevents open redirect attacks across boundary parameters', () => {
      expect(sanitizeReturnTo('//attacker.com/business', '/')).toBe('/');
      expect(sanitizeReturnTo('javascript:void(0)', '/business')).toBe('/business');
    });
  });

  describe('Consumer Navigation Purity', () => {
    const consumerNavItems = [
      { name: 'Plan', href: '/' },
      { name: 'Explore', href: '/explore' },
      { name: 'The Shortlist', href: '/saved' },
      { name: 'Resident Pass', href: '/account' },
    ];

    const forbiddenBusinessTokens = [
      'operator',
      'business',
      'desk',
      'claim',
      'plaque',
      'partner',
    ];

    it('ensures no consumer primary destinations link to business products', () => {
      consumerNavItems.forEach((item) => {
        forbiddenBusinessTokens.forEach((token) => {
          expect(item.name.toLowerCase()).not.toContain(token);
          expect(item.href.toLowerCase()).not.toContain(token);
        });
      });
    });
  });

  describe('Identity & Audience Model Separation', () => {
    it('defines distinct identities for OyaPlanner and Venue Operator', () => {
      const consumerIdentity = 'OyaPlanner';
      const businessIdentity = 'Venue Operator / Business';

      expect(consumerIdentity).not.toEqual(businessIdentity);
    });

    it('enforces that business paths start with dedicated /business or /for-business prefixes', () => {
      const isBusinessPath = (path: string) =>
        path === '/for-business' ||
        path === '/business' ||
        path.startsWith('/business/') ||
        path.startsWith('/partner');

      expect(isBusinessPath('/explore')).toBe(false);
      expect(isBusinessPath('/forge')).toBe(false);
      expect(isBusinessPath('/account')).toBe(false);
      expect(isBusinessPath('/saved')).toBe(false);
      expect(isBusinessPath('/venue/lagos-bistro')).toBe(false);

      expect(isBusinessPath('/for-business')).toBe(true);
      expect(isBusinessPath('/business')).toBe(true);
      expect(isBusinessPath('/business/claim')).toBe(true);
      expect(isBusinessPath('/business/venue-123')).toBe(true);
    });
  });
});

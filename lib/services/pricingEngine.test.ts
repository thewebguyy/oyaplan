/**
 * pricingEngine.test.ts
 *
 * Ported from scripts/verify-phase2.ts into the Vitest pipeline.
 * These tests protect the business logic that produces derived_typical_cost —
 * the number users see as their activity budget in every plan card.
 *
 * Any change to calculateTypicalOutingCost MUST update these tests.
 */

import { describe, it, expect } from 'vitest';
import { calculateTypicalOutingCost } from './pricingEngine';
import type { MenuItem } from '../types';

const BASE_MENU_ITEMS: MenuItem[] = [
  { id: '1', venue_id: 'v1', category: 'main',      price: 8000,  name: 'Burger',    is_available: true },
  { id: '2', venue_id: 'v1', category: 'main',      price: 12000, name: 'Steak',     is_available: true },
  { id: '3', venue_id: 'v1', category: 'main',      price: 10000, name: 'Pasta',     is_available: true }, // median main = 10000
  { id: '4', venue_id: 'v1', category: 'soft_drink', price: 1500,  name: 'Soda',      is_available: true },
  { id: '5', venue_id: 'v1', category: 'cocktail',  price: 4500,  name: 'Mojito',    is_available: true },
  { id: '6', venue_id: 'v1', category: 'beer',      price: 2500,  name: 'Lager',     is_available: true }, // median alc drink = 3500 (median of 4500,2500)
  { id: '7', venue_id: 'v1', category: 'starter',   price: 4000,  name: 'Wings',     is_available: true },
];

const NO_TAX = { vat_pct: 0, service_charge_pct: 0, minimum_spend: 0 };
const WITH_TAX = { vat_pct: 7.5, service_charge_pct: 10.0, minimum_spend: 0 };

describe('calculateTypicalOutingCost', () => {
  describe('restaurant', () => {
    it('should compute median main + median drink, apply taxes, round to 100', () => {
      // Median main = 10000, median drink = 2500 (median of 1500, 2500, 4500)
      // Subtotal = 12500. Tax = 7.5% + 10% = 17.5%.
      // 12500 * 1.175 = 14687.5 → rounded to nearest 100 = 14700
      const cost = calculateTypicalOutingCost(BASE_MENU_ITEMS, 'restaurant', WITH_TAX);
      expect(cost).toBe(14700);
    });

    it('should clamp to minimum_spend when minimum is higher than computed', () => {
      const cost = calculateTypicalOutingCost(BASE_MENU_ITEMS, 'restaurant', {
        ...WITH_TAX,
        minimum_spend: 20000,
      });
      expect(cost).toBe(20000);
    });

    it('should apply no tax when both pcts are zero', () => {
      // Median main = 10000, median drink = 2500 (median of 1500,2500,4500)
      // Subtotal = 12500, no tax, rounds to nearest 100 = 12500
      const cost = calculateTypicalOutingCost(BASE_MENU_ITEMS, 'restaurant', NO_TAX);
      expect(cost).toBe(12500);
    });
  });

  describe('bar', () => {
    it('should compute 2x median alcohol drink + median starter, apply VAT', () => {
      // Median alcohol drink = 3500 (median of 2500, 4500)
      // Median starter = 4000
      // Subtotal = 2 * 3500 + 4000 = 11000. Tax = 7.5%.
      // 11000 * 1.075 = 11825 → rounded to 11800
      const cost = calculateTypicalOutingCost(BASE_MENU_ITEMS, 'bar', {
        vat_pct: 7.5,
        service_charge_pct: 0,
        minimum_spend: 0,
      });
      expect(cost).toBe(11800);
    });
  });

  describe('activity', () => {
    const activityMenu: MenuItem[] = [
      { id: '10', venue_id: 'v1', category: 'activity_fee', price: 15000, name: 'Entry', is_available: true },
      { id: '11', venue_id: 'v1', category: 'soft_drink',   price: 1000,  name: 'Water', is_available: true },
    ];

    it('should compute entry fee + soft drink with no tax', () => {
      // Entry = 15000, soft drink = 1000. Subtotal = 16000.
      const cost = calculateTypicalOutingCost(activityMenu, 'activity', NO_TAX);
      expect(cost).toBe(16000);
    });
  });

  describe('edge cases', () => {
    it('should return minimum_spend when menu is empty', () => {
      const cost = calculateTypicalOutingCost([], 'restaurant', { ...NO_TAX, minimum_spend: 5000 });
      expect(cost).toBe(5000);
    });

    it('should return 5000 floor when menu is empty and no minimum spend', () => {
      const cost = calculateTypicalOutingCost([], 'restaurant', NO_TAX);
      expect(cost).toBe(5000);
    });

    it('should only consider items pre-filtered by caller (is_available filtering is caller responsibility)', () => {
      // pricingEngine receives items from normalizationLayer which pre-filters by is_available.
      // Test: if caller passes only the available item, result is correct.
      const availableOnly: MenuItem[] = [
        { id: '1', venue_id: 'v1', category: 'main', price: 10000, name: 'Dish A', is_available: true },
      ];
      // Median main = 10000, no drink present → default ₦3500
      // Subtotal = 10000 + 3500 = 13500, no tax → 13500
      const cost = calculateTypicalOutingCost(availableOnly, 'restaurant', NO_TAX);
      expect(cost).toBe(13500);
    });
  });
});

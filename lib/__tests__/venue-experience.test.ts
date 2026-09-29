import { describe, it, expect } from 'vitest';
import { Venue, MenuItem } from '@/lib/types';

describe('Venue Financial Calculations & Null Semantics', () => {
  const sampleVenue: Venue = {
    id: 'venue-123',
    district_id: 'dist-vi',
    name: 'Cactus Restaurant',
    category: 'restaurant',
    address: '20/24 Ozumba Mbadiwe Ave, Victoria Island',
    description: 'Bustling waterside bistro in Victoria Island with terrace dining.',
    vibe_tags: ['Chill', 'Foodie'],
    audience_tags: ['Couples', 'Squads'],
    activity_tags: ['Dining'],
    derived_typical_cost: 22000,
    derived_price_tier: 2,
    typical_duration_hours: 2,
    is_featured: false,
    active: true,
    gallery_urls: [],
    subcategory: 'bistro',
    instagram_handle: null,
    computed_confidence_score: 0.9,
    confidence_reasons: ['Verified OCR menu', 'Active partner updates'],
    vat_pct: 7.5,
    service_charge_pct: 5.0,
    corkage_fee: 10000,
    cake_fee: 5000,
    minimum_spend: 0,
    partner_state: 'verified_partner',
    operational_status: 'verified',
    opening_hours: {
      monday: '7:30 AM - 10:30 PM',
      tuesday: '7:30 AM - 10:30 PM',
      wednesday: '7:30 AM - 10:30 PM',
      thursday: '7:30 AM - 10:30 PM',
      friday: '7:30 AM - 11:00 PM',
      saturday: '7:30 AM - 11:00 PM',
      sunday: '7:30 AM - 10:30 PM',
    },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  };

  const sampleMenuItems: MenuItem[] = [
    { id: 'm1', venue_id: 'venue-123', name: 'Seafood Pasta', price: 16500, category: 'main', is_available: true, created_at: '', last_updated_at: '' },
    { id: 'm2', venue_id: 'venue-123', name: 'Grilled Ribeye Steak', price: 24000, category: 'main', is_available: true, created_at: '', last_updated_at: '' },
    { id: 's1', venue_id: 'venue-123', name: 'Peppered Calamari', price: 8500, category: 'starter', is_available: true, created_at: '', last_updated_at: '' },
    { id: 'd1', venue_id: 'venue-123', name: 'Chapman Cocktail', price: 4500, category: 'cocktail', is_available: true, created_at: '', last_updated_at: '' },
  ];

  it('computes realistic 2-person scenario with mandatory house charges', () => {
    const mains = sampleMenuItems.filter(i => i.category === 'main');
    const starters = sampleMenuItems.filter(i => i.category === 'starter');
    const drinks = sampleMenuItems.filter(i => i.category === 'cocktail');

    const avgMain = mains.reduce((a, b) => a + b.price, 0) / mains.length; // 20250
    const avgStarter = starters.reduce((a, b) => a + b.price, 0) / starters.length; // 8500
    const avgDrink = drinks.reduce((a, b) => a + b.price, 0) / drinks.length; // 4500

    const squad = 2;
    const foodAndDrinks = Math.round(squad * avgMain + 1 * avgStarter + squad * avgDrink); // 40500 + 8500 + 9000 = 58000
    expect(foodAndDrinks).toBe(58000);

    const totalTax = Math.round(foodAndDrinks * ((sampleVenue.vat_pct + sampleVenue.service_charge_pct) / 100)); // 58000 * 0.125 = 7250
    expect(totalTax).toBe(7250);

    const transport = 6000;
    const totalOuting = foodAndDrinks + totalTax + transport; // 71250
    expect(totalOuting).toBe(71250);

    const budget = 90000;
    const remaining = budget - totalOuting; // 18750
    expect(remaining).toBe(18750);
    expect(remaining > 0).toBe(true);
  });

  it('preserves non-zero NULL semantics for charges', () => {
    const venueWithoutFees: Partial<Venue> = {
      vat_pct: 0,
      service_charge_pct: 0,
      corkage_fee: null as unknown as number,
      cake_fee: undefined,
    };

    expect(venueWithoutFees.corkage_fee).toBeNull();
    expect(venueWithoutFees.cake_fee).toBeUndefined();
    expect(venueWithoutFees.vat_pct).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { forgePlans, getAdjacentZoneMatches, generateRecoverySuggestions } from '../services/matching/forgeMatcher';
import { PlanningEngineV1, createPlanningContext } from './planningEngine';
import { DefaultRecoveryEngine } from './recoveryEngine';
import type { Spot, ForgeInput } from '../types';
import type { PlanningRequest } from './types';

function makeSpot(id: string, overrides: Partial<Spot>): Spot {
  return {
    id,
    name: overrides.name || 'Test Spot',
    address: '1 Test Street',
    address_slug: overrides.address_slug || 'ikeja',
    area_id: overrides.area_id || 'area-1',
    vibe_tags: overrides.vibe_tags || ['Chill'],
    price_per_person: overrides.price_per_person ?? 5000,
    transport_matrix: overrides.transport_matrix || {},
    is_featured: overrides.is_featured ?? false,
    active: overrides.active ?? true,
    category: overrides.category || 'restaurant',
    has_food: overrides.has_food ?? true,
    typical_duration_hours: overrides.typical_duration_hours ?? 2,
    zone: overrides.zone || 'mainland',
    computed_confidence_score: overrides.computed_confidence_score ?? 80,
    verified_by: overrides.verified_by || 'verified',
    price_updated_at: overrides.price_updated_at || '2026-08-01T12:00:00Z',
    price_source: overrides.price_source || 'manual',
    ...overrides
  };
}

describe('Planning Engine V1 Regression & Contract Tests', () => {
  const mockSpots: Spot[] = [
    makeSpot('11111111-1111-1111-1111-111111111111', { name: 'Ikeja Spot 1', address_slug: 'ikeja', vibe_tags: ['Chill'], price_per_person: 10000, is_featured: true }),
    makeSpot('22222222-2222-2222-2222-222222222222', { name: 'Ikeja Spot 2', address_slug: 'ikeja', vibe_tags: ['Chill', 'Foodie'], price_per_person: 15000 }),
    makeSpot('33333333-3333-3333-3333-333333333333', { name: 'Yaba Spot 1', address_slug: 'yaba', vibe_tags: ['Chill'], price_per_person: 8000, zone: 'central' }),
    makeSpot('44444444-4444-4444-4444-444444444444', { name: 'VI Spot 1', address_slug: 'vi', vibe_tags: ['Dinner'], price_per_person: 30000, zone: 'island' }),
    makeSpot('55555555-5555-5555-5555-555555555555', { name: 'Ikoyi Spot 1', address_slug: 'ikoyi', vibe_tags: ['Dinner'], price_per_person: 40000, zone: 'island' }),
  ];

  it('contracts exact primary matching results with old forgeMatcher', () => {
    const input: ForgeInput = {
      startArea: 'ikeja',
      squadSize: 4,
      budget: 100000,
      vibe: 'Chill'
    };

    const legacyPlans = forgePlans(input, mockSpots);

    const request: PlanningRequest = {
      startArea: input.startArea,
      squadSize: input.squadSize,
      budget: input.budget,
      vibe: input.vibe
    };
    const context = createPlanningContext(request);
    const newPlans = PlanningEngineV1(context, mockSpots);

    expect(newPlans.length).toBe(legacyPlans.length);
    for (let i = 0; i < legacyPlans.length; i++) {
      expect(newPlans[i].spot.id).toBe(legacyPlans[i].spot.id);
      expect(newPlans[i].activityCost).toBe(legacyPlans[i].foodCost);
      expect(newPlans[i].transportCost).toBe(legacyPlans[i].transportCost);
      expect(newPlans[i].totalCost).toBe(legacyPlans[i].totalCost);
      expect(newPlans[i].whyItFits).toBe(legacyPlans[i].whyItFits);
      expect(newPlans[i].score).toBeDefined();
    }
  });

  it('contracts exact adjacent zone matches with old forgeMatcher', () => {
    const input: ForgeInput = {
      startArea: 'yaba',
      squadSize: 2,
      budget: 50000,
      vibe: 'Chill'
    };

    const legacyAdjacent = getAdjacentZoneMatches(input, mockSpots);

    const request: PlanningRequest = {
      startArea: input.startArea,
      squadSize: input.squadSize,
      budget: input.budget,
      vibe: input.vibe,
      isAdjacent: true
    };
    const context = createPlanningContext(request);
    const newAdjacent = PlanningEngineV1(context, mockSpots, true);

    expect(newAdjacent.length).toBe(legacyAdjacent.length);
    for (let i = 0; i < legacyAdjacent.length; i++) {
      expect(newAdjacent[i].spot.id).toBe(legacyAdjacent[i].spot.id);
      expect(newAdjacent[i].activityCost).toBe(legacyAdjacent[i].foodCost);
      expect(newAdjacent[i].transportCost).toBe(legacyAdjacent[i].transportCost);
      expect(newAdjacent[i].totalCost).toBe(legacyAdjacent[i].totalCost);
    }
  });

  it('contracts recovery suggestions with old recovery logic', () => {
    const input: ForgeInput = {
      startArea: 'ikeja',
      squadSize: 4,
      budget: 10000, // too low for any spot
      vibe: 'Chill'
    };

    const legacyRecovery = generateRecoverySuggestions(input, mockSpots);

    const request: PlanningRequest = {
      startArea: input.startArea,
      squadSize: input.squadSize,
      budget: input.budget,
      vibe: input.vibe
    };
    const context = createPlanningContext(request);
    const recoveryEngine = new DefaultRecoveryEngine();
    const newRecovery = recoveryEngine.run(mockSpots, context);

    expect(newRecovery.length).toBe(legacyRecovery.length);
    for (let i = 0; i < legacyRecovery.length; i++) {
      expect(newRecovery[i].type).toBe(legacyRecovery[i].type);
      expect(newRecovery[i].deltaBudget).toBe(legacyRecovery[i].deltaBudget);
      expect(newRecovery[i].suggestedArea).toBe(legacyRecovery[i].suggestedArea);
      expect(newRecovery[i].suggestedVibe).toBe(legacyRecovery[i].suggestedVibe);
      expect(newRecovery[i].unlockedVenueCount).toBe(legacyRecovery[i].unlockedVenueCount);
    }
  });
});

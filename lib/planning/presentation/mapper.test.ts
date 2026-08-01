import { describe, it, expect } from 'vitest';
import { mapPlanToCardViewModel } from './decisionCardMapper';
import type { ExplainedPlan } from '../types';
import type { Spot } from '../../types';

describe('DecisionCardViewModel Mapper tests', () => {
  const dummySpot: Spot = {
    id: 'spot-uuid-1',
    name: 'Shiro Lagos',
    address: 'Plot 15, Block VI, Landmark Centre',
    address_slug: 'vi',
    area_id: 'vi-area',
    vibe_tags: ['Dinner', 'Luxury'],
    price_per_person: 25000,
    transport_matrix: { yaba: 8000 },
    is_featured: true,
    active: true,
    category: 'restaurant',
    has_food: true,
    typical_duration_hours: 2,
    zone: 'island',
    computed_confidence_score: 95,
    verified_by: 'owner_verified',
    price_updated_at: '2026-08-01T12:00:00Z',
    price_source: 'owner_submission'
  };

  const dummyPlan: ExplainedPlan = {
    spot: dummySpot,
    activityCost: 50000,
    transportCost: 8000,
    totalCost: 58000,
    score: 92.5,
    whyItFits: 'Your squad saves ₦2,000 under budget — enough for a bottle.',
    title: 'Date Night in Victoria Island',
    subtitle: 'A verified date night for 2 people at Shiro Lagos.',
    decisionSummary: 'This is our strongest recommendation. It fits your budget comfortably.',
    decisionConfidence: {
      level: 'Very High',
      evidenceList: ['price_verified', 'menu_recent']
    },
    explanation: {
      budget_fit: 'Fits ₦60,000 squad budget',
      freshness: 'Prices updated just now',
      confidence: '95% data confidence',
      tax_transparency: 'Includes 7.5% VAT + food service',
      source_label: 'Owner submitted',
      confidence_score: 95,
      status: 'owner_verified',
      travel_info: '18 mins from Yaba • +₦8,000 transport'
    },
    isAdjacentZoneSuggestion: false,
    travelInfo: undefined
  };

  it('maps ExplainedPlan to DecisionCardViewModel with exact layout consistency', () => {
    const card = mapPlanToCardViewModel(dummyPlan);

    // Assert exact golden structure to capture accidental regressions
    expect(card).toEqual({
      title: 'Date Night in Victoria Island',
      heroImage: dummySpot.image_url, // undefined since not provided
      venueCost: 50000,
      transportCost: 8000,
      totalCost: 58000,
      budgetFit: 'Fits ₦60,000 squad budget',
      verification: 'Prices updated just now',
      confidence: 95,
      whyItFits: 'Your squad saves ₦2,000 under budget — enough for a bottle.',
      planningSummary: 'This is our strongest recommendation. It fits your budget comfortably.',
      
      spot: dummySpot,
      spotId: 'spot-uuid-1',
      spotName: 'Shiro Lagos',
      category: 'restaurant',
      address: 'Plot 15, Block VI, Landmark Centre',
      pricePerPerson: 25000,
      addressSlug: 'vi',
      areaSlug: 'vi',
      travelInfo: undefined,
      isAdjacent: false
    });
  });
});

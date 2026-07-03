import { calculateTypicalOutingCost } from '../lib/services/pricingEngine';
import { calculateConfidence } from '../lib/services/confidenceEngine';
import { forgePlans } from '../lib/matchingEngine';
import { MenuItem, PriceEvidence, Spot, ForgeInput } from '../lib/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ Pass: ${message}`);
}

function runTests() {
  console.log('Running OyaPlan Phase 2 Unit Tests in TypeScript...');

  // ==========================================
  // Test 1: Pricing Engine Calculations
  // ==========================================
  console.log('\n--- Testing Pricing Engine ---');

  const mockMenuItems: MenuItem[] = [
    { id: '1', venue_id: 'v1', category: 'main', price: 8000, name: 'Burger', is_available: true },
    { id: '2', venue_id: 'v1', category: 'main', price: 12000, name: 'Steak', is_available: true },
    { id: '3', venue_id: 'v1', category: 'main', price: 10000, name: 'Pasta', is_available: true }, // Median main is 10000
    { id: '4', venue_id: 'v1', category: 'soft_drink', price: 1500, name: 'Soda', is_available: true },
    { id: '5', venue_id: 'v1', category: 'cocktail', price: 4500, name: 'Mojito', is_available: true },
    { id: '6', venue_id: 'v1', category: 'beer', price: 2500, name: 'Lager', is_available: true }, // Median drink is 2500
    { id: '7', venue_id: 'v1', category: 'starter', price: 4000, name: 'Wings', is_available: true }
  ];

  // Test Restaurant cost calculation: (Median Main + Median Drink) * Taxes
  // Median Main = 10000. Median Drink = 2500. Subtotal = 12500.
  // Taxes = 7.5% VAT + 10% Service Charge = 17.5%.
  // Expected typical cost = 12500 * 1.175 = 14687.5 => rounded to 14700.
  const restaurantCost = calculateTypicalOutingCost(mockMenuItems, 'restaurant', {
    vat_pct: 7.5,
    service_charge_pct: 10.0,
    minimum_spend: 0
  });
  assert(restaurantCost === 14700, `Restaurant typical outing cost should be 14700, got ${restaurantCost}`);

  // Test minimum spend override
  const restaurantCostMinSpend = calculateTypicalOutingCost(mockMenuItems, 'restaurant', {
    vat_pct: 7.5,
    service_charge_pct: 10.0,
    minimum_spend: 20000
  });
  assert(restaurantCostMinSpend === 20000, `Restaurant cost should clamp to minimum spend 20000, got ${restaurantCostMinSpend}`);

  // Test Bar cost calculation: (2 * Median Drink + Median Starter) * Taxes
  // Median Drink = 3500 (filter alcohol drink: 4500, 2500, average/median is 3500).
  // Median Starter = 4000.
  // Subtotal = 2 * 3500 + 4000 = 11000.
  // Taxes = 7.5% VAT.
  // Expected cost = 11000 * 1.075 = 11825 => rounded to 11800.
  const barCost = calculateTypicalOutingCost(mockMenuItems, 'bar', {
    vat_pct: 7.5,
    service_charge_pct: 0.0,
    minimum_spend: 0
  });
  assert(barCost === 11800, `Bar typical cost should be 11800, got ${barCost}`);


  // ==========================================
  // Test 2: Confidence Engine Calculations
  // ==========================================
  console.log('\n--- Testing Confidence Engine ---');

  // Case A: No evidence
  const confidenceNoEv = calculateConfidence([], mockMenuItems, 'restaurant');
  assert(confidenceNoEv.score === 10.00, 'Empty evidence should result in 10% confidence');

  // Case B: Fresh admin evidence
  const mockEvidenceFreshAdmin: PriceEvidence[] = [
    {
      id: 'e1',
      menu_item_id: '1',
      venue_id: 'v1',
      source_type: 'owner_submission',
      submitted_by: 'admin_user',
      recorded_price: 8000,
      verification_status: 'approved',
      confidence_weight: 1.00,
      created_at: new Date().toISOString() // Fresh today
    }
  ];
  const confAdmin = calculateConfidence(mockEvidenceFreshAdmin, mockMenuItems, 'restaurant');
  // Freshness = 100%, Source = 100%
  // Volume = 1 submitter -> 25%
  // Completeness = main, starter, soft_drink present -> (3 / 3) * 100 = 100%
  // Score = 100*0.35 + 100*0.30 + 25*0.20 + 100*0.15 = 35 + 30 + 5 + 15 = 85%
  assert(confAdmin.score >= 84 && confAdmin.score <= 86, `Fresh admin evidence should score around 85%, got ${confAdmin.score}%`);

  // Case C: Mismatched/Conflicting Prices Penalty
  const mockEvidenceConflict: PriceEvidence[] = [
    {
      id: 'e1',
      menu_item_id: '1',
      venue_id: 'v1',
      source_type: 'owner_submission',
      submitted_by: 'admin_user',
      recorded_price: 8000,
      verification_status: 'approved',
      confidence_weight: 1.00,
      created_at: new Date().toISOString()
    },
    {
      id: 'e2',
      menu_item_id: '1',
      venue_id: 'v1',
      source_type: 'receipt_upload',
      submitted_by: 'customer_1',
      recorded_price: 15000, // Massive conflict (15k vs 8k)
      verification_status: 'approved',
      confidence_weight: 0.90,
      created_at: new Date().toISOString()
    }
  ];
  const confConflict = calculateConfidence(mockEvidenceConflict, mockMenuItems, 'restaurant');
  // Should trigger the Conflict Penalty (-30)
  assert(confConflict.reasons.some(r => r.includes('Conflicting prices')), 'Conflict warning should list in reasons');
  assert(confConflict.score <= 60, `Conflict should decrease confidence score below or equal to 60, got ${confConflict.score}%`);

  // Case D: User Up-Flags Penalty Check
  const mockFlags = [
    { flag_type: 'up' },
    { flag_type: 'up' },
    { flag_type: 'up' }
  ];
  const confWithFlags = calculateConfidence(mockEvidenceFreshAdmin, mockMenuItems, 'restaurant', mockFlags);
  // Base score without flags is 85%.
  // 3 up-flags should subtract 20%.
  // Expected score = 85 - 20 = 65%.
  assert(confWithFlags.score === 65, `Confidence score with 3 up-flags should be 65%, got ${confWithFlags.score}%`);
  assert(confWithFlags.reasons.some(r => r.includes('flagged prices as higher')), 'Up-flags warning should list in reasons');

  // ==========================================
  // Test 3: Recommendation Engine (Trust Ranking & Explainability)
  // ==========================================
  console.log('\n--- Testing Recommendation Engine (Trust Ranking) ---');

  const mockSpots: Spot[] = [
    {
      id: 'spot-1',
      name: 'Fresh Spot',
      address: '123 Fresh St',
      area_id: 'a1',
      vibe_tags: ['Chill'],
      price_per_person: 10000,
      price_updated_at: new Date().toISOString(),
      transport_matrix: { 'yaba': 2000 },
      is_featured: false,
      active: true,
      category: 'restaurant',
      verified_by: 'fresh',
      computed_confidence_score: 95
    },
    {
      id: 'spot-2',
      name: 'Stale Spot',
      address: '456 Old St',
      area_id: 'a1',
      vibe_tags: ['Chill'],
      price_per_person: 10000,
      price_updated_at: '2020-01-01T00:00:00.000Z',
      transport_matrix: { 'yaba': 2000 },
      is_featured: false,
      active: true,
      category: 'restaurant',
      verified_by: 'stale',
      computed_confidence_score: 30
    }
  ];

  const forgeInput: ForgeInput = {
    startArea: 'yaba',
    squadSize: 2,
    budget: 50000,
    vibe: 'Chill'
  };

  const results = forgePlans(forgeInput, mockSpots);
  
  assert(results.length > 0, 'Should generate matching plans');
  assert(results[0].spot.name === 'Fresh Spot', 'Fresh spot should be ranked first due to trust boosts');
  assert(results[0].explanation !== undefined, 'Explanation payload must be present');
  assert(results[0].explanation?.confidence === '95% data confidence', `Explanation confidence matches, got: ${results[0].explanation?.confidence}`);

  console.log('\nAll engines passed verification tests successfully! 🚀');
}

runTests();


const { calculateTypicalOutingCost } = require('../lib/services/pricingEngine');
const { calculateConfidence } = require('../lib/services/confidenceEngine');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ Pass: ${message}`);
}

function runTests() {
  console.log('Running OyaPlan Phase 2 Unit Tests...');

  // ==========================================
  // Test 1: Pricing Engine Calculations
  // ==========================================
  console.log('\n--- Testing Pricing Engine ---');

  const mockMenuItems = [
    { id: '1', category: 'main', price: 8000, name: 'Burger', is_available: true },
    { id: '2', category: 'main', price: 12000, name: 'Steak', is_available: true },
    { id: '3', category: 'main', price: 10000, name: 'Pasta', is_available: true }, // Median main is 10000
    { id: '4', category: 'soft_drink', price: 1500, name: 'Soda', is_available: true },
    { id: '5', category: 'cocktail', price: 4500, name: 'Mojito', is_available: true },
    { id: '6', category: 'beer', price: 2500, name: 'Lager', is_available: true }, // Median drink is 2500
    { id: '7', category: 'starter', price: 4000, name: 'Wings', is_available: true }
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
  const mockEvidenceFreshAdmin = [
    {
      id: 'e1',
      menu_item_id: '1',
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
  // Completeness = main, soft_drink present -> (2 / 3) * 100 = 66.6%
  // Score = 100*0.35 + 100*0.30 + 25*0.20 + 66.6*0.15 = 35 + 30 + 5 + 10 = 80%
  assert(confAdmin.score >= 79 && confAdmin.score <= 81, `Fresh admin evidence should score around 80%, got ${confAdmin.score}%`);

  // Case C: Mismatched/Conflicting Prices Penalty
  const mockEvidenceConflict = [
    {
      id: 'e1',
      menu_item_id: '1',
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
  assert(confConflict.reasons.some(r => r.includes('price conflicts')), 'Conflict warning should list in reasons');
  assert(confConflict.score < 60, `Conflict should decrease confidence score below 60, got ${confConflict.score}%`);

  console.log('\nAll engines passed verification tests successfully! 🚀');
}

runTests();

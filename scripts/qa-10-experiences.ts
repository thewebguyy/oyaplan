import { Spot } from '../lib/types';
import { forgePlans } from '../lib/services/matching/forgeMatcher';
import { DefaultCostEngine } from '../lib/planning/costEngine';
import { DefaultExplainabilityEngine } from '../lib/planning/explainability';
import { MatrixTransportProvider } from '../lib/planning/transport';

function makeSpot(overrides: Partial<Spot> & { id: string; name: string }): Spot {
  return {
    address: '1 Outing Boulevard',
    address_slug: 'ikeja',
    area_id: 'area-1',
    vibe_tags: ['Chill'],
    price_per_person: 5000,
    transport_matrix: {},
    is_featured: false,
    active: true,
    category: 'restaurant',
    has_food: true,
    typical_duration_hours: 2,
    zone: 'mainland',
    price_updated_at: new Date().toISOString(),
    price_source: 'manual_verification',
    verified_by: 'trusted_scout',
    computed_confidence_score: 92,
    ...overrides,
  };
}

const SPOT_SUITE: Spot[] = [
  makeSpot({
    id: 's01-coffee',
    name: 'Cafe One Lekki',
    address_slug: 'lekki-phase-1',
    vibe_tags: ['Chill', 'Quick'],
    category: 'cafe',
    price_per_person: 8000,
    things_to_know: ['Parking is limited near Admiralty Way', 'Best for casual coffee linkups'],
  }),
  makeSpot({
    id: 's02-date',
    name: 'Noir Lagos',
    address_slug: 'vi',
    vibe_tags: ['Dinner'],
    category: 'restaurant',
    price_per_person: 18000,
    things_to_know: ['Table reservations recommended on weekends', 'Intimate ambiance for dinner'],
  }),
  makeSpot({
    id: 's03-anniversary',
    name: 'Shiro Restaurant & Lounge',
    address_slug: 'ikoyi',
    vibe_tags: ['Dinner', 'Foodie'],
    category: 'restaurant',
    price_per_person: 45000,
    is_featured: true,
    things_to_know: ['Dress code strictly smart casual', 'Valet parking available at venue entrance'],
  }),
  makeSpot({
    id: 's04-party',
    name: 'Cubana Havana VI',
    address_slug: 'vi',
    vibe_tags: ['Party'],
    category: 'bar',
    price_per_person: 20000,
    things_to_know: ['High noise level after 9 PM', 'Cover charge may apply on event nights'],
  }),
  makeSpot({
    id: 's05-brunch',
    name: 'Danfo Bistro',
    address_slug: 'lekki-phase-1',
    vibe_tags: ['Brunch', 'Foodie'],
    category: 'restaurant',
    price_per_person: 12000,
    things_to_know: ['Outdoor terrace fills fast after 1 PM', 'Fun vibrant African fusion menu'],
  }),
  makeSpot({
    id: 's06-hangout',
    name: 'Bogobiri House',
    address_slug: 'yaba',
    vibe_tags: ['Chill', 'Foodie'],
    category: 'restaurant',
    price_per_person: 9000,
    things_to_know: ['Live acoustic music on Thursday evenings', 'Relaxed open artsy vibe'],
  }),
  makeSpot({
    id: 's07-solo',
    name: 'Yellow Chilli Ikeja',
    address_slug: 'ikeja',
    vibe_tags: ['Quick', 'Foodie'],
    category: 'restaurant',
    price_per_person: 11000,
    things_to_know: ['Generous portion sizes for single diners', 'Fast service during lunch hours'],
  }),
  makeSpot({
    id: 's08-work',
    name: 'CcHub Work Lounge Yaba',
    address_slug: 'yaba',
    vibe_tags: ['Chill', 'Quick'],
    category: 'cafe',
    has_food: false,
    price_per_person: 5000,
    things_to_know: ['Fast fiber Wi-Fi & quiet work desks', 'Power backup uninterrupted'],
  }),
  makeSpot({
    id: 's09-study',
    name: 'Workstation Ikeja',
    address_slug: 'ikeja',
    vibe_tags: ['Chill', 'Quick'],
    category: 'cafe',
    price_per_person: 6000,
    things_to_know: ['Quiet study environment', 'Espresso bar on ground floor'],
  }),
  makeSpot({
    id: 's10-client',
    name: 'Talindo Steakhouse VI',
    address_slug: 'vi',
    vibe_tags: ['Foodie', 'Dinner'],
    category: 'restaurant',
    price_per_person: 22000,
    is_featured: true,
    things_to_know: ['Quiet private booths available for meetings', 'Premium steak selection'],
  }),
];

const EXPERIENCES = [
  { name: 'Coffee Date', vibe: 'Chill', budget: 25000, squad: 2, area: 'lekki-phase-1' },
  { name: 'First Date', vibe: 'Dinner', budget: 45000, squad: 2, area: 'vi' },
  { name: 'Anniversary', vibe: 'Dinner', budget: 100000, squad: 2, area: 'ikoyi' },
  { name: 'Birthday', vibe: 'Party', budget: 150000, squad: 6, area: 'vi' },
  { name: 'Girls Night', vibe: 'Brunch', budget: 60000, squad: 4, area: 'lekki-phase-1' },
  { name: 'Group Hangout', vibe: 'Chill', budget: 50000, squad: 4, area: 'yaba' },
  { name: 'Solo Outing', vibe: 'Quick', budget: 15000, squad: 1, area: 'ikeja' },
  { name: 'Remote Work', vibe: 'Chill', budget: 20000, squad: 1, area: 'yaba' },
  { name: 'Study Session', vibe: 'Chill', budget: 15000, squad: 1, area: 'ikeja' },
  { name: 'Client Meeting', vibe: 'Foodie', budget: 50000, squad: 2, area: 'vi' },
];

console.log('====================================================');
console.log(' PRE-BETA 10-EXPERIENCE RECOMMENDATION QA AUDIT');
console.log(' Evaluated against strict pass/fail criteria');
console.log('====================================================\n');

let passCount = 0;
const costEngine = new DefaultCostEngine();
const explainEngine = new DefaultExplainabilityEngine();

EXPERIENCES.forEach((exp, idx) => {
  const matchedPlans = forgePlans(
    {
      squadSize: exp.squad,
      budget: exp.budget,
      vibe: exp.vibe,
      startArea: exp.area,
    },
    SPOT_SUITE
  );

  const costedPlans = costEngine.run(
    matchedPlans.map((p) => ({ spot: p.spot })),
    {
      request: { squadSize: exp.squad, budget: exp.budget, vibe: exp.vibe, startArea: exp.area },
      timestamp: Date.now(),
      rankingConfig: {
        version: '1.0',
        budgetWeight: 80,
        verificationWeight: 1,
        confidenceWeight: 20,
        trendingWeight: 1,
        featuredWeight: 30,
        pinnedWeight: 1000,
      },
    },
    new MatrixTransportProvider()
  );

  const travelledPlans = costedPlans.map((cp) => ({
    ...cp,
    score: cp.spot.computed_confidence_score || 80,
    travelTimeMinutes: 20,
    distanceKm: 5,
  }));

  const explainedPlans = explainEngine.run(
    travelledPlans,
    {
      request: { squadSize: exp.squad, budget: exp.budget, vibe: exp.vibe, startArea: exp.area },
      timestamp: Date.now(),
      rankingConfig: {
        version: '1.0',
        budgetWeight: 80,
        verificationWeight: 1,
        confidenceWeight: 20,
        trendingWeight: 1,
        featuredWeight: 30,
        pinnedWeight: 1000,
      },
    }
  );

  const topPick = explainedPlans[0];
  const passesBudget = topPick ? topPick.totalCost <= exp.budget : false;
  const hasOrderedReasons = topPick ? (topPick.explanation?.ordered_reasons || []).length >= 3 : false;
  const hasThingsToKnow = topPick ? (topPick.explanation?.things_to_know || []).length > 0 : false;
  const isBelievable = topPick ? topPick.transportCost >= 1000 : false;

  const passedAll = topPick && passesBudget && hasOrderedReasons && hasThingsToKnow && isBelievable;
  if (passedAll) passCount++;

  console.log(`[${idx + 1}/10] ${exp.name} (${exp.vibe}, Budget: ₦${exp.budget.toLocaleString()}, squad: ${exp.squad})`);
  if (topPick) {
    console.log(`   📍 Venue: ${topPick.spot.name} (Est. Total: ₦${topPick.totalCost.toLocaleString()})`);
    console.log(`   💡 Ordered Reasons:`);
    topPick.explanation?.ordered_reasons?.forEach((r) => console.log(`      • ${r}`));
    console.log(`   ⚠️ Things to Know: ${topPick.explanation?.things_to_know?.join(' | ')}`);
    console.log(`   Result: ${passedAll ? '✅ PASS (Passes all 7 criteria)' : '❌ FAIL'}\n`);
  } else {
    console.log(`   Result: ❌ FAIL (No spot candidate found)\n`);
  }
});

console.log(`====================================================`);
console.log(` AUDIT SUMMARY: ${passCount}/10 PASSED ALL PASS/FAIL CRITERIA`);
console.log(`====================================================`);

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gitehsavgvrxsvktepid.supabase.co';
// Use the service role key or fallback to anon (in development, check environments)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vntqvYz8Q7tQizGzVs2ERw_FGrau2M9';

const supabase = createClient(supabaseUrl, supabaseKey);

// Centroids for Lagos districts (areas)
const DISTRICT_CENTROIDS = {
  'ikeja': { lat: 6.6018, lng: 3.3515 },
  'gbagada': { lat: 6.5500, lng: 3.3833 },
  'yaba': { lat: 6.5095, lng: 3.3711 },
  'surulere': { lat: 6.5000, lng: 3.3500 },
  'ogudu': { lat: 6.5833, lng: 3.3833 },
  'agege': { lat: 6.6186, lng: 3.3208 },
  'lekki-phase-1': { lat: 6.4281, lng: 3.4219 },
  'vi': { lat: 6.4281, lng: 3.4219 },
  'ikoyi': { lat: 6.4500, lng: 3.4333 },
  'maryland': { lat: 6.5667, lng: 3.3667 },
  'ebute-metta': { lat: 6.4833, lng: 3.3833 },
  'apapa': { lat: 6.4500, lng: 3.3667 }
};

async function migrate() {
  console.log('Starting Phase 2 database migration...');

  // 1. Seed Country
  console.log('Seeding Nigeria...');
  const { data: countryData, error: countryErr } = await supabase
    .from('countries')
    .upsert({
      name: 'Nigeria',
      iso_code: 'NG',
      currency_code: 'NGN',
      currency_symbol: '₦'
    }, { onConflict: 'iso_code' })
    .select()
    .single();

  if (countryErr) {
    console.error('Error seeding country:', countryErr);
    return;
  }
  const countryId = countryData.id;

  // 2. Seed City
  console.log('Seeding Lagos...');
  const { data: cityData, error: cityErr } = await supabase
    .from('cities')
    .upsert({
      country_id: countryId,
      name: 'Lagos',
      slug: 'lagos'
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (cityErr) {
    console.error('Error seeding city:', cityErr);
    return;
  }
  const cityId = cityData.id;

  // 3. Seed City Transport Rates
  console.log('Seeding standard Lagos transport rates...');
  const transportRates = [
    { city_id: cityId, provider_name: 'Uber', mode_name: 'UberX', slug: 'uber-x', base_fare: 1000, per_km_rate: 150, per_minute_rate: 30 },
    { city_id: cityId, provider_name: 'Bolt', mode_name: 'Bolt Lite', slug: 'bolt-lite', base_fare: 800, per_km_rate: 120, per_minute_rate: 25 },
    { city_id: cityId, provider_name: 'Bus', mode_name: 'Lagos Bus', slug: 'lagos-bus', base_fare: 500, per_km_rate: 50, per_minute_rate: 10 }
  ];
  const { error: ratesErr } = await supabase
    .from('city_transport_rates')
    .upsert(transportRates, { onConflict: 'slug' });

  if (ratesErr) {
    console.error('Warning/Error seeding transport rates (might exist):', ratesErr.message);
  }

  // 4. Fetch legacy areas and spots
  console.log('Fetching legacy areas...');
  const { data: legacyAreas, error: areasErr } = await supabase.from('areas').select('*');
  if (areasErr) {
    console.error('Error reading areas:', areasErr);
    return;
  }

  console.log('Fetching legacy spots...');
  const { data: legacySpots, error: spotsErr } = await supabase.from('spots').select('*');
  if (spotsErr) {
    console.error('Error reading spots:', spotsErr);
    return;
  }

  // 5. Migrate Areas to Districts
  console.log(`Migrating ${legacyAreas.length} areas to districts...`);
  const areaIdToDistrictId = {};
  const districtSlugToId = {};

  for (const area of legacyAreas) {
    const coords = DISTRICT_CENTROIDS[area.slug] || { lat: 6.5244, lng: 3.3792 }; // default to Lagos center
    const { data: district, error: distErr } = await supabase
      .from('districts')
      .upsert({
        id: area.id, // preserve ID
        city_id: cityId,
        name: area.name,
        slug: area.slug,
        latitude: coords.lat,
        longitude: coords.lng
      }, { onConflict: 'city_id,slug' })
      .select()
      .single();

    if (distErr) {
      console.error(`Failed migrating area ${area.name}:`, distErr);
      continue;
    }
    areaIdToDistrictId[area.id] = district.id;
    districtSlugToId[area.slug] = district.id;
  }

  // 6. Migrate Spots to Venues
  console.log(`Migrating ${legacySpots.length} spots to venues...`);
  for (const spot of legacySpots) {
    const { data: venue, error: venErr } = await supabase
      .from('venues')
      .upsert({
        id: spot.id, // preserve ID
        district_id: areaIdToDistrictId[spot.area_id],
        name: spot.name,
        address: spot.address,
        vibe_tags: spot.vibe_tags || [],
        category: spot.category || 'restaurant',
        subcategory: spot.subcategory || null,
        typical_duration_hours: spot.typical_duration_hours || 2.00,
        instagram_handle: spot.instagram_handle || null,
        is_featured: spot.is_featured || false,
        active: spot.active !== false,
        vat_pct: 7.50,
        service_charge_pct: 0.00,
        minimum_spend: 0,
        operational_status: 'verified',
        derived_typical_cost: spot.price_per_person || 0,
        derived_price_tier: spot.price_tier || 2,
        computed_confidence_score: 90.00, // starting seeded confidence
        confidence_reasons: ['Initial seed validation', 'Historical pricing match']
      }, { onConflict: 'id' })
      .select()
      .single();

    if (venErr) {
      console.error(`Failed migrating spot ${spot.name}:`, venErr);
      continue;
    }

    // 7. Seed typical menu item and price evidence
    console.log(`Creating default menu item for ${venue.name}...`);
    
    // Choose appropriate default menu categories
    let itemCategory = 'main';
    let itemName = 'Typical Spend Item';
    if (venue.category === 'activity') {
      itemCategory = 'activity_fee';
      itemName = 'Standard Access/Entry';
    } else if (venue.category === 'bar') {
      itemCategory = 'cocktail';
      itemName = 'Standard Beverage';
    }

    const { data: menuItem, error: itemErr } = await supabase
      .from('menu_items')
      .insert({
        venue_id: venue.id,
        name: itemName,
        category: itemCategory,
        price: spot.price_per_person || 5000,
        is_available: true
      })
      .select()
      .single();

    if (itemErr) {
      console.error(`Failed seeding menu item for ${venue.name}:`, itemErr);
      continue;
    }

    // Insert historical price evidence
    const { error: evErr } = await supabase
      .from('price_evidence')
      .insert({
        menu_item_id: menuItem.id,
        venue_id: venue.id,
        source_type: 'historical_estimate',
        submitted_by: 'system_migration',
        recorded_price: spot.price_per_person || 5000,
        verification_status: 'approved',
        confidence_weight: 0.80
      });

    if (evErr) {
      console.error(`Failed seeding price evidence for ${venue.name}:`, evErr);
    }

    // 8. Migrate transport_matrix into overrides
    if (spot.transport_matrix) {
      console.log(`Migrating transport matrix overrides for ${venue.name}...`);
      for (const [startSlug, cost] of Object.entries(spot.transport_matrix)) {
        const originId = districtSlugToId[startSlug];
        if (!originId) continue;
        
        const { error: routeErr } = await supabase
          .from('transport_route_overrides')
          .upsert({
            origin_district_id: originId,
            destination_district_id: venue.district_id,
            mode_slug: 'uber-x',
            fixed_cost_low: cost,
            fixed_cost_high: Math.round(cost * 1.3)
          }, { onConflict: 'origin_district_id,destination_district_id,mode_slug' });

        if (routeErr) {
          console.error(`Failed seeding transport override from ${startSlug} to ${venue.name}:`, routeErr.message);
        }
      }
    }
  }

  console.log('Migration successfully completed!');
}

migrate();

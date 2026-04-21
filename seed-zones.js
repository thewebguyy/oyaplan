const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gitehsavgvrxsvktepid.supabase.co';
const supabaseKey = 'sb_publishable_vntqvYz8Q7tQizGzVs2ERw_FGrau2M9';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Check if zones exist
  let { data } = await supabase.from('zones').select('id');
  if (!data || data.length === 0) {
    console.log("Zones missing. Inserting...");
    const { error } = await supabase.from('zones').insert([
      { id: '11111111-1111-1111-1111-111111111111', name: 'Lagos Mainland', slug: 'mainland', description: 'The heart of Lagos hustle, featuring Yaba, Ikeja, and Surulere.', area_count: 5 },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Lagos Central', slug: 'central', description: 'The historic mainland core connecting everything.', area_count: 3 },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Lagos Island', slug: 'island', description: 'Upscale dining, clubs, and premium experiences.', area_count: 3 },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Lagos Waterfront', slug: 'waterfront', description: 'Beaches, resorts, and ocean-facing spots.', area_count: 1 },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Lagos Other', slug: 'other', description: 'Hidden gems further afield.', area_count: 0 }
    ]);
    if (error) {
      console.error("Error inserting zones:", error);
    } else {
      console.log("Zones inserted.");
    }
  } else {
    console.log("Zones already exist:", data);
  }
}
run();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: totalVenues } = await supabase.from('venues').select('*', { count: 'exact', head: true });
  
  // Get venues with prices (has a menu item)
  const { data: menuItems } = await supabase.from('menu_items').select('venue_id');
  const venuesWithPrice = new Set((menuItems || []).map(m => m.venue_id)).size;
  
  // Get venues with price evidence
  const { data: evidence } = await supabase.from('price_evidence').select('venue_id');
  const venuesWithEvidence = new Set((evidence || []).map(e => e.venue_id)).size;
  
  // Venues with cover images
  const { count: venuesWithCover } = await supabase.from('venues').select('*', { count: 'exact', head: true }).not('cover_url', 'is', null);
  
  // Venues with gallery images
  const { count: venuesWithGallery } = await supabase.from('venues').select('*', { count: 'exact', head: true }).not('gallery_urls', 'is', null).neq('gallery_urls', '{}');
  
  console.log(`Total Venues: ${totalVenues}`);
  console.log(`Venues with price: ${venuesWithPrice}`);
  console.log(`Venues with price evidence: ${venuesWithEvidence}`);
  console.log(`Venues with cover images: ${venuesWithCover}`);
  console.log(`Venues with gallery images: ${venuesWithGallery}`);
}

run().catch(console.error);

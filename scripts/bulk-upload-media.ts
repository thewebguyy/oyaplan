import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Initialize Supabase client
// Make sure to use the SERVICE_ROLE_KEY to bypass RLS and allow admin updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface VenueMediaRecord {
  venueName?: string;
  venueId?: string;
  heroUrl?: string;
  galleryUrls?: string[];
}

async function run() {
  const dataPath = path.join(process.cwd(), 'scripts', 'venue-media.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: Data file not found at ${dataPath}`);
    console.log('Please create the file with the following format:');
    console.log(`
    [
      {
        "venueName": "100 Degrees Rooftop (Ikoyi)",
        "heroUrl": "https://...",
        "galleryUrls": ["https://...", "https://..."]
      }
    ]
    `);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  let records: VenueMediaRecord[];
  
  try {
    records = JSON.parse(rawData);
  } catch (error) {
    console.error('Error: Invalid JSON in venue-media.json', error);
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const record of records) {
    try {
      let query = supabase.from('venues').update({
        ...(record.heroUrl && { cover_url: record.heroUrl }),
        ...(record.galleryUrls && { gallery_urls: record.galleryUrls }),
      });

      if (record.venueId) {
        query = query.eq('id', record.venueId);
      } else if (record.venueName) {
        query = query.eq('name', record.venueName);
      } else {
        console.warn(`Skipping record: missing venueName or venueId`, record);
        failCount++;
        continue;
      }

      const { data, error } = await query.select('id, name');

      if (error) {
        console.error(`Failed to update ${record.venueName || record.venueId}:`, error.message);
        failCount++;
      } else if (!data || data.length === 0) {
        console.warn(`Venue not found: ${record.venueName || record.venueId}`);
        failCount++;
      } else {
        console.log(`Successfully updated: ${data[0].name}`);
        successCount++;
      }
    } catch (e) {
      console.error(`Unexpected error processing ${record.venueName || record.venueId}:`, e);
      failCount++;
    }
  }

  console.log('---');
  console.log(`Bulk upload completed.`);
  console.log(`Successfully updated: ${successCount} venues`);
  console.log(`Failed to update: ${failCount} venues`);
}

run().catch(console.error);

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Schema for the expected JSON structure
const venueSchema = z.object({
  'Venue Name': z.string().transform(s => s.trim()),
  'Category': z.string().transform(s => s.trim()),
  'Area': z.string().transform(s => s.trim()),
  'District': z.string().transform(s => s.trim()),
  'Full Address': z.string().transform(s => s.trim()),
  'Island or Mainland': z.string().transform(s => s.trim()),
  'Budget / Price': z.number().nullable().optional(),
  'Price Range': z.string().transform(s => s.trim()).nullable().optional(),
  'Currency': z.string().transform(s => s.trim()),
  'Price Type': z.string().transform(s => s.trim()),
  'Source Tweet URL': z.string().transform(s => s.trim()),
  'Tweet Date': z.string().transform(s => s.trim()),
  'Confidence': z.string().transform(s => s.trim()),
  'Times Mentioned': z.number().optional(),
  'vibe_tags': z.array(z.string()).min(1, 'vibe_tags is required and cannot be empty'),
  'transport_matrix': z.record(z.number()).nullable().optional()
});

const venuesArraySchema = z.array(venueSchema);

function mapAreaToSlug(area: string, district: string): string | null {
  const a = area.toLowerCase();
  const d = district.toLowerCase();
  
  if (a.includes('ikeja') || d.includes('ikeja')) return 'ikeja';
  if (a.includes('victoria island') || a.includes('vi') || d.includes('vi') || d.includes('victoria island')) return 'vi';
  if (a.includes('lekki') || d.includes('lekki')) return 'lekki-phase-1';
  if (a.includes('yaba') || d.includes('yaba')) return 'yaba';
  if (a.includes('surulere') || d.includes('surulere')) return 'surulere';
  if (a.includes('ikoyi') || d.includes('ikoyi')) return 'ikoyi';
  if (a.includes('gbagada') || d.includes('gbagada')) return 'gbagada';
  if (a.includes('ogudu') || d.includes('ogudu')) return 'ogudu';
  if (a.includes('agege') || d.includes('agege')) return 'agege';
  if (a.includes('maryland') || d.includes('maryland')) return 'maryland';
  if (a.includes('ebute') || d.includes('ebute')) return 'ebute-metta';
  if (a.includes('apapa') || d.includes('apapa')) return 'apapa';
  
  return null;
}

function parsePrice(budget: number | null | undefined, range: string | null | undefined): number {
  if (range && range.includes('-')) {
    const parts = range.split('-').map(p => parseInt(p.replace(/[^0-9]/g, ''), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const midpoint = (parts[0] + parts[1]) / 2;
      return Math.round(midpoint / 500) * 500;
    }
  }
  return budget || 0;
}

function mapCategory(cat: string): string {
  const lowercase = cat.toLowerCase();
  if (['restaurant', 'bar', 'cafe', 'activity', 'nature', 'entertainment', 'beach', 'experience'].includes(lowercase)) {
    return lowercase;
  }
  return 'experience'; // fallback
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  const filePath = args.find(a => !a.startsWith('--')) || 'venues.json';

  console.log(`Starting ${isDryRun ? 'DRY RUN' : 'LIVE RUN'}`);
  console.log(`Reading from ${filePath}`);

  let rawData;
  try {
    rawData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8'));
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err);
    process.exit(1);
  }

  const parseResult = venuesArraySchema.safeParse(rawData);
  if (!parseResult.success) {
    console.error('JSON validation failed. Ensure vibe_tags are present and formats are correct:');
    console.error(parseResult.error.format());
    process.exit(1);
  }

  const venues = parseResult.data;

  // Cache areas to map address_slug to area_id
  const { data: areasData, error: areasError } = await supabase.from('areas').select('id, slug');
  if (areasError) {
    console.error('Failed to fetch areas for mapping:', areasError);
    process.exit(1);
  }
  const areaSlugToId: Record<string, string> = {};
  areasData?.forEach(a => {
    areaSlugToId[a.slug] = a.id;
  });

  for (const venue of venues) {
    const venueName = venue['Venue Name'];
    console.log(`\nProcessing: ${venueName}`);

    const addressSlug = mapAreaToSlug(venue['Area'], venue['District']);
    const areaId = addressSlug ? areaSlugToId[addressSlug] : null;
    const price = parsePrice(venue['Budget / Price'], venue['Price Range']);
    const category = mapCategory(venue['Category']);

    const spotRecord = {
      name: venueName,
      address: venue['Full Address'],
      address_slug: addressSlug,
      area_id: areaId,
      vibe_tags: [], // Explicit instruction: insert as empty, ignoring JSON vibe_tags for DB spot insertion
      price_per_person: price,
      transport_matrix: null, // Explicit instruction: transport_matrix: null
      active: false, // Explicit instruction: active: false
      price_updated_at: new Date().toISOString(),
      price_source: 'crowd',
      category: category,
      verified_by: 'seed',
      zone: venue['Island or Mainland'].toLowerCase().includes('island') ? 'island' : 'mainland'
    };

    const submissionRecord = {
      source: 'grok_scrape_2026_07_verified',
      raw_payload: venue,
      venue_name: venueName,
      area: venue['Area'],
      source_tweet_url: venue['Source Tweet URL'],
      tweet_date: venue['Tweet Date']
    };

    if (isDryRun) {
      console.log('[DRY RUN] Would insert Spot:', spotRecord);
      console.log('[DRY RUN] Would insert Submission Audit:', submissionRecord);
      continue;
    }

    // Live Run
    try {
      // 1. Insert into spots
      const { error: spotError } = await supabase
        .from('spots')
        .insert(spotRecord);
      
      if (spotError) {
        console.error(`[ERROR] Failed to insert Spot for ${venueName}:`, spotError.message);
        continue; // Skip audit row if spot insertion fails, per instruction "if either insert fails... log... continue"
      }

      // 2. Insert into spot_submissions_raw
      const { error: auditError } = await supabase
        .from('spot_submissions_raw')
        .insert(submissionRecord);
      
      if (auditError) {
        console.error(`[ERROR] Failed to insert Audit for ${venueName}:`, auditError.message);
      } else {
        console.log(`[SUCCESS] Inserted ${venueName}`);
      }

    } catch (e: any) {
      console.error(`[ERROR] Unexpected error processing ${venueName}:`, e.message);
    }
  }

  console.log('\nProcessing complete.');
  if (isDryRun) {
    console.log('Run with --execute to commit to database.');
  }
}

main().catch(console.error);

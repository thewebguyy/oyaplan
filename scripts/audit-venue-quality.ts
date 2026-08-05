import fs from 'fs';
import path from 'path';
import { calculateZoneFare } from '../lib/planning/transport';

const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
const seedSql = fs.readFileSync(seedPath, 'utf8');

interface SeedSpot {
  name: string;
  address: string;
  address_slug: string;
  area_id: string;
  vibe_tags: string[];
  price_per_person: number;
  category: string;
  subcategory: string;
  best_daypart: string;
  transport_matrix: Record<string, number>;
  coordinates?: { lat: number; lng: number };
}

function parseSeedSpots(sql: string): SeedSpot[] {
  const spots: SeedSpot[] = [];
  const lines = sql.split('\n');

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('(') && line.includes("', '")) {
      try {
        const rawContent = line.replace(/^\(/, '').replace(/\),?$/, '').replace(/;$/, '');
        // Split by pattern: single quote comma single quote or top-level comma
        const tokens: string[] = [];
        let curr = '';
        let inQ = false;
        let inB = false;

        for (let i = 0; i < rawContent.length; i++) {
          const c = rawContent[i];
          if (c === "'" && (i === 0 || rawContent[i - 1] !== '\\')) {
            inQ = !inQ;
            curr += c;
          } else if (c === '{' && !inQ) {
            inB = true;
            curr += c;
          } else if (c === '}' && !inQ) {
            inB = false;
            curr += c;
          } else if (c === ',' && !inQ && !inB) {
            tokens.push(curr.trim());
            curr = '';
          } else {
            curr += c;
          }
        }
        if (curr) tokens.push(curr.trim());

        const parts = tokens;

        if (parts.length >= 15) {
          const name = parts[0].replace(/^[\(']+/, '').replace(/['\)]+$/, '');
          const address = parts[1].replace(/^'/, '').replace(/'$/, '');
          const address_slug = parts[2].replace(/^'/, '').replace(/'$/, '');
          const area_id = parts[3].replace(/^'/, '').replace(/'$/, '');
          
          // Parse vibe_tags Postgres array: '{"Dinner", "Foodie", "Party"}'
          const rawVibes = parts[4].replace(/^'\{/, '').replace(/\}'$/, '').replace(/"/g, '');
          const vibe_tags = rawVibes.split(',').map(s => s.trim()).filter(Boolean);

          const price_per_person = parseInt(parts[5], 10) || 0;

          // Transport matrix: parts[8]
          let transport_matrix: Record<string, number> = {};
          if (parts[8]) {
            try {
              const rawMatrix = parts[8].replace(/::[a-z_]+/, '').replace(/^'/, '').replace(/'$/, '').replace(/\),?$/, '');
              transport_matrix = JSON.parse(rawMatrix);
            } catch {
              // fallback
            }
          }

          const category = parts[10] ? parts[10].replace(/'/g, '') : 'restaurant';
          const subcategory = parts[13] ? parts[13].replace(/'/g, '') : 'general';
          const best_daypart = parts[16] ? parts[16].replace(/'/g, '') : 'afternoon';

          let coordinates: { lat: number; lng: number } | undefined = undefined;
          if (parts[20]) {
            try {
              const cleanStr = parts[20].replace(/::jsonb.*/, '').replace(/^'/, '').replace(/'$/, '').trim();
              if (cleanStr.startsWith('{') && cleanStr.endsWith('}')) {
                coordinates = JSON.parse(cleanStr);
              }
            } catch { /* ignore */ }
          }

          let not_recommended_for: string[] = [];
          if (parts[21]) {
            const rawExcl = parts[21].replace(/::text\[\].*$/, '').replace(/^'\{/, '').replace(/\}'$/, '').replace(/"/g, '').replace(/\),?$/, '');
            not_recommended_for = rawExcl.split(',').map(s => s.trim()).filter(Boolean);
          }

          spots.push({
            name,
            address,
            address_slug,
            area_id,
            vibe_tags,
            price_per_person,
            category,
            subcategory,
            best_daypart,
            transport_matrix,
            coordinates,
          });
        }
      } catch (e) {
        // Line skip
      }
    }
  });

  return spots;
}

const spots = parseSeedSpots(seedSql);

console.log('========================================================================');
console.log(' OYAPLAN PRE-BETA RECOMMENDATION & TRANSPORT QUALITY AUDIT REPORT');
console.log(' Total Venues Audited from Seed Dataset:', spots.length);
console.log('========================================================================\n');

// ------------------------------------------------------------------------
// SECTION 1: TRANSPORT METADATA AUDIT
// ------------------------------------------------------------------------
console.log('--- SECTION 1: TRANSPORT METADATA AUDIT ---\n');

const missingMatrix: SeedSpot[] = [];
const defaultFallback: SeedSpot[] = [];
const missingCoords: SeedSpot[] = [];
const missingAreaMapping: SeedSpot[] = [];
const inaccurateEstimates: SeedSpot[] = [];

const KNOWN_AREAS = ['ikeja', 'gbagada', 'yaba', 'surulere', 'ogudu', 'agege', 'lekki-phase-1', 'vi', 'ikoyi', 'maryland', 'ebute-metta', 'apapa'];

spots.forEach((spot) => {
  const hasMatrix = spot.transport_matrix && Object.keys(spot.transport_matrix).length > 0;
  if (!hasMatrix) {
    missingMatrix.push(spot);
  } else {
    // Check if missing keys for any known active area
    const hasAllKeys = KNOWN_AREAS.every((a) => spot.transport_matrix[a] !== undefined);
    if (!hasAllKeys) {
      defaultFallback.push(spot);
    }
  }

  // Coordinates check
  if (!spot.coordinates) {
    missingCoords.push(spot);
  }

  // Area mapping check
  if (!spot.address_slug || !spot.area_id) {
    missingAreaMapping.push(spot);
  }

  // Check if destination area is unknown zone
  const calculatedFare = calculateZoneFare('yaba', spot.address_slug);
  if (calculatedFare <= 0) {
    inaccurateEstimates.push(spot);
  }
});

console.log(`1. Every Venue Missing Transport Metadata (transport_matrix): ${missingMatrix.length}`);
missingMatrix.forEach(s => console.log(`   - ${s.name} (${s.address_slug})`));

console.log(`\n2. Every Venue Using Default/Incomplete Zone Fallback Fares: ${defaultFallback.length}`);
defaultFallback.forEach(s => console.log(`   - ${s.name} (${s.address_slug}): Missing origins: ${KNOWN_AREAS.filter(a => spotMatrixMissing(s, a)).join(', ')}`));

function spotMatrixMissing(s: SeedSpot, a: string) {
  return !s.transport_matrix || s.transport_matrix[a] === undefined;
}

console.log(`\n3. Every Venue Missing Coordinates (lat/lng): ${missingCoords.length}`);
missingCoords.forEach(s => console.log(`   - ${s.name} (${s.address_slug})`));

console.log(`\n4. Every Venue Missing Area Mapping (area_id or address_slug): ${missingAreaMapping.length}`);
missingAreaMapping.forEach(s => console.log(`   - ${s.name} (${s.address_slug})`));

console.log(`\n5. Every Venue Whose Transport Estimate Cannot Currently Be Calculated Accurately: ${inaccurateEstimates.length}`);
inaccurateEstimates.forEach(s => console.log(`   - ${s.name} (${s.address_slug})`));

// ------------------------------------------------------------------------
// SECTION 2: RECOMMENDATION SUITABILITY AUDIT
// ------------------------------------------------------------------------
console.log('\n--- SECTION 2: RECOMMENDATION SUITABILITY AUDIT ---\n');

interface MismatchReport {
  venue: string;
  category: string;
  subcategory: string;
  pricePerPerson: number;
  currentTags: string[];
  incorrectExperiences: string[];
  recommendedSuitabilityTags: string[];
  recommendedExclusions: string[];
  rationale: string;
}

const mismatches: MismatchReport[] = [];

spots.forEach((spot) => {
  const incorrectExps: string[] = [];
  const recTags: string[] = [...spot.vibe_tags];
  const recExclusions: string[] = [];
  let rationale = '';

  // 1. Fast food / Local buka / Suya / Stadium appearing for Date Night / Fine Dining / Anniversary
  if (['fast-food', 'local-buka', 'street-food', 'arcade', 'cinema', 'activity-centre'].includes(spot.subcategory) || spot.price_per_person < 5000) {
    if (spot.vibe_tags.includes('Dinner')) {
      incorrectExps.push('Date Night (Chop Eye)', 'Anniversary Dinner');
      recExclusions.push('date_night', 'anniversary');
      rationale = `${spot.subcategory || spot.category} with ₦${spot.price_per_person.toLocaleString()} spend is not suitable for romantic date night / anniversary.`;
      const idx = recTags.indexOf('Dinner');
      if (idx > -1) recTags.splice(idx, 1);
      if (!recTags.includes('Quick')) recTags.push('Quick');
    }
  }

  // 2. Bars / Nightclubs / Lounges / Rooftops / Suya spots appearing for Remote Work / Study / Quiet Coffee
  if (['bar', 'entertainment', 'beach'].includes(spot.category) || ['lounge', 'rooftop', 'hotel-bar', 'street-food'].includes(spot.subcategory)) {
    if (spot.vibe_tags.includes('Chill') && spot.best_daypart === 'night') {
      incorrectExps.push('Remote Work', 'Study Session', 'Quiet Coffee Linkup');
      recExclusions.push('remote_work', 'study', 'quiet_meetings');
      rationale = `Nighttime ${spot.subcategory || spot.category} venue with high ambient music/crowd is not suitable for focus work or study.`;
    }
  }

  // 3. Pastry Cafes / Fast Casual appearing for Anniversary
  if (spot.category === 'cafe' && spot.price_per_person < 10000) {
    if (spot.vibe_tags.includes('Dinner')) {
      incorrectExps.push('Anniversary Fine Dining');
      recExclusions.push('anniversary');
      rationale = `Casual coffee shop with ₦${spot.price_per_person.toLocaleString()} spend is great for coffee dates, but not formal anniversary dinners.`;
    }
  }

  // 4. Non-Food spots (Parks / Activity / Cinema / Art Gallery) tagged as "Foodie"
  if (['nature', 'activity', 'entertainment', 'experience'].includes(spot.category) && spot.vibe_tags.includes('Foodie')) {
    incorrectExps.push('Foodie Feast / Serious Chop');
    recExclusions.push('foodie_feasts');
    rationale = `Venue is an ${spot.category} without primary food dining; should not appear in Foodie/Serious Chop searches.`;
    const idx = recTags.indexOf('Foodie');
    if (idx > -1) recTags.splice(idx, 1);
  }

  if (incorrectExps.length > 0) {
    mismatches.push({
      venue: spot.name,
      category: spot.category,
      subcategory: spot.subcategory,
      pricePerPerson: spot.price_per_person,
      currentTags: spot.vibe_tags,
      incorrectExperiences: Array.from(new Set(incorrectExps)),
      recommendedSuitabilityTags: Array.from(new Set(recTags)),
      recommendedExclusions: Array.from(new Set(recExclusions)),
      rationale,
    });
  }
});

console.log(`Found ${mismatches.length} venues with potential experience mismatch risk:\n`);

mismatches.forEach((m, i) => {
  console.log(`[${i + 1}] ${m.venue} (Category: ${m.category} | Subcategory: ${m.subcategory} | ₦${m.pricePerPerson.toLocaleString()}/person)`);
  console.log(`    Current Vibe Tags: [${m.currentTags.join(', ')}]`);
  console.log(`    ❌ Incorrect Experiences: [${m.incorrectExperiences.join(', ')}]`);
  console.log(`    ✅ Recommended Suitability Tags: [${m.recommendedSuitabilityTags.join(', ')}]`);
  console.log(`    ⚠️ Recommended Exclusions: [${m.recommendedExclusions.join(', ')}]`);
  console.log(`    📝 Rationale: ${m.rationale}\n`);
});

import fs from 'fs';
import path from 'path';
import { EXPERIENCES } from '../lib/constants/experiences';

const VERIFIED_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Yellow Chilli': { lat: 6.5925, lng: 3.3638 },
  'The Place Ikeja': { lat: 6.5941, lng: 3.3592 },
  'Ocean Basket Ikeja': { lat: 6.6175, lng: 3.3581 },
  'Shiro Lagos': { lat: 6.4253, lng: 3.4283 },
  'Hard Rock Cafe': { lat: 6.4250, lng: 3.4280 },
  'Lekki Conservation Centre': { lat: 6.4414, lng: 3.5358 },
  'Upbeat Centre': { lat: 6.4521, lng: 3.4725 },
  'Nike Art Gallery': { lat: 6.4378, lng: 3.4682 },
  'Genesis Cinemas Ikeja': { lat: 6.6175, lng: 3.3581 },
  'Landmark Beach': { lat: 6.4239, lng: 3.4272 },
  'Rufus & Bee': { lat: 6.4278, lng: 3.4475 },
  'Vestar Coffee': { lat: 6.4312, lng: 3.4215 },
  'JJT Park': { lat: 6.6212, lng: 3.3589 },
  'Kapadoccia VI': { lat: 6.4289, lng: 3.4234 },
  'Purple Bistro': { lat: 6.5175, lng: 3.3862 },
  'Unilag Lagoon Front': { lat: 6.5165, lng: 3.3985 },
  'Bature Brewery': { lat: 6.5098, lng: 3.3792 },
  'E-Center': { lat: 6.5085, lng: 3.3762 },
  'White House': { lat: 6.5072, lng: 3.3789 },
  'Leisure Mall': { lat: 6.4965, lng: 3.3542 },
  'Bukka Hut Surulere': { lat: 6.4965, lng: 3.3542 },
  'Zenith Water Margin': { lat: 6.4972, lng: 3.3551 },
  'Café Royale': { lat: 6.4925, lng: 3.3521 },
  'Kilo Hotel Bar': { lat: 6.4950, lng: 3.3530 },
  'KFC Gbagada': { lat: 6.5562, lng: 3.3892 },
  'Dejavu Rooftop': { lat: 6.5541, lng: 3.3875 },
  'Mega Chicken Gbagada': { lat: 6.5578, lng: 3.3912 },
  'Gbagada Park': { lat: 6.5532, lng: 3.3850 },
  'Buka Gbagada': { lat: 6.5545, lng: 3.3860 },
  'Agege Stadium': { lat: 6.6250, lng: 3.3250 },
  'Iya Eba': { lat: 6.6235, lng: 3.3241 },
  'Sweet Sensation Agege': { lat: 6.6240, lng: 3.3245 },
  'Pen Cinema': { lat: 6.6225, lng: 3.3235 },
  'Agege Suya Spot': { lat: 6.6260, lng: 3.3262 },
};

// Strict taxonomy exclusions only
const TAXONOMY_EXCLUSIONS: Record<string, string[]> = {
  'The Place Ikeja': [EXPERIENCES.ANNIVERSARY, EXPERIENCES.ROMANTIC_DINNER],
  'Sweet Sensation Agege': [EXPERIENCES.ANNIVERSARY, EXPERIENCES.ROMANTIC_DINNER],
  'Iya Eba': [EXPERIENCES.ANNIVERSARY, EXPERIENCES.ROMANTIC_DINNER],
  'Buka Gbagada': [EXPERIENCES.ANNIVERSARY, EXPERIENCES.ROMANTIC_DINNER],
  'Bature Brewery': [EXPERIENCES.REMOTE_WORK, EXPERIENCES.STUDY],
  'Kilo Hotel Bar': [EXPERIENCES.REMOTE_WORK, EXPERIENCES.STUDY],
  'Agege Stadium': [EXPERIENCES.ANNIVERSARY, EXPERIENCES.ROMANTIC_DINNER],
};

// Full origin fare completion map for mainland/central spots
const FULL_MATRIX_EXTENSIONS: Record<string, Record<string, number>> = {
  yaba: { ogudu: 3000, agege: 6500, maryland: 3500 },
  surulere: { ogudu: 4000, agege: 7000, maryland: 4500 },
  gbagada: { ogudu: 1500, agege: 5000, maryland: 2500 },
  agege: { ogudu: 5000, maryland: 3500 },
};

const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
let sql = fs.readFileSync(seedPath, 'utf8');

// Replace header column list
sql = sql.replace(
  `INSERT INTO spots (name, address, address_slug, area_id, vibe_tags, price_per_person, price_updated_at, price_source, transport_matrix, active, category, has_food, typical_duration_hours, subcategory, price_tier, crowd_type, best_daypart, trending_score, verified_by, zone) VALUES`,
  `INSERT INTO spots (name, address, address_slug, area_id, vibe_tags, price_per_person, price_updated_at, price_source, transport_matrix, active, category, has_food, typical_duration_hours, subcategory, price_tier, crowd_type, best_daypart, trending_score, verified_by, zone, coordinates, not_recommended_for) VALUES`
);

const lines = sql.split('\n');
const updatedLines = lines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("('") || !trimmed.includes("', '")) return line;

  const spotNameMatch = trimmed.match(/^\('([^']+)'/);
  if (!spotNameMatch) return line;

  const name = spotNameMatch[1];
  const coords = VERIFIED_COORDINATES[name] || { lat: 6.5244, lng: 3.3792 };
  const exclusions = TAXONOMY_EXCLUSIONS[name] || [];

  // Parse transport_matrix string inside line to inject missing origins
  let lineOut = line;
  const areaSlugMatch = line.match(/',\s*'([a-z0-9\-]+)'\s*,\s*'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/);
  const areaSlug = areaSlugMatch ? areaSlugMatch[1] : '';

  if (FULL_MATRIX_EXTENSIONS[areaSlug]) {
    const ext = FULL_MATRIX_EXTENSIONS[areaSlug];
    const matrixMatch = lineOut.match(/'(\{"[a-z0-9\-]+":\d+[^']*\})'/);
    if (matrixMatch) {
      try {
        const matrixObj = JSON.parse(matrixMatch[1]);
        Object.assign(matrixObj, ext);
        const newMatrixStr = `'${JSON.stringify(matrixObj)}'`;
        lineOut = lineOut.replace(matrixMatch[1], JSON.stringify(matrixObj));
      } catch { /* ignore */ }
    }
  }

  const coordsSql = `'{"lat":${coords.lat},"lng":${coords.lng}}'::jsonb`;
  const exclusionsSql = `'{"${exclusions.join('","')}"}'::text[]`;

  // Append new column values to the end of the row line before comma or semicolon
  const cleanLine = lineOut.trimEnd();
  if (cleanLine.endsWith('),')) {
    return cleanLine.slice(0, -2) + `, ${coordsSql}, ${exclusionsSql}),`;
  } else if (cleanLine.endsWith(');')) {
    return cleanLine.slice(0, -2) + `, ${coordsSql}, ${exclusionsSql});`;
  }

  return lineOut;
});

fs.writeFileSync(seedPath, updatedLines.join('\n'));
console.log('Successfully updated supabase/seed.sql with verified coordinates, complete origins, and strict taxonomy exclusions!');

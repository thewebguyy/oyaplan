import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditPriceProvenanceAndTransport() {
  console.log('=== DEEP PROVENANCE & TRANSPORT COVERAGE AUDIT ===\n');

  // 1. Fetch spots metadata
  const { data: spots, error } = await supabase
    .from('spots')
    .select('id, name, price_per_person, price_source, price_updated_at, verified_by, address_slug, area_id, areas(slug, name), transport_matrix');

  if (error || !spots) {
    console.error('Error fetching spots:', error);
    return;
  }

  console.log(`Total Audited Spots: ${spots.length}\n`);

  // 2. Price Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  const verifiedByBreakdown: Record<string, number> = {};
  let withPriceUpdatedAt = 0;
  let missingTransportMatrix = 0;
  let emptyTransportMatrix = 0;

  spots.forEach((spot) => {
    const source = spot.price_source || 'unspecified';
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;

    const verifier = spot.verified_by || 'unverified';
    verifiedByBreakdown[verifier] = (verifiedByBreakdown[verifier] || 0) + 1;

    if (spot.price_updated_at) {
      withPriceUpdatedAt++;
    }

    if (!spot.transport_matrix) {
      missingTransportMatrix++;
    } else if (typeof spot.transport_matrix === 'object' && Object.keys(spot.transport_matrix).length === 0) {
      emptyTransportMatrix++;
    }
  });

  console.log('1. PRICE SOURCE PROVENANCE BREAKDOWN:');
  Object.entries(sourceBreakdown).forEach(([source, count]) => {
    const percentage = ((count / spots.length) * 100).toFixed(1);
    console.log(`   - ${source}: ${count} spots (${percentage}%)`);
  });

  console.log('\n2. VERIFIED BY BREAKDOWN:');
  Object.entries(verifiedByBreakdown).forEach(([verifier, count]) => {
    const percentage = ((count / spots.length) * 100).toFixed(1);
    console.log(`   - ${verifier}: ${count} spots (${percentage}%)`);
  });

  console.log(`\n3. PRICE FRESHNESS (price_updated_at populated): ${withPriceUpdatedAt} / ${spots.length} (${((withPriceUpdatedAt / spots.length) * 100).toFixed(1)}%)`);

  console.log(`\n4. TRANSPORT COVERAGE (transport_matrix check):`);
  console.log(`   - Missing transport_matrix column: ${missingTransportMatrix}`);
  console.log(`   - Empty transport_matrix object: ${emptyTransportMatrix}`);
  console.log(`   - Spots with valid transport_matrix: ${spots.length - missingTransportMatrix - emptyTransportMatrix}`);
}

auditPriceProvenanceAndTransport().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== OYAPLAN DATABASE TRUST QUEUES AUDIT ===\n');

  // 1. Total active spots
  const { count: totalSpots } = await supabase
    .from('spots')
    .select('id', { count: 'exact', head: true });

  // 2. Spots missing price
  const { count: missingPricesCount } = await supabase
    .from('spots')
    .select('id', { count: 'exact', head: true })
    .or('price_per_person.is.null,price_per_person.eq.0');

  // 3. Spots missing hero image
  const { count: missingHeroesCount } = await supabase
    .from('spots')
    .select('id', { count: 'exact', head: true })
    .or('cover_url.is.null,cover_url.eq.""');

  // 4. Price evidence records
  const { count: priceEvidenceCount } = await supabase
    .from('price_evidence')
    .select('id', { count: 'exact', head: true });

  // 5. Pending submissions
  const { count: pendingSubmissionsCount } = await supabase
    .from('spot_submissions_raw')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 6. Actual spend reports
  const { count: actualSpendCount } = await supabase
    .from('actual_spend_reports')
    .select('id', { count: 'exact', head: true });

  console.log(`- Total Spots in Catalog: ${totalSpots || 0}`);
  console.log(`- Spots Missing Price: ${missingPricesCount || 0}`);
  console.log(`- Spots Missing Hero Image: ${missingHeroesCount || 0}`);
  console.log(`- Total Price Evidence Records: ${priceEvidenceCount || 0}`);
  console.log(`- Pending Spot Submissions: ${pendingSubmissionsCount || 0}`);
  console.log(`- Actual Spend Reports Received: ${actualSpendCount || 0}`);
}

runAudit().catch(console.error);

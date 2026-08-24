import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPlanRequestInsert() {
  console.log('=== TESTING PLAN_REQUESTS INSERT ===\n');

  const { data, error } = await supabase.from('plan_requests').insert({
    start_area: 'ikeja',
    squad_size: 2,
    budget: 50000,
    vibe: 'Dinner',
    results_count: 3,
    top_spot_id: null,
    user_id: null,
    session_id: null,
  }).select();

  console.log('Insert Result Data:', data);
  console.log('Insert Result Error:', error);
}

testPlanRequestInsert().catch(console.error);

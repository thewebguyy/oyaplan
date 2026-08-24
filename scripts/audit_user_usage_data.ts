import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditUsage() {
  console.log('=== USER USAGE & PLAN DATA AUDIT ===\n');

  // 1. Profiles
  const { data: profiles } = await supabase.from('profiles').select('id, display_name, created_at');
  console.log(`Total Profiles: ${profiles?.length || 0}`);

  // 2. Plan requests
  const { count: totalPlanRequests } = await supabase.from('plan_requests').select('id', { count: 'exact', head: true });
  const { count: anonPlanRequests } = await supabase.from('plan_requests').select('id', { count: 'exact', head: true }).is('user_id', null);
  const { data: userPlanRequests } = await supabase.from('plan_requests').select('id, user_id, created_at').not('user_id', 'is', null);

  console.log(`Total Plan Requests (plan_requests): ${totalPlanRequests || 0}`);
  console.log(`Anonymous Plan Requests (user_id IS NULL): ${anonPlanRequests || 0}`);
  console.log(`User Plan Requests (user_id IS NOT NULL): ${userPlanRequests?.length || 0}`);

  // 3. User Saved Plans
  const { data: savedPlans } = await supabase.from('user_saved_plans').select('id, user_id, saved_at');
  console.log(`Total Saved Plans (user_saved_plans): ${savedPlans?.length || 0}`);

  // 4. Shared Plans
  const { data: sharedPlans } = await supabase.from('shared_plans').select('id, user_id, session_id');
  console.log(`Total Shared Plans (shared_plans): ${sharedPlans?.length || 0}`);

  if (userPlanRequests && userPlanRequests.length > 0) {
    console.log('\nSample User Plan Requests:', userPlanRequests.slice(0, 5));
  }
  if (savedPlans && savedPlans.length > 0) {
    console.log('\nSample Saved Plans:', savedPlans.slice(0, 5));
  }
  if (sharedPlans && sharedPlans.length > 0) {
    console.log('\nSample Shared Plans:', sharedPlans.slice(0, 5));
  }
}

auditUsage().catch(console.error);

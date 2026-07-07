import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Public anon client — safe for both server and client bundles.
// Uses RLS for data security. All existing usages of this export are unaffected.
// flowType must be 'pkce': app/api/auth/callback/route.ts exchanges a `?code=`
// query param, but the implicit flow (the library default) returns tokens in the
// URL hash fragment instead, which the server route never sees.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce' },
});

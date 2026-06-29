import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Public anon client — safe for both server and client bundles.
// Uses RLS for data security. All existing usages of this export are unaffected.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

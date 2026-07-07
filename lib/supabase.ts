import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Public anon client — for server-side reads with no auth session (e.g. the
// venues API route, the OG image route). Uses RLS for data security.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser client for anything touching auth (sign-in, session state).
// Must be createBrowserClient (cookie-backed storage), not createClient
// (localStorage-backed): app/api/auth/callback/route.ts runs server-side and
// exchanges the PKCE `code` param via createServerClient, which reads the
// code_verifier from cookies. If the browser client stores that verifier in
// localStorage instead, the server can never see it and the exchange fails.
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);

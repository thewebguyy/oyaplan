import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// SSR-aware Supabase client — server-only.
// Reads and writes auth session cookies via Next.js headers().
// Import this in Server Components and Server Actions that need to check
// or act on the authenticated user (admin pages, operator portal, etc.).
// Never import this in Client Components or files bundled for the browser.
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll is called from Server Components during read-only render passes.
          // Middleware handles the actual cookie writes in those cases.
        }
      },
    },
  });
}

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { IdentityMergeService } from '@/lib/services/identity/identityMergeService';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  
  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    });

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // 1. Identity Merger: Transfer anonymous session data to the newly authenticated user.
      const sessionId = cookieStore.get('oya_session_id')?.value;
      if (sessionId) {
        await IdentityMergeService.mergeIdentity(data.user.id, sessionId);
      }

      // 2. Link Pending Saved Plan (if passed via query param)
      const pendingPlan = searchParams.get('save_plan');
      if (pendingPlan) {
        await IdentityMergeService.linkSavedPlan(data.user.id, pendingPlan);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}

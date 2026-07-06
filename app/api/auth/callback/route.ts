import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { IdentityMergeService } from '@/lib/services/identity/identityMergeService';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';
import { captureServerException } from '@/lib/sentry';

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
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    });

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('[AUTH CALLBACK ERROR]', error);
      captureServerException(error);
    }
    
    if (!error && data?.user) {
      // 1. Identity Merger: Transfer anonymous session data to the newly authenticated user.
      const sessionId = cookieStore.get('oya_session_id')?.value;
      if (sessionId) {
        await IdentityMergeService.mergeIdentity(data.user.id, sessionId);
      } else {
        // Happens when the magic link opens in a different cookie jar than the tab
        // that started the flow (e.g. an in-app browser) — pre-signin activity and
        // attribution for this user cannot be merged. Track it so we can measure
        // how often it happens instead of losing it silently.
        console.warn('[AUTH CALLBACK] No oya_session_id cookie present — identity merge skipped', {
          userId: data.user.id,
        });
        await AnalyticsService.track('identity_merge_skipped_no_session', {
          session_id: data.user.id,
          properties: {
            category: 'Operations',
            reason: 'oya_session_id_cookie_missing_at_callback',
            version: '1.0',
          },
        }, data.user.id);
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

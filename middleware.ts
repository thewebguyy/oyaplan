import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from './lib/rateLimit';

// Server Action POSTs carry this header (Next.js 16 internal constant).
// Named here so a future Next.js upgrade is one-line to track.
const NEXT_ACTION_HEADER = 'next-action';

// Only apply rate limiting to routes that accept anonymous writes.
// Forge GET is included because it triggers a plan_requests insert server-side.
function isRateLimitedRoute(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // Server Action POST (any route — identified by header, not path)
  if (method === 'POST' && request.headers.has(NEXT_ACTION_HEADER)) {
    return true;
  }

  // Forge GET triggers a server-side anonymous write (plan_requests)
  if (method === 'GET' && pathname === '/forge') {
    return true;
  }

  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function middleware(request: NextRequest) {
  // Rate limit check — runs before Supabase auth to avoid wasted round-trips on blocked requests.
  // Early 429 returns do not touch supabaseResponse, so cookie rotation is unaffected.
  if (isRateLimitedRoute(request)) {
    const ip = getClientIp(request);
    const { limited } = await checkRateLimit(ip);

    if (limited) {
      const isServerAction = request.headers.has(NEXT_ACTION_HEADER);

      if (isServerAction) {
        // Server Actions expect JSON — return a structured error the client can read
        return NextResponse.json(
          { error: 'rate_limited' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }

      // Forge GET — redirect to home with error flag for ErrorBanner
      return NextResponse.redirect(
        new URL('/?error=rate_limited', request.url),
        { status: 302 }
      );
    }
  }

  // Supabase session refresh — must run on every non-blocked request.
  // supabaseResponse must be returned unchanged so cookie rotation works.
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — do not remove this call.
  // It ensures the user session is kept alive and the cookie is rotated
  // before the Server Component renders.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next.js internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

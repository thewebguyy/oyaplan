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

function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botKeywords = [
    'whatsapp',
    'twitterbot',
    'facebookexternalhit',
    'slackbot',
    'telegrambot',
    'discordbot',
    'skypeuripreview',
    'googlebot',
    'bingbot',
  ];
  const uaLower = userAgent.toLowerCase();
  return botKeywords.some(keyword => uaLower.includes(keyword));
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function proxy(request: NextRequest) {
  // Rate limit check — runs before Supabase auth to avoid wasted round-trips on blocked requests.
  // Early 429 returns do not touch supabaseResponse, so cookie rotation is unaffected.
  if (isRateLimitedRoute(request)) {
    const userAgent = request.headers.get('user-agent');
    if (!isBotRequest(userAgent)) {
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
  await supabase.auth.getUser();

  // Phase 9: Growth Platform Deep Link Interception
  // Intercept /r/:code or /invite/:code, rewrite to home, and set cookie if needed
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/r/') || pathname.startsWith('/invite/')) {
    const code = pathname.split('/')[2];
    
    // Ensure an anonymous session cookie exists
    let sessionId = request.cookies.get('oya_session_id')?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      supabaseResponse.cookies.set('oya_session_id', sessionId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    }

    // Rewrite to home page silently, passing the ref code via query param for the client to parse
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = '/';
    rewriteUrl.searchParams.set('ref', code);
    
    // Maintain any existing UTMs
    request.nextUrl.searchParams.forEach((value, key) => {
      rewriteUrl.searchParams.set(key, value);
    });

    const finalResponse = NextResponse.rewrite(rewriteUrl);
    // Copy cookies from supabaseResponse to finalResponse
    supabaseResponse.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value, { ...cookie });
    });
    
    return finalResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next.js internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

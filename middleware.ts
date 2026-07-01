import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Simple in-memory rate limiter for MVP
// At scale (>10k req/hour), migrate to Vercel KV
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  priceSubmission: { max: 5, windowMs: 24 * 60 * 60 * 1000 },
  priceFlag: { max: 50, windowMs: 24 * 60 * 60 * 1000 },
  spotSuggestion: { max: 20, windowMs: 24 * 60 * 60 * 1000 },
  feedback: { max: 50, windowMs: 24 * 60 * 60 * 1000 },
  operatorInquiry: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
};

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function checkRateLimit(
  key: string,
  limit: { max: number; windowMs: number }
): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + limit.windowMs;
    rateLimitMap.set(key, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }

  if (entry.count < limit.max) {
    entry.count++;
    return { allowed: true, resetAt: entry.resetAt };
  }

  return { allowed: false, resetAt: entry.resetAt };
}

export async function middleware(request: NextRequest) {
  // Check rate limits on POST requests to anonymous write endpoints
  if (request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
    const pathname = request.nextUrl.pathname;

    let limitKey: string | null = null;
    let limit: { max: number; windowMs: number } | null = null;

    // Detect which endpoint and apply appropriate rate limit
    if (pathname.includes('submitPriceEvidence')) {
      limitKey = getRateLimitKey(ip, 'priceSubmission');
      limit = RATE_LIMITS.priceSubmission;
    } else if (pathname.includes('submitPriceFlag')) {
      limitKey = getRateLimitKey(ip, 'priceFlag');
      limit = RATE_LIMITS.priceFlag;
    } else if (pathname.includes('submitSpotSuggestion')) {
      limitKey = getRateLimitKey(ip, 'spotSuggestion');
      limit = RATE_LIMITS.spotSuggestion;
    } else if (pathname.includes('submitFeedback')) {
      limitKey = getRateLimitKey(ip, 'feedback');
      limit = RATE_LIMITS.feedback;
    } else if (pathname.includes('submitOperatorInquiry')) {
      limitKey = getRateLimitKey(ip, 'operatorInquiry');
      limit = RATE_LIMITS.operatorInquiry;
    }

    if (limitKey && limit) {
      const result = checkRateLimit(limitKey, limit);
      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            },
          }
        );
      }
    }
  }

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

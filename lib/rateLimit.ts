import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { captureServerException } from './sentry';

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
}

const MAX_REQUESTS = 60;
const WINDOW_STRING = '60 s';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW_STRING),
  analytics: false,
});

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // Fail-open ONLY in non-production or if completely misconfigured in non-prod.
  // In production, we fail-closed if Upstash credentials are missing or errors occur.
  const isProduction = process.env.NODE_ENV === 'production';

  if (!kvUrl || !kvToken) {
    if (!isProduction) {
      return { limited: false, remaining: -1 };
    } else {
      console.error('[RATE_LIMIT_FAIL_CLOSED] Missing KV credentials in production.');
      captureServerException(new Error('Missing KV credentials in production. Failing closed.'));
      return { limited: true, remaining: 0 };
    }
  }

  try {
    const { success, remaining } = await ratelimit.limit(`rl:${ip}`);
    
    return {
      limited: !success,
      remaining,
    };
  } catch (error) {
    captureServerException(error);
    if (isProduction) {
      console.error('[RATE_LIMIT_FAIL_CLOSED] Upstash error in production. Blocking request.');
      return { limited: true, remaining: 0 };
    }
    // Non-production: fail open so local dev isn't painful
    return { limited: false, remaining: -1 };
  }
}

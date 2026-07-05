import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import { captureServerException } from './sentry';

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
}

const MAX_REQUESTS = 10;
const WINDOW_STRING = '60 s';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW_STRING),
  analytics: false,
});

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  console.error('[RATE_LIMIT_DEBUG]', JSON.stringify({
    hasKvUrl: !!kvUrl,
    kvUrlLength: kvUrl?.length ?? 0,
    kvUrlStartsWithHttps: kvUrl?.startsWith('https://') ?? false,
    hasKvToken: !!kvToken,
    kvTokenLength: kvToken?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  }));

  // Fail-open ONLY in non-production or if completely misconfigured in non-prod.
  // In production, we fail-closed if Upstash credentials are missing or errors occur.
  const isProduction = process.env.NODE_ENV === 'production';

  if (!kvUrl || !kvToken) {
    if (!isProduction) {
      return { limited: false, remaining: -1 };
    } else {
      console.error('[RATE_LIMIT_FAIL_CLOSED] Missing KV credentials in production.');
      // Production without credentials is a severe configuration error.
      // Sentry would catch this if we capture it here.
      if (typeof captureServerException === 'function') {
        captureServerException(new Error('Missing KV credentials in production. Failing closed.'));
      }
      return { limited: true, remaining: 0 };
    }
  }

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(`rl:${ip}`);
    
    return {
      limited: !success,
      remaining,
    };
  } catch (error) {
    if (!isProduction) {
      console.log(`[RATE_LIMIT_FAIL_OPEN] Error executing rate limit: ${error}`);
      return { limited: false, remaining: -1 };
    } else {
      console.error('[RATE_LIMIT_FAIL_CLOSED] Rate limit exception in production.', error);
      if (typeof captureServerException === 'function') {
        captureServerException(error);
      }
      return { limited: true, remaining: 0 };
    }
  }
}

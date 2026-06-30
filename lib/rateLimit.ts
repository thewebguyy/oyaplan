import { kv } from '@vercel/kv';

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
}

const WINDOW_MS = 60_000; // 1-minute sliding window
const MAX_REQUESTS = 20;  // requests per window per IP

// Sliding window algorithm: two keys (current + previous window bucket).
// Effective count = prev_count × (1 - elapsed/window) + cur_count
// This smooths out burst spikes at window boundaries.
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    // Fail-open: local dev and CI have no KV configured
    return { limited: false, remaining: -1 };
  }

  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_MS);
  const elapsed = now - windowStart * WINDOW_MS;

  const curKey = `rl:${ip}:${windowStart}`;
  const prevKey = `rl:${ip}:${windowStart - 1}`;

  try {
    const [curRaw, prevRaw] = await Promise.all([
      kv.get<number>(curKey),
      kv.get<number>(prevKey),
    ]);

    const cur = curRaw ?? 0;
    const prev = prevRaw ?? 0;

    const effectiveCount = Math.floor(prev * (1 - elapsed / WINDOW_MS) + cur);

    if (effectiveCount >= MAX_REQUESTS) {
      return { limited: true, remaining: 0 };
    }

    // Increment current window counter; expire after 2 windows so prev key survives
    await kv.set(curKey, cur + 1, { px: WINDOW_MS * 2 });

    return { limited: false, remaining: MAX_REQUESTS - effectiveCount - 1 };
  } catch {
    // Fail-open: KV errors never block legitimate traffic
    return { limited: false, remaining: -1 };
  }
}

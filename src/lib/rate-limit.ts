// In-memory fallback for local development
const inMemoryMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries to prevent memory leak (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryMap.entries()) {
      if (now > entry.resetAt) {
        inMemoryMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

function inMemoryRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = inMemoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

// Try to use Redis if available (Upstash, etc.)
async function redisRateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; remaining: number }> {
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return inMemoryRateLimit(key, limit, windowMs);
    }

    // Use Upstash Redis via simple HTTP API (recommended for Vercel)
    const count = await fetch('https://api.upstash.com/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, Math.ceil(windowMs / 1000)],
        ['TTL', key],
      ]),
    }).then(r => r.json());

    const currentCount = count[0][1];
    const remaining = Math.max(0, limit - currentCount);
    const ok = currentCount <= limit;

    return { ok, remaining };
  } catch {
    // Fallback to in-memory if Redis fails
    console.warn('[Rate Limit] Redis failed, using in-memory fallback');
    return inMemoryRateLimit(key, limit, windowMs);
  }
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; remaining: number }> {
  // Use Redis in production, fallback to in-memory
  if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return redisRateLimit(key, limit, windowMs);
  }
  return inMemoryRateLimit(key, limit, windowMs);
}

export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')
    ?? 'unknown';
}

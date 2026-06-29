// Best-effort in-memory fixed-window rate limit, keyed by client IP. Caps how
// hard one client can drive the unfurl fetcher (it makes outbound requests on
// their behalf). In-memory means per-process: solid for the single dev server,
// approximate on Vercel where each warm instance keeps its own counter — enough
// to blunt abuse for a small shared tool, not a distributed quota.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; reset: number }>();

export interface RateResult {
  ok: boolean;
  retryAfter: number; // seconds until the window resets (0 when ok)
}

export function rateLimit(key: string, now: number): RateResult {
  // Opportunistic prune so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  entry.count++;
  return { ok: true, retryAfter: 0 };
}

// Pull the client IP from common proxy headers (Vercel sets x-forwarded-for),
// falling back to the socket address for local dev.
export function clientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}): string {
  const xff = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw) return raw.split(",")[0].trim();
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real;
  return req.socket?.remoteAddress || "unknown";
}

// Vercel serverless function: GET /api/unfurl?url=<page> → JSON UnfurlResult.
// Thin wrapper over the shared lib/unfurl module (same logic the Vite dev
// middleware runs locally). Typed against node:http to avoid a build-time
// dependency on @vercel/node — Vercel's Node runtime passes a compatible req/res.
import type { IncomingMessage, ServerResponse } from "node:http";
import { unfurl } from "../lib/unfurl.js";
import { clientIp, rateLimit } from "../lib/ratelimit.js";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.setHeader("content-type", "application/json");

  if (req.method && req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const limit = rateLimit(clientIp(req), Date.now());
  if (!limit.ok) {
    res.setHeader("retry-after", String(limit.retryAfter));
    res.statusCode = 429;
    res.end(JSON.stringify({ error: "Too many requests" }));
    return;
  }

  const url = new URL(req.url ?? "", "http://localhost").searchParams.get("url");
  if (!url) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Missing ?url=" }));
    return;
  }

  try {
    const result = await unfurl(url);
    // Cache aggressively at the edge: a link's OG data rarely changes.
    res.setHeader("cache-control", "public, max-age=3600, s-maxage=86400");
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = (err as { status?: number })?.status ?? 502;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unfurl failed" }));
  }
}

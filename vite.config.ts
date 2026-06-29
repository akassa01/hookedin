import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { unfurl } from "./lib/unfurl";
import { clientIp, rateLimit } from "./lib/ratelimit";

// Serve GET /api/unfurl locally (dev + `vite preview`), mirroring the Vercel
// function in api/unfurl.ts so the OpenGraph fetch — and its SSRF/rate-limit
// guards — behave the same without deploying.
function unfurlDev(): Plugin {
  const attach = (server: {
    middlewares: { use: (path: string, fn: (req: any, res: any) => void) => void };
  }) => {
    server.middlewares.use("/api/unfurl", async (req, res) => {
      res.setHeader("content-type", "application/json");

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
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = (err as { status?: number })?.status ?? 502;
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unfurl failed" }));
      }
    });
  };
  return {
    name: "hookedin-unfurl-dev",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig({
  plugins: [react(), unfurlDev()],
});

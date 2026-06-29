# hookedin — agent notes

A single-user tool to preview a LinkedIn post's **hook** (the 3 lines before "… more") in a
realistic feed. Vite + React + TypeScript. See `README.md` for usage.

## The one invariant

LinkedIn truncates to **exactly 3 lines (60px)**, governed only by the text container's
**width**. The engine (`src/measurer.ts` + `src/segments.ts`) reproduces LinkedIn's exact
text box and binary-searches the longest prefix that fits with "… more" measured inside it.
Don't switch to CSS `-webkit-line-clamp` — it can't displace the trailing word for "… more".

Behaviors the engine must keep (each has a Playwright check):
- Cut at **word boundaries**, never mid-word (a partial word is hidden, shown on expand).
- Preserve a **trailing newline** so a paragraph-break cut drops "… more" to its own line 3.
- **Mentions are weight 600** (wider) and measured as bold segments, so the cut stays correct.

## Calibrated constants (`src/constants.ts`) — re-verify, don't guess

Measured fullscreen Safari / MacBook Air (2026-06): text **526px**, card **552px**, font
14 / line-height 20 / clamp 3, `pre-wrap`, `word-break: break-word`, `hyphens: auto`. The
555px preset is the wider-monitor max-width. If you change a number, re-run the checks.

## Conventions

- **Identity** lives only in `PROFILE` (`src/profile.ts`) — the seed, then editable via the
  profile modal and persisted. Never hardcode the author elsewhere; filler authors are a
  separate static array in `src/data.ts`.
- **State** (profile, draft, posted) persists to `localStorage` key `hookedin.v1`
  (`src/storage.ts`). This and the profile UI were intentional additions past the original
  "no storage / no settings UI" build-plan scope — don't revert them.
- The tool's own chrome (tool strip, width controls) is kept visually distinct from the
  LinkedIn mock so it's obvious what's the tool vs. the preview.
- **Link unfurl**: attaching a link fetches its OpenGraph tags. The fetch+parse logic lives
  in `lib/unfurl.ts` (framework-free) and is served two ways from one module: a Vite
  dev-server middleware (`vite.config.ts`, also covers `vite preview`) and a Vercel function
  (`api/unfurl.ts`) for prod. The OG image is **inlined as a data URL** (not a proxy link) so
  an attached link survives in `localStorage` and renders offline — same contract as uploaded
  photos. `LinkCard` is a compact horizontal row (square thumbnail + title/domain), matching
  how LinkedIn renders article links — the OG image fills the left thumbnail when present.
  - The endpoint fetches user-supplied URLs, so it's an SSRF surface. `lib/unfurl.ts`'s
    `assertPublicUrl` enforces http(s)-only, ports 80/443 only, and rejects any hostname that
    resolves to a private/loopback/link-local/reserved IP (v4, v6, and IPv4-mapped) — and
    **re-validates every redirect hop** (redirects are followed manually). `lib/ratelimit.ts`
    adds a best-effort in-memory per-IP cap (30/min). Both guards are shared by the dev
    middleware and the Vercel function. Known residual: a narrow DNS-rebind TOCTOU window, and
    the rate limit is per-process (approximate on serverless).

## Build / verify

`npm run build` type-checks (strict, no unused). Behavior is verified by driving the running
app with Playwright against the build-plan acceptance criteria — layout/wrapping is a browser
concern, so prefer that over unit tests (jsdom has no layout).

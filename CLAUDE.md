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

## Build / verify

`npm run build` type-checks (strict, no unused). Behavior is verified by driving the running
app with Playwright against the build-plan acceptance criteria — layout/wrapping is a browser
concern, so prefer that over unit tests (jsdom has no layout).

# hookedin

Preview how a LinkedIn post's **hook** — the 3 lines shown before "… more" — looks in a
realistic scrolling feed, across screen widths, so you can judge it against the scroll
instead of in isolation. A single-user utility (it's always the same author — you).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Using it

- **Compose** screen: write/paste your draft, attach an image and/or a link-preview card,
  then **Preview in feed →**. On desktop a **live preview** card sits alongside the editor
  and re-cuts the hook as you type; its **Mobile / Desktop** toggle is a quick "does the hook
  survive on each?" check (exact widths and shells live in the full feed preview).
- **Preview** screen: your post sits in a LinkedIn-style feed (desktop 3-column or a mobile
  phone frame depending on the width preset). Use the width **presets** or drag the right
  edge of the feed to resize; the hook re-cuts live. **✎ Edit post** returns to compose.
- **@mentions**: type `@[Name]` (e.g. `@[The Home Depot]`) to render a bold-blue mention.
- **Edit profile**: set your name, headline, and photo. Saved to `localStorage`.

State (profile, draft, previewed post) persists across sessions via `localStorage`
(`hookedin.v1`). Large pasted images can hit the ~5MB quota; it then fails soft with a
console warning.

## How the truncation engine works

LinkedIn truncation is **always exactly 3 lines**, governed by one variable: the text
container's **width**. This tool reproduces LinkedIn's exact text box (width + font +
line-height from a live DOM dump — `src/constants.ts`) and lets the browser wrap text the
same way LinkedIn's does. Same box + same font + same text = same break.

`src/measurer.ts` + `src/segments.ts`:

- One hidden measurer styled to the exact spec. "… more" is measured **inside** the content,
  then a binary search finds the longest prefix that fits in 3 lines — so "… more" displaces
  the trailing word (native `-webkit-line-clamp` can't do this). Recomputed in a
  `useLayoutEffect` on every width/text change.
- **Word-boundary**: a partially-cut word is hidden entirely (and shown on expand), not split.
- **Trailing newline preserved**: a cut at a paragraph break drops "… more" onto line 3 on
  its own (the blank-line-3 case), matching LinkedIn.
- **Mention-aware**: mentions render weight 600 (wider), so the measurer counts them as bold
  segments — the cut stays correct for posts containing mentions.

## Calibrated numbers (re-verify periodically — LinkedIn changes them silently)

Measured fullscreen Safari on a MacBook Air (2026-06): text container **526px**, card
**552px** (12px padding + 1px border each side), font 14px / line-height 20px / 3-line clamp,
`white-space: pre-wrap`, `word-break: break-word`, `hyphens: auto` (confirmed active). The
desktop **555px** preset is the center-column max-width, only reached on a wider monitor.

**Caveat:** `system-ui` renders per-OS, so this faithfully reproduces Mac/desktop web — the
3-line *rule* is universal but the exact cut character is per-surface. The native iOS/Android
apps aren't CSS; mobile web at a matched width is a strong proxy, not pixel-identical.

## Deploying for someone else

Edit the one `PROFILE` object in `src/profile.ts` — it's the seed identity, passed in as a
prop and then editable via the profile UI. Nothing else needs to change.

## Verifying

`npm run dev`, then drive the running app with Playwright (see the build plan's acceptance
criteria): CSS fidelity, 526px desktop / 360 mobile widths, ≤60px collapsed height,
word-boundary truncation, line-3 "… more", bold-blue mentions, blank-line-eats-a-line,
compose↔preview modes, attachments, and profile persistence.

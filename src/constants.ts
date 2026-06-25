// ─── The five numbers that ARE the truth ───────────────────────────────────
// Snapshot of LinkedIn's collapsed-post text element, measured from the live
// DOM. Re-verify these every few months — LinkedIn changes them silently and
// the "truth" rots. (See CLAUDE.md "Caveats".)
//   DOM dump measured: 2026-06 (desktop web, macOS / Chrome).
//
// The post text element: height 60px, line-height 20px, -webkit-line-clamp 3.
// Three lines, then "…more". Governed by ONE variable: container width.
//
// Re-confirmed 2026-06 against the live text element, fullscreen Safari on a
// MacBook Air (M-series): font-size 14px, line-height 20px, weight 400,
// box-sizing border-box, padding 0, border 0, white-space-collapse preserve,
// word-break break-word — all exactly as below. The ONE correction from the
// original spec: the text container is 526px at this machine's fullscreen (the
// 555px figure is LinkedIn's center-column max-width, only reached on a wider
// external monitor). See PRESETS.

export const LINE_HEIGHT = 20; // px
export const MAX_LINES = 3;
export const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES; // 60px = the clamp boundary
export const FONT_SIZE = 14; // px
export const FONT_WEIGHT = 400;
export const MORE_FONT_WEIGHT = 400; // "…more" renders at body weight on desktop

// The exact font stack from the live DOM dump. `system-ui` renders per-OS
// (SF on macOS, Segoe UI on Windows): the 3-line RULE is universal, the exact
// character where it lands is per-surface. This faithfully reproduces Mac/web.
export const FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, ' +
  'Oxygen, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, ' +
  'sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const TEXT_COLOR = "rgba(0, 0, 0, 0.9)";
export const MORE_COLOR = "rgba(0, 0, 0, 0.6)";

// ─── Width = the whole UX ───────────────────────────────────────────────────
// The governed number is the TEXT CONTAINER width, not the card. The card
// chrome wraps around it. Measured: card border-box 552px, text 526px, 1px
// border each side → padding = (552 − 526 − 2) / 2 = 12px each side.
//   cardWidth = textWidth + 2×CARD_PADDING_X + 2×1px border.
export const CARD_PADDING_X = 12; // px each side (measured 2026-06)
export const CARD_BORDER = 1; // px each side

// Cards are box-sizing: border-box, so their `width` must include padding AND
// border for the inner text box to land at exactly textWidth. 526 → 552. ✓
export const cardWidthFor = (textWidth: number): number =>
  textWidth + 2 * CARD_PADDING_X + 2 * CARD_BORDER;

// The trusted desktop text-container width (measured fullscreen, see header).
// Single source for both the "desktop" preset and the match-window desktop cap,
// since LinkedIn's desktop column is near-fixed at this width.
export const DESKTOP_TEXT_WIDTH = 526;

export interface WidthPreset {
  id: string;
  label: string;
  width: number; // text-container width in px
  trusted: boolean; // true = measured at full window, no calibration caveat
}

export const PRESETS: WidthPreset[] = [
  // iPhone first — the hook lives or dies on mobile, so default here.
  // EFFECTIVE text-container width, not a literal CSS viewport. Calibrated
  // 2026-06 against a real 6.3" iPhone (16 Pro, LinkedIn iOS app, Dynamic Type
  // one notch below default). At 380 the engine reproduces the device's wrap
  // word-for-word on two independent posts (a budget post cutting at
  // "specifically", and a funding post matching all four lines), so it nails
  // both the hook cut and per-line breaks. Still `trusted: false` — a model fold
  // (font held at 14px, only width varies), not a DOM dump like the desktop
  // presets. The card may *look* wider than a phone on a low-density monitor;
  // that's a display-density artifact (the same CSS px spread over more physical
  // inches than a 3× phone) and does not affect the computed cut. Re-calibrate
  // if LinkedIn changes mobile rendering.
  { id: "ip-portrait", label: "iPhone — portrait", width: 380, trusted: false },
  // Measured at fullscreen Safari on the Mac Air — this is the desktop reality.
  { id: "desktop", label: "Desktop — Mac fullscreen", width: DESKTOP_TEXT_WIDTH, trusted: true },
];

export const DEFAULT_PRESET_ID = "ip-portrait";

// Drag handle range for the text-container width. Floor = a narrow phone,
// ceiling = a hair past the widest preset. Every value between is a real state.
export const MIN_TEXT_WIDTH = 280;
export const MAX_TEXT_WIDTH = 800;

// Below this text width the mock collapses to the phone frame (LinkedIn drops
// its sidebars + desktop nav); at or above it we render the 3-column desktop
// shell. App reads this to pick the layout (`isDesktop`).
export const SIDEBAR_MIN_WIDTH = 480;

// Card chrome around the text box: padding + border on each side. The text
// container is this much narrower than the card border-box.
export const CARD_CHROME = 2 * CARD_PADDING_X + 2 * CARD_BORDER; // 26px

// ─── Desktop 3-column page shell — ONE source of truth, shared with CSS ──────
// These mirror LinkedIn's desktop feed shell. They feed two consumers that must
// never disagree:
//   1. windowToTextWidth() below — to size the match-window center column to the
//      room it actually has, so it can't overflow the viewport.
//   2. styles.css — via the CSS custom properties in LAYOUT_CSS_VARS (App sets
//      them on :root). Change a number here and both the math and the rendered
//      layout move together; nothing to keep in sync by hand.
// LinkedIn's feed CONTENT area: rails + gaps + center column, all inside 1128.
// 225 + 24 + 555 + 24 + 300 = 1128. The page gutters sit OUTSIDE this (so the
// page's max-width is content + gutters), which is the bit we got wrong before:
// folding the gutters inside 1128 squeezed the center column ~32px too narrow.
export const LI_FEED_MAX = 1128; // .li-page / .li-nav-inner CONTENT width
export const LI_PAGE_PADDING_X = 16; // gutter each side, OUTSIDE the feed content
export const LI_COL_GAP = 24; // .li-page flex gap between columns
export const LI_LEFT_WIDTH = 225; // .li-left
export const LI_RIGHT_WIDTH = 300; // .li-right

// Outer max-width of the page/nav shell = content area + the two gutters.
export const LI_PAGE_MAX = LI_FEED_MAX + 2 * LI_PAGE_PADDING_X; // 1160

// Horizontal space the gutters + sidebars + gaps take from the row; the center
// column gets whatever is left (within LI_PAGE_MAX). At full width that leaves
// 1160 − 605 = 555 — LinkedIn's center-column max — for card + text.
export const DESKTOP_SIDE_CHROME =
  2 * LI_PAGE_PADDING_X + 2 * LI_COL_GAP + LI_LEFT_WIDTH + LI_RIGHT_WIDTH; // 605

// The bridge to styles.css: the var names it reads. App applies these to :root.
export const LAYOUT_CSS_VARS: Record<string, string> = {
  "--li-page-max": `${LI_PAGE_MAX}px`,
  "--li-page-pad-x": `${LI_PAGE_PADDING_X}px`,
  "--li-col-gap": `${LI_COL_GAP}px`,
  "--li-left-width": `${LI_LEFT_WIDTH}px`,
  "--li-right-width": `${LI_RIGHT_WIDTH}px`,
};

// ─── "Match my window" mapping ──────────────────────────────────────────────
// Translate the live browser window width into the text-container width the
// preview would render right now — matching the layout it actually draws, so the
// previewed column never spills past the viewport AND the cut lands where it
// really does.
//   • Desktop 3-column: the center column gets the row space left after the
//     gutters/sidebars/gaps (DESKTOP_SIDE_CHROME) within LI_PAGE_MAX — at full
//     width that's the 555px center column → 526px text. LinkedIn's desktop
//     column is near-fixed, so we cap at the trusted DESKTOP_TEXT_WIDTH (the same
//     number the "desktop" preset uses); it only narrows once the window is small
//     enough to genuinely squeeze the column.
//   • Narrow / single-column: the phone frame is full-bleed, so the text box is
//     just window − card chrome. Kept under SIDEBAR_MIN_WIDTH so it stays in the
//     mobile regime and doesn't fight the layout over which shell renders.
export const windowToTextWidth = (windowWidth: number): number => {
  const centerCol = Math.min(windowWidth, LI_PAGE_MAX) - DESKTOP_SIDE_CHROME;
  const desktopText = Math.min(DESKTOP_TEXT_WIDTH, centerCol - CARD_CHROME);
  if (desktopText >= SIDEBAR_MIN_WIDTH) {
    return desktopText;
  }
  // Mobile / single-column: full-bleed phone, held under the desktop breakpoint.
  const mobileText = windowWidth - CARD_CHROME;
  return Math.max(MIN_TEXT_WIDTH, Math.min(SIDEBAR_MIN_WIDTH - 1, mobileText));
};

export const MAX_POST_CHARS = 3000;

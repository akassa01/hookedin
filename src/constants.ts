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
export const MORE_FONT_WEIGHT = 600; // LinkedIn renders "more" heavier → wider

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

export interface WidthPreset {
  id: string;
  label: string;
  width: number; // text-container width in px
  trusted: boolean; // true = measured at full window, no calibration caveat
}

export const PRESETS: WidthPreset[] = [
  // iPhone first — the hook lives or dies on mobile, so default here.
  { id: "ip-portrait", label: "iPhone — portrait", width: 360, trusted: false },
  // Measured at fullscreen Safari on the Mac Air — this is the desktop reality.
  { id: "desktop", label: "Desktop — Mac fullscreen", width: 526, trusted: true },
  // The center-column max-width cap; only reached on a wider external monitor.
  { id: "desktop-wide", label: "Desktop — wide monitor (max)", width: 555, trusted: true },
];

export const DEFAULT_PRESET_ID = "ip-portrait";

// Drag handle range for the text-container width. Floor = a narrow phone,
// ceiling = a hair past the widest preset. Every value between is a real state.
export const MIN_TEXT_WIDTH = 280;
export const MAX_TEXT_WIDTH = 800;

export const MAX_POST_CHARS = 3000;

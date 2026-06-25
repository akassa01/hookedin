// The core engine: JS-measured truncation. We deliberately do NOT use CSS
// `-webkit-line-clamp` (even though LinkedIn's own element does), because of the
// hardest requirement: when the hook runs to the limit, "… more" must occupy the
// END of line 3 and DISPLACE whatever word would otherwise sit there. Native
// line-clamp only appends a bare "…" with no room for a "more" label.
//
// The fix: include "… more" INSIDE the measurement, then binary-search the
// longest prefix that still fits in 3 lines. The post is measured as SEGMENTS
// (plain runs + bold @mention runs), because mentions render at weight 600 and
// are wider — measuring them as plain text would land the cut a char or two off.
//
// ONE hidden measurer element, reused for every measurement (module singleton),
// styled with the EXACT CSS spec from the live DOM dump.

import {
  FONT_STACK,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  MAX_HEIGHT,
  MORE_FONT_WEIGHT,
} from "./constants";
import {
  type Segment,
  displayLength,
  sliceSegments,
  trimTrailingInline,
  snapToWordBoundary,
} from "./segments";

export interface HookResult {
  visibleSegments: Segment[]; // the text shown before the cut, as segments
  truncated: boolean; // whether "… more" should be rendered
}

const MENTION_WEIGHT = 600; // mentions render bold-blue → measure wider

let measurer: HTMLDivElement | null = null;
let ellipsisNode: Text | null = null; // "… " at normal weight (with trailing space)
let moreSpan: HTMLSpanElement | null = null; // "more" at weight 600

function ensureMeasurer(): void {
  if (measurer) return;

  measurer = document.createElement("div");
  measurer.setAttribute("aria-hidden", "true");
  measurer.lang = "en"; // hyphens: auto is language-aware (confirmed active on LinkedIn)
  Object.assign(measurer.style, {
    position: "absolute",
    left: "-99999px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    boxSizing: "content-box", // no padding/border → scrollHeight == text height
    padding: "0",
    margin: "0",
    border: "0",
    fontFamily: FONT_STACK,
    fontSize: `${FONT_SIZE}px`,
    lineHeight: `${LINE_HEIGHT}px`,
    fontWeight: String(FONT_WEIGHT),
    whiteSpace: "pre-wrap", // newlines are REAL and count toward the 3 lines
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    hyphens: "auto",
  } as CSSStyleDeclaration);

  ellipsisNode = document.createTextNode("");
  moreSpan = document.createElement("span");
  moreSpan.style.fontWeight = String(MORE_FONT_WEIGHT);

  // Prefix nodes are inserted BEFORE ellipsisNode; these two always trail.
  measurer.appendChild(ellipsisNode);
  measurer.appendChild(moreSpan);
  document.body.appendChild(measurer);
}

function setMore(on: boolean): void {
  // "… more" — ellipsis + space (normal weight) then "more" (weight 600).
  ellipsisNode!.textContent = on ? "… " : "";
  moreSpan!.textContent = on ? "more" : "";
}

// Rebuild the measured prefix: remove old prefix nodes, then emit a text node
// per plain run and a weight-600 span per mention run.
function setPrefix(segs: Segment[]): void {
  while (measurer!.firstChild && measurer!.firstChild !== ellipsisNode) {
    measurer!.removeChild(measurer!.firstChild);
  }
  for (const s of segs) {
    let node: Node;
    if (s.mention) {
      const span = document.createElement("span");
      span.style.fontWeight = String(MENTION_WEIGHT);
      span.textContent = s.text;
      node = span;
    } else {
      node = document.createTextNode(s.text);
    }
    measurer!.insertBefore(node, ellipsisNode);
  }
}

/**
 * Compute how a post's segments collapse to 3 lines at a given text-container
 * width, with a displacing "… more". Synchronous and cheap, so it's safe to call
 * for every post in a `useLayoutEffect`.
 */
export function computeHook(segments: Segment[], width: number): HookResult {
  ensureMeasurer();
  measurer!.style.width = `${width}px`;

  // Fast path: the whole post fits in ≤3 lines → no truncation, no "more".
  setMore(false);
  setPrefix(segments);
  if (measurer!.scrollHeight <= MAX_HEIGHT) {
    return { visibleSegments: segments, truncated: false };
  }

  // Binary search the longest prefix where prefix + "… more" fits in 3 lines.
  setMore(true);
  const total = displayLength(segments);
  let lo = 0;
  let hi = total;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    setPrefix(trimTrailingInline(sliceSegments(segments, mid)));
    if (measurer!.scrollHeight <= MAX_HEIGHT) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Snap the cut back to the last whole-word boundary — LinkedIn hides a
  // partially-cut word rather than splitting it.
  const wordCut = snapToWordBoundary(segments, best);
  return {
    visibleSegments: trimTrailingInline(sliceSegments(segments, wordCut)),
    truncated: true,
  };
}

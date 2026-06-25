// A post is a sequence of segments: plain runs and @mention runs. Mentions
// render bold-blue AND measure wider (weight 600), so the truncation engine must
// see them as segments, not flat text — otherwise the cut is off for any post
// containing a mention. (This is also part of why real LinkedIn wraps a hair
// earlier than a naive plain-text measure: bold mentions widen the line.)

export interface Segment {
  text: string; // the DISPLAYED text (no markup)
  mention: boolean;
}

// Composer syntax: @[Name] → a mention. The brackets delimit multi-word names
// ("@[The Home Depot]") and are stripped from the displayed text.
const AT_MARKUP = /@\[([^\]]+)\]/g;

export function parseMentions(raw: string): Segment[] {
  const segs: Segment[] = [];
  let last = 0;
  for (const m of raw.matchAll(AT_MARKUP)) {
    const i = m.index ?? 0;
    if (i > last) segs.push({ text: raw.slice(last, i), mention: false });
    segs.push({ text: m[1], mention: true });
    last = i + m[0].length;
  }
  if (last < raw.length) segs.push({ text: raw.slice(last), mention: false });
  return segs.length ? segs : [{ text: raw, mention: false }];
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Filler posts carry a `links: string[]` array instead of markup — split the
// text on those substrings and mark them as mentions.
export function segmentsFromLinks(text: string, links?: string[]): Segment[] {
  if (!links || links.length === 0) return [{ text, mention: false }];
  const ordered = links.slice().sort((a, b) => b.length - a.length); // longest first
  const re = new RegExp(`(${ordered.map(esc).join("|")})`, "g");
  return text
    .split(re)
    .filter((p) => p !== "")
    .map((p) => ({ text: p, mention: links.includes(p) }));
}

export const displayLength = (segs: Segment[]): number =>
  segs.reduce((n, s) => n + s.text.length, 0);

export const displayText = (segs: Segment[]): string =>
  segs.map((s) => s.text).join("");

// LinkedIn truncates at WORD boundaries, not mid-word: a word that's only
// partially cut off is hidden entirely (and shown on expand). Given the max
// character cut that fits, snap it back to the last whole-word boundary — and
// never split a mention (an entity is atomic; hide the whole thing).
export function snapToWordBoundary(
  segs: Segment[],
  cut: number
): number {
  const display = displayText(segs);
  if (cut >= display.length || cut <= 0) return cut;
  const isWs = (c: string | undefined) => c !== undefined && /\s/u.test(c);

  // 1) never split a mention → snap to its start
  let off = 0;
  for (const s of segs) {
    const start = off;
    const end = off + s.text.length;
    if (s.mention && cut > start && cut < end) return start;
    off = end;
  }

  // 2) never split a plain word → back off to the last whitespace
  if (!isWs(display[cut]) && !isWs(display[cut - 1])) {
    let i = cut - 1;
    while (i >= 0 && !isWs(display[i])) i--;
    return i + 1;
  }
  return cut;
}

// First `k` displayed characters, as segments (preserving mention boundaries).
export function sliceSegments(segs: Segment[], k: number): Segment[] {
  const out: Segment[] = [];
  let rem = k;
  for (const s of segs) {
    if (rem <= 0) break;
    if (s.text.length <= rem) {
      out.push(s);
      rem -= s.text.length;
    } else {
      out.push({ text: s.text.slice(0, rem), mention: s.mention });
      rem = 0;
    }
  }
  return out;
}

// Trim trailing spaces/tabs (NOT newlines) from the end of the segment list, so
// "… more" sits flush after the last word but a paragraph-break newline is kept.
export function trimTrailingInline(segs: Segment[]): Segment[] {
  const out = segs.map((s) => ({ ...s }));
  while (out.length) {
    const last = out[out.length - 1];
    last.text = last.text.replace(/[ \t]+$/u, "");
    if (last.text === "") out.pop();
    else break;
  }
  return out;
}

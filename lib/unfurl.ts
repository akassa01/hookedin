// Server-side OpenGraph "unfurl": fetch a URL, parse its OG/Twitter/meta tags,
// and inline the preview image as a data URL. Framework-free so the same code
// backs both the Vite dev middleware (local) and the Vercel function (prod).
//
// The image is returned inlined (not a proxy URL) so the attached link survives
// in localStorage and renders without the server running — same contract as the
// uploaded-photo path (readImageFile).
//
// Security: this endpoint fetches attacker-controlled URLs, so it is the classic
// SSRF surface. Guards (assertPublicUrl): http(s) only, ports 80/443 only, and
// every hop's resolved IP must be public — redirects are followed manually so a
// public host can't 302 to 169.254.169.254 (cloud metadata) or a LAN address.
// Residual: a narrow DNS-rebind TOCTOU window between resolve and connect is not
// closed (would need a pinned-IP dispatcher); acceptable for this tool.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class UnfurlError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "UnfurlError";
    this.status = status;
  }
}

export interface UnfurlResult {
  url: string;
  title: string;
  description?: string;
  imageDataUrl?: string;
  domain: string;
}

const UA =
  "Mozilla/5.0 (compatible; hookedin-unfurl/1.0; +https://github.com/akassa01/hookedin)";
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGE_BYTES = 5_000_000;
const MAX_REDIRECTS = 5;
const ALLOWED_PORTS = new Set(["", "80", "443"]);

export async function unfurl(rawUrl: string): Promise<UnfurlResult> {
  const target = normalizeUrl(rawUrl);
  const domain = hostnameOf(target);

  const { url: finalUrl, html } = await fetchText(target);
  const meta = parseMeta(html);

  const title =
    meta["og:title"] || meta["twitter:title"] || meta["__title"] || domain;
  const description =
    meta["og:description"] || meta["twitter:description"] || meta["description"];
  const siteName = meta["og:site_name"];

  const rawImage =
    meta["og:image:secure_url"] ||
    meta["og:image"] ||
    meta["og:image:url"] ||
    meta["twitter:image"] ||
    meta["twitter:image:src"];

  let imageDataUrl: string | undefined;
  if (rawImage) {
    try {
      // Resolve relative image URLs against the final (post-redirect) page URL.
      imageDataUrl = await fetchImageAsDataUrl(new URL(rawImage, finalUrl).toString());
    } catch {
      // A missing/oversized/blocked image is non-fatal — use the compact card.
      imageDataUrl = undefined;
    }
  }

  return {
    url: finalUrl,
    title,
    description: description || undefined,
    imageDataUrl,
    domain: siteName || domain,
  };
}

// ─── URL helpers ───────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.length > 2048) throw new UnfurlError("Invalid URL", 400);
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    throw new UnfurlError("Invalid URL", 400);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new UnfurlError("Only http(s) URLs can be unfurled", 400);
  }
  return u.toString();
}

function hostnameOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

// ─── SSRF guard ─────────────────────────────────────────────────────────────

// Reject before connecting: non-http(s), odd ports, and any hostname that
// resolves (or literally is) a private / loopback / link-local / reserved IP.
async function assertPublicUrl(rawUrl: string): Promise<void> {
  const u = new URL(rawUrl);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new UnfurlError("Only http(s) URLs can be unfurled", 400);
  }
  if (!ALLOWED_PORTS.has(u.port)) {
    throw new UnfurlError("Refusing to fetch a non-standard port", 403);
  }

  const host = u.hostname.replace(/^\[|\]$/g, ""); // unwrap IPv6 literals
  let addresses: string[];
  if (isIP(host)) {
    addresses = [host];
  } else {
    let resolved: { address: string }[];
    try {
      resolved = await lookup(host, { all: true });
    } catch {
      throw new UnfurlError("Could not resolve host", 502);
    }
    addresses = resolved.map((r) => r.address);
    if (addresses.length === 0) throw new UnfurlError("Could not resolve host", 502);
  }

  for (const ip of addresses) {
    if (isPrivateIp(ip)) {
      throw new UnfurlError("Refusing to fetch a private or reserved address", 403);
    }
  }
}

function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isPrivateV4(ip);
  if (v === 6) return isPrivateV6(ip);
  return true; // unparseable → treat as unsafe
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return -1;
  }
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function inRange(ip: number, base: string, bits: number): boolean {
  const b = ipv4ToInt(base);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ip & mask) === (b & mask);
}

function isPrivateV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n < 0) return true;
  const blocks: [string, number][] = [
    ["0.0.0.0", 8], // "this" network
    ["10.0.0.0", 8], // private
    ["100.64.0.0", 10], // CGNAT
    ["127.0.0.0", 8], // loopback
    ["169.254.0.0", 16], // link-local (incl. 169.254.169.254 metadata)
    ["172.16.0.0", 12], // private
    ["192.0.0.0", 24], // IETF protocol assignments
    ["192.168.0.0", 16], // private
    ["198.18.0.0", 15], // benchmarking
    ["224.0.0.0", 4], // multicast
    ["240.0.0.0", 4], // reserved
    ["255.255.255.255", 32], // broadcast
  ];
  return blocks.some(([base, bits]) => inRange(n, base, bits));
}

function isPrivateV6(ip: string): boolean {
  const a = ip.toLowerCase();
  // IPv4-mapped (::ffff:1.2.3.4, or its normalized hex form ::ffff:7f00:1) —
  // defer to the v4 rules so mapped loopback/metadata can't slip through.
  if (a.startsWith("::ffff:")) {
    const rest = a.slice(7);
    const v4 = rest.includes(".") ? rest : hexGroupsToV4(rest);
    if (v4) return isPrivateV4(v4);
  }
  if (a === "::1" || a === "::") return true; // loopback / unspecified
  const head = a.split(":")[0];
  if (/^f[cd]/.test(head)) return true; // fc00::/7 unique-local
  if (/^fe[89ab]/.test(head)) return true; // fe80::/10 link-local
  if (/^ff/.test(head)) return true; // ff00::/8 multicast
  return false;
}

// Two 16-bit hex groups ("7f00:1") → dotted IPv4 ("127.0.0.1"), for the
// normalized IPv4-mapped IPv6 form.
function hexGroupsToV4(s: string): string | null {
  const groups = s.split(":");
  if (groups.length !== 2) return null;
  const hi = parseInt(groups[0], 16);
  const lo = parseInt(groups[1], 16);
  if (Number.isNaN(hi) || Number.isNaN(lo)) return null;
  return [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join(".");
}

// ─── Network (manual redirects, every hop validated) ────────────────────────

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  let current = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicUrl(current);
    const res = await timedFetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel().catch(() => {});
      if (!location) return res;
      current = new URL(location, current).toString();
      continue;
    }
    return res;
  }
  throw new UnfurlError("Too many redirects", 502);
}

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof UnfurlError) throw err;
    throw new UnfurlError("Fetch failed", 502);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string): Promise<{ url: string; html: string }> {
  const res = await safeFetch(url, { headers: { "user-agent": UA, accept: "text/html,*/*" } });
  if (!res.ok) throw new UnfurlError(`Fetch failed (${res.status})`, 502);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf).subarray(0, MAX_HTML_BYTES);
  return { url: res.url || url, html: new TextDecoder("utf-8").decode(bytes) };
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await safeFetch(url, { headers: { "user-agent": UA, accept: "image/*" } });
  if (!res.ok) throw new UnfurlError(`Image fetch failed (${res.status})`, 502);
  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  if (!type.startsWith("image/")) throw new UnfurlError("Not an image", 415);
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > MAX_IMAGE_BYTES) throw new UnfurlError("Image too large", 413);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_IMAGE_BYTES) throw new UnfurlError("Image too large", 413);
  const base64 = Buffer.from(buf).toString("base64");
  return `data:${type};base64,${base64}`;
}

// ─── HTML meta parsing (no DOM) ─────────────────────────────────────────────

function parseMeta(html: string): Record<string, string> {
  // Only the <head> matters and avoids scanning huge bodies; fall back to all.
  const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? html;
  const out: Record<string, string> = {};

  const metaRe = /<meta\s+([^>]*?)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(head))) {
    const attrs = parseAttrs(m[1]);
    const key = (attrs.property || attrs.name)?.toLowerCase();
    if (key && attrs.content != null && !(key in out)) {
      out[key] = decodeEntities(attrs.content);
    }
  }

  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  if (title) out.__title = decodeEntities(title[1].trim());

  return out;
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const attrRe = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(s))) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  nbsp: " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

import type { LinkPreview } from "./types";

// Read a user-selected image file as a data URL (so it persists in localStorage
// and renders without a server).
export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const out = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return out.toUpperCase() || "?";
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || url;
  }
}

// Fetch OpenGraph metadata for a URL via the unfurl endpoint (Vite dev
// middleware locally, Vercel function in prod). Throws with a usable message so
// the compose form can fall back to a bare card.
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const res = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`);
  const data = (await res.json().catch(() => null)) as
    | (LinkPreview & { error?: string })
    | null;
  if (!res.ok || !data) {
    throw new Error(data?.error || `Couldn't fetch preview (${res.status})`);
  }
  return {
    url: data.url || url,
    title: data.title || domainOf(url),
    description: data.description,
    domain: data.domain,
    imageDataUrl: data.imageDataUrl,
  };
}

// A link-preview "unfurl" card attached to a post. Populated from OpenGraph tags
// (via /api/unfurl) — the image is inlined as a data URL so it persists offline.
export interface LinkPreview {
  url: string;
  title: string;
  description?: string; // og:description (kept for fidelity; not shown in the feed card)
  domain?: string; // og:site_name, else the hostname
  imageDataUrl?: string; // og:image, inlined; present → rich large-image card
}

// The full composed post: text + optional image + optional link preview. This is
// what's edited in compose, previewed in the feed, and persisted to localStorage.
export interface PostDraft {
  text: string;
  imageDataUrl?: string;
  link?: LinkPreview;
}

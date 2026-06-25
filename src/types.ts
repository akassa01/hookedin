// A link-preview "unfurl" card attached to a post (the Apple/Notion-style card).
export interface LinkPreview {
  url: string;
  title: string;
  imageDataUrl?: string; // optional thumbnail
}

// The full composed post: text + optional image + optional link preview. This is
// what's edited in compose, previewed in the feed, and persisted to localStorage.
export interface PostDraft {
  text: string;
  imageDataUrl?: string;
  link?: LinkPreview;
}

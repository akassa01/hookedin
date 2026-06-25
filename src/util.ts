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

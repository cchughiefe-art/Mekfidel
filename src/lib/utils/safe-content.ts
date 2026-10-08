/** Only navigation protocols that cannot execute browser code. */
export function safeUrl(value: unknown, fallback = "#"): string {
  if (typeof value !== "string") return fallback;
  const url = value.trim();
  if (!url || /[\u0000-\u0020\\]/.test(url)) return fallback;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (url.startsWith("#")) return url;
  try {
    const parsed = new URL(url);
    return ["https:", "http:", "tel:", "mailto:"].includes(parsed.protocol)
      ? url
      : fallback;
  } catch {
    return fallback;
  }
}

/** Accept legacy iframe markup, but construct our own iframe from its safe URL. */
export function googleMapsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim().startsWith("<")
    ? value.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
    : value.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate.replace(/&amp;/g, "&"));
    return url.protocol === "https:" &&
      ["www.google.com", "maps.google.com"].includes(url.hostname) &&
      url.pathname.startsWith("/maps/embed")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function searchTerm(value: string): string {
  return value
    .replace(/[(),.%_*\\]/g, " ")
    .trim()
    .slice(0, 120);
}

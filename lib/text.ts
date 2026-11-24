/** Shared, dependency-free text helpers (safe for server and client). */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 90;
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, "0");
}

/**
 * Posts live at the site root (https://gtawiki.xyz/<slug>), so a post must never reuse the name of a
 * real route, a metadata file, or something a bot or plugin might expect to find there.
 */
export const RESERVED_SLUGS = new Set([
  "about", "contact", "disclaimer", "editorial-policy", "privacy-policy", "terms-of-service",
  "admin", "api", "category", "categories", "guides", "tag", "tags", "author", "authors",
  "sitemap", "robots", "favicon", "icon", "apple-icon", "opengraph-image", "twitter-image", "manifest",
  "feed", "rss", "search", "login", "logout", "register", "wp-admin", "wp-login", "wp-content", "wp-json",
  "static", "assets", "images", "public", "index", "home", "404", "500", "not-found", "_next",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/** Returns a human-readable problem with the slug, or null when it is fine. */
export function slugProblem(slug: string): string | null {
  if (!slug) return "Add a URL slug.";
  if (!isValidSlug(slug)) return "Slug may only contain a-z, 0-9 and single dashes.";
  if (isReservedSlug(slug)) return `"${slug}" is reserved for the site itself. Choose a different slug.`;
  return null;
}

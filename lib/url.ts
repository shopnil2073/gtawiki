/** Turns what you type in the link box into a safe URL, or tells you what is wrong. */
export type UrlResult = { url: string; error?: undefined } | { url?: undefined; error: string };

export function normalizeUrl(input: string): UrlResult {
  const v = input.trim();
  if (!v) return { error: "Enter a URL." };
  if (/\s/.test(v)) return { error: "A link cannot contain spaces." };
  if (/^(javascript|data|vbscript):/i.test(v)) return { error: "That kind of link is not allowed." };
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v)) return { url: v };
  // bare post slug, e.g. "does-gta-6-have-multiplayer" -> /does-gta-6-have-multiplayer
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) return { url: `/${v}` };
  // bare domain, e.g. "example.com/page"
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(v)) return { url: `https://${v}` };
  return { error: "Use https://…, a /post-slug, or #section." };
}

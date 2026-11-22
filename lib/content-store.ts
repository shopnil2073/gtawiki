/**
 * Where the admin reads/writes guides:
 *  - "fs"     : content/guides/*.mdx on disk            (npm run dev, local)
 *  - "github" : GitHub REST API commits to your repo    (live on Vercel; each commit triggers a rebuild)
 * Mode is auto-picked: Vercel -> github, otherwise fs. Override with CONTENT_STORE=fs|github.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { isValidSlug } from "./text";

const DIR = "content/guides";

export type StoreMode = "fs" | "github";
export type StoredFile = { slug: string; raw: string; sha?: string };

export class StoreError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function storeMode(): StoreMode {
  const forced = process.env.CONTENT_STORE;
  if (forced === "fs" || forced === "github") return forced;
  return process.env.VERCEL ? "github" : "fs";
}

function gh() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new StoreError(
      "GITHUB_TOKEN is not set. Add it in Vercel -> Settings -> Environment Variables (see setup guide).",
      500,
    );
  }
  const owner = process.env.GITHUB_OWNER || "shopnil2073";
  const repo = process.env.GITHUB_REPO || "gtawiki";
  const branch = process.env.GITHUB_BRANCH || "main";
  const api = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");
  const base = `${api}/repos/${owner}/${repo}/contents`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gtawiki-admin",
  };
  return { base, branch, headers };
}

function assertSlug(slug: string) {
  if (!isValidSlug(slug)) throw new StoreError(`Invalid slug "${slug}".`, 400);
}

async function ghFail(res: Response, what: string): Promise<never> {
  let detail = "";
  try {
    const j = (await res.json()) as { message?: string };
    detail = j.message ?? "";
  } catch {
    /* ignore */
  }
  if (res.status === 401 || res.status === 403) {
    throw new StoreError(`GitHub refused ${what} (${res.status}). Check GITHUB_TOKEN permissions: Contents = Read and write. ${detail}`, 502);
  }
  if (res.status === 409 || res.status === 422) {
    throw new StoreError(`GitHub conflict while ${what}: ${detail}. Reload the post and try again.`, 409);
  }
  throw new StoreError(`GitHub error while ${what} (${res.status}). ${detail}`, 502);
}

// ---------------------------------------------------------------- read

export async function listSlugs(): Promise<string[]> {
  if (storeMode() === "fs") {
    const dir = path.join(process.cwd(), DIR);
    try {
      return (await fs.readdir(dir)).filter((f) => /\.mdx$/.test(f)).map((f) => f.replace(/\.mdx$/, ""));
    } catch {
      return [];
    }
  }
  const { base, branch, headers } = gh();
  const res = await fetch(`${base}/${DIR}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) return ghFail(res, "listing guides");
  const items = (await res.json()) as Array<{ name: string; type: string }>;
  return items.filter((i) => i.type === "file" && i.name.endsWith(".mdx")).map((i) => i.name.replace(/\.mdx$/, ""));
}

export async function readFile(slug: string): Promise<StoredFile | null> {
  assertSlug(slug);
  if (storeMode() === "fs") {
    try {
      return { slug, raw: await fs.readFile(path.join(process.cwd(), DIR, `${slug}.mdx`), "utf8") };
    } catch {
      return null;
    }
  }
  const { base, branch, headers } = gh();
  const res = await fetch(`${base}/${DIR}/${slug}.mdx?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) return ghFail(res, `reading ${slug}`);
  const j = (await res.json()) as { content: string; sha: string; encoding: string };
  return { slug, raw: Buffer.from(j.content, "base64").toString("utf8"), sha: j.sha };
}

/** Reads every guide (parallel, limited). */
export async function readAll(): Promise<StoredFile[]> {
  const slugs = await listSlugs();
  const out: StoredFile[] = [];
  let i = 0;
  async function worker() {
    while (i < slugs.length) {
      const slug = slugs[i++];
      const f = await readFile(slug);
      if (f) out.push(f);
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, slugs.length) }, worker));
  return out;
}

// ---------------------------------------------------------------- write

export async function writeFile(slug: string, raw: string, message: string): Promise<void> {
  assertSlug(slug);
  if (storeMode() === "fs") {
    const dir = path.join(process.cwd(), DIR);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${slug}.mdx`), raw, "utf8");
    return;
  }
  const { base, branch, headers } = gh();
  const existing = await readFile(slug); // need the current sha to update
  const res = await fetch(`${base}/${DIR}/${slug}.mdx`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(raw, "utf8").toString("base64"),
      branch,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });
  if (!res.ok) return ghFail(res, `saving ${slug}`);
}

export async function deleteFile(slug: string, message: string): Promise<void> {
  assertSlug(slug);
  if (storeMode() === "fs") {
    await fs.rm(path.join(process.cwd(), DIR, `${slug}.mdx`), { force: true });
    return;
  }
  const { base, branch, headers } = gh();
  const existing = await readFile(slug);
  if (!existing?.sha) throw new StoreError("That post does not exist on GitHub.", 404);
  const res = await fetch(`${base}/${DIR}/${slug}.mdx`, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha: existing.sha, branch }),
  });
  if (!res.ok) return ghFail(res, `deleting ${slug}`);
}

export async function exists(slug: string): Promise<boolean> {
  return (await readFile(slug)) !== null;
}

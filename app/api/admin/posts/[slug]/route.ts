import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { StoreError, deleteFile, exists, readFile, writeFile } from "@/lib/content-store";
import { loadPost, postToFields } from "@/lib/admin-posts";
import { serializePost, type PostFields } from "@/lib/frontmatter";
import { categories } from "@/lib/site";
import { slugProblem } from "@/lib/text";
import type { MediaItem } from "@/lib/posts";

type Ctx = { params: Promise<{ slug: string }> };

const fail = (e: unknown) => {
  const status = e instanceof StoreError ? e.status : 500;
  return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
};

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { slug } = await params;
    const post = await loadPost(slug);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ slug, fields: postToFields(post), body: post.content });
  } catch (e) {
    return fail(e);
  }
}

type SaveBody = {
  isNew: boolean;
  originalSlug?: string;
  fields: PostFields;
  body: string;
};

function clean(fields: PostFields): PostFields {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const media: MediaItem[] = Array.isArray(fields.media)
    ? fields.media
        .filter((m) => m && typeof m.url === "string" && m.url.startsWith("https://"))
        .map((m) => ({
          url: m.url,
          alt: str(m.alt),
          publicId: m.publicId ? str(m.publicId) : undefined,
          width: typeof m.width === "number" ? m.width : undefined,
          height: typeof m.height === "number" ? m.height : undefined,
        }))
    : [];
  return {
    title: str(fields.title),
    seoTitle: str(fields.seoTitle),
    description: str(fields.description),
    category: str(fields.category),
    type: fields.type === "howto" || fields.type === "qa" ? fields.type : "article",
    keyword: str(fields.keyword),
    secondaryKeywords: (Array.isArray(fields.secondaryKeywords) ? fields.secondaryKeywords : []).map(str).filter(Boolean),
    date: /^\d{4}-\d{2}-\d{2}$/.test(str(fields.date)) ? str(fields.date) : new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    author: str(fields.author),
    image: str(fields.image),
    imageAlt: str(fields.imageAlt),
    draft: Boolean(fields.draft),
    media,
  };
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { slug } = await params;
    const payload = (await req.json()) as SaveBody;

    const problem = slugProblem(slug);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const fields = clean(payload.fields);
    if (!fields.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!fields.description) return NextResponse.json({ error: "Meta description is required." }, { status: 400 });
    if (!categories.some((c) => c.slug === fields.category)) {
      return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    }
    if (typeof payload.body !== "string") return NextResponse.json({ error: "Missing body." }, { status: 400 });
    if (payload.body.length > 400_000) return NextResponse.json({ error: "Post is too large." }, { status: 413 });

    const renamed = !payload.isNew && payload.originalSlug && payload.originalSlug !== slug;
    if ((payload.isNew || renamed) && (await exists(slug))) {
      return NextResponse.json({ error: `A post with the slug "${slug}" already exists.` }, { status: 409 });
    }

    const raw = serializePost(fields, payload.body);

    // Commit message prefixes matter: "admin: draft" = a post that was never public, so an optional
    // Vercel ignoreCommand can skip the rebuild. Anything that changes the live site uses another prefix.
    const prev = payload.isNew ? null : await readFile(payload.originalSlug || slug);
    const wasLive = Boolean(prev && /^draft:\s*false\s*$/m.test(prev.raw));
    const verb = fields.draft ? (wasLive ? "unpublish" : "draft") : wasLive ? "update" : "publish";
    await writeFile(slug, raw, `admin: ${verb} "${fields.title.slice(0, 60)}"`);
    if (renamed && payload.originalSlug) {
      await deleteFile(payload.originalSlug, `admin: rename ${payload.originalSlug} -> ${slug}`);
    }
    return NextResponse.json({ ok: true, slug, updated: fields.updated, date: fields.date });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { slug } = await params;
    await deleteFile(slug, `admin: delete ${slug}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

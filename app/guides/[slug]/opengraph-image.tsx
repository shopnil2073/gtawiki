import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getCategory } from "@/lib/site";

export const alt = "GTA Wiki guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? "GTA Wiki";
  const label = post ? (getCategory(post.category)?.label ?? "Guide") : "GTA 6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #09090b 0%, #2a0f2e 60%, #1b1250 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#ff2e93", letterSpacing: 4, textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 70 ? 54 : 66, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34 }}>
          <span style={{ color: "white", fontWeight: 700 }}>GTA</span>
          <span style={{ color: "#ff2e93", fontWeight: 700 }}>Wiki</span>
          <span style={{ marginLeft: 20, color: "#a1a1aa", fontSize: 26 }}>gtawiki.xyz</span>
        </div>
      </div>
    ),
    size,
  );
}

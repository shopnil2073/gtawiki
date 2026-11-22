import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { cloudinaryConfig, signUpload } from "@/lib/cloudinary";
import { isValidSlug } from "@/lib/text";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cfg = cloudinaryConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." },
      { status: 500 },
    );
  }

  let slug = "drafts";
  try {
    const body = (await req.json()) as { slug?: string };
    if (body.slug && isValidSlug(body.slug)) slug = body.slug;
  } catch {
    /* default folder */
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `gtawiki/${slug}`;
  const signature = signUpload({ folder, timestamp }, cfg.apiSecret);
  return NextResponse.json({
    cloudName: cfg.cloudName,
    apiKey: cfg.apiKey,
    timestamp,
    folder,
    signature,
  });
}

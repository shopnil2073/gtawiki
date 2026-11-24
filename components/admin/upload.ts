import type { MediaItem } from "@/lib/posts";

/** Cloudinary free plan limit for a single image. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function humanize(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Small cropped thumbnail for the admin (Cloudinary URL transformation). */
export function thumbUrl(url: string): string {
  return url.replace(/\/upload\/(?:[^/]*,[^/]*\/)?/, "/upload/c_fill,w_360,h_220,f_auto,q_auto/");
}

/**
 * Uploads one image straight to Cloudinary using a server-signed request
 * (/api/admin/cloudinary-sign), and returns the optimized media item. Throws a readable Error.
 */
export async function uploadImage(file: File, slug: string): Promise<MediaItem> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Larger than 10 MB (Cloudinary free limit). Resize it first.");

  const signRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: slug || "drafts" }),
  });
  const sign = (await signRes.json()) as {
    error?: string;
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
  };
  if (!signRes.ok) throw new Error(sign.error ?? "Could not sign the upload.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("signature", sign.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: form });
  const j = (await res.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    error?: { message: string };
  };
  if (!res.ok || !j.secure_url) throw new Error(j.error?.message ?? "Cloudinary rejected the upload.");

  return {
    url: j.secure_url.replace("/upload/", "/upload/f_auto,q_auto/"),
    alt: humanize(file.name),
    publicId: j.public_id,
    width: j.width,
    height: j.height,
  };
}

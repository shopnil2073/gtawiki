import Image from "next/image";
import { getCategory } from "@/lib/site";
import type { PostMeta } from "@/lib/posts";

/** Post image, or a hatched "redacted file" panel when no image is set yet. */
export default function Thumb({
  post,
  sizes = "(min-width: 1024px) 400px, 100vw",
  priority = false,
}: {
  post: Pick<PostMeta, "image" | "imageAlt" | "title" | "category">;
  sizes?: string;
  priority?: boolean;
}) {
  const cat = getCategory(post.category);
  const Icon = cat?.icon;
  if (post.image) {
    return (
      <Image
        src={post.image}
        alt={post.imageAlt || post.title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  return (
    <div className="hatch absolute inset-0 grid place-items-center">
      {Icon && <Icon className={`h-10 w-10 opacity-60 ${cat?.text}`} strokeWidth={1.25} />}
      <span className="mono-label absolute bottom-2 left-2 text-mute">No image on file</span>
    </div>
  );
}

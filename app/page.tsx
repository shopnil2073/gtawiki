import type { Metadata } from "next";
import HomeFeed from "@/components/seo/HomeFeed";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeFeed page={1} />;
}

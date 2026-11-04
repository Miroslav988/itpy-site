import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";
import { siteOrigin } from "./site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  return [
    { url: `${origin}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/courses`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/blog`, changeFrequency: "weekly", priority: 0.6 },
    ...posts
      .filter((post) => !post.draft)
      .map((post) => ({ url: `${origin}/blog/${post.slug}`, lastModified: post.date, priority: 0.5 })),
  ];
}

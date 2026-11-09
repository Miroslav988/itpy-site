import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";
import { siteOrigin } from "./site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  const published = posts.filter((post) => !post.draft);
  const tasks = [...new Set(published.flatMap((post) => (post.task ? [post.task] : [])))].sort((a, b) => a - b);
  return [
    { url: `${origin}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/courses`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/blog`, lastModified: published[0]?.date, changeFrequency: "weekly", priority: 0.7 },
    ...tasks.map((task) => ({ url: `${origin}/blog?task=${task}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...published.map((post) => ({ url: `${origin}/blog/${post.slug}`, lastModified: post.date, priority: 0.5 })),
  ];
}

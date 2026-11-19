import type { MetadataRoute } from "next";
import { getPosts, hasPage, rubricsWithPosts } from "./blog/posts";
import { legalDocuments } from "./legal/documents";
import { siteOrigin } from "./site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  const posts = getPosts();
  const published = posts.filter(hasPage);
  const tasks = [...new Set(posts.flatMap((post) => (post.rubric === "breakdown" ? post.tasks ?? (post.task ? [post.task] : []) : [])))].sort((a, b) => a - b);
  return [
    { url: `${origin}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/courses`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/blog`, lastModified: posts[0]?.date, changeFrequency: "daily", priority: 0.7 },
    ...rubricsWithPosts().map((rubric) => ({ url: `${origin}/blog?rubric=${rubric}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...tasks.map((task) => ({ url: `${origin}/blog?task=${task}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...published.map((post) => ({ url: `${origin}/blog/${post.slug}`, lastModified: post.date, priority: 0.5 })),
    ...legalDocuments.map((document) => ({ url: `${origin}${document.path}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}

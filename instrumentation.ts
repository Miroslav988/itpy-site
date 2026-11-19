// Keeps the blog in step with the channel while the production server runs
// (scripts/telegram/sync.mjs). BLOG_SYNC=off turns it off, e.g. for tests.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production" || process.env.BLOG_SYNC === "off") return;
  const { startBlogSync } = await import("./scripts/telegram/sync.mjs");
  startBlogSync();
}

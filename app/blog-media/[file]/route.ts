import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Pictures of the channel posts. They are downloaded while the site runs (scripts/telegram/sync.mjs),
// so they cannot live in public/, which Next.js only serves as it was at build time.
const mediaDir = join(process.env.BLOG_DIR ?? join(process.cwd(), "content/blog"), "media");
const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const extension = file.match(/^\d+-\d+\.(jpg|jpeg|png|webp)$/)?.[1];
  if (!extension) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(join(mediaDir, file));
    return new Response(data, {
      headers: { "content-type": types[extension], "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Articles live in content/blog/*.json, written by scripts/import-dzen.mjs.
// Every article is reduced to these few block types, so all of them share one style.

export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
};

export type Block =
  | { type: "paragraph"; content: Inline[] }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "quote"; content: Inline[] }
  | { type: "code"; text: string }
  | { type: "image"; src: string; width: number; height: number; alt: string; caption?: string }
  | { type: "divider" };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  cover?: { src: string; width: number; height: number };
  // ЕГЭ task number for task breakdowns (from "#ЕГЭ5" in the Dzen title).
  task?: number;
  meta?: { source?: string; sourceHref?: string; level?: string };
  // Button text from a "Пробное: …" line in the article; see ctaText().
  cta?: string;
  // The original Dzen URL; absent for articles written directly for the site.
  source?: string;
  // Drafts are labelled on the page, kept out of the sitemap and marked noindex.
  draft?: boolean;
  // Hidden articles (reposts, text-less posts, manual picks) get no page at all.
  hidden?: boolean;
  originalTitle?: string;
  blocks: Block[];
};

const blogDir = join(process.cwd(), "content/blog");

export const posts: Post[] = readdirSync(blogDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(join(blogDir, file), "utf8")) as Post)
  .filter((post) => !post.hidden)
  .sort((a, b) => b.date.localeCompare(a.date));

export function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

// A task breakdown that explains its code line by line ("Комментарии к коду" with at least
// eight lines), preferring the basic level: the FAQ points readers who memorise templates here.
export function commentedBreakdown() {
  const commented = (post: Post) =>
    Boolean(post.task) && post.blocks.some((block) => block.type === "list" && block.items.filter((item) => item[0]?.code).length >= 8);
  return posts.find((post) => commented(post) && post.meta?.level === "Базовый") ?? posts.find(commented);
}

export function ctaText(post: Post) {
  if (post.cta) return post.cta;
  if (post.task) return `Задание ${post.task} вызывает трудности? Разберём его вместе на бесплатном пробном занятии.`;
  return "Хочешь разобраться в ЕГЭ вместе? Начнём с бесплатного пробного занятия.";
}

const wordsIn = (parts: Inline[]) => parts.reduce((sum, part) => sum + part.text.split(/\s+/).filter(Boolean).length, 0);

export function readingMinutes(post: Post) {
  const words = post.blocks.reduce((sum, block) => {
    if (block.type === "paragraph" || block.type === "quote") return sum + wordsIn(block.content);
    if (block.type === "list") return sum + block.items.reduce((total, item) => total + wordsIn(item), 0);
    if (block.type === "heading") return sum + block.text.split(/\s+/).length;
    return sum;
  }, 0);
  return Math.max(1, Math.round(words / 180));
}

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

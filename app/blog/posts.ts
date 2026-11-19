import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Articles come from the channel: scripts/telegram/sync.mjs stores them in content/blog/posts,
// and the running site refreshes them on a timer (instrumentation.ts). Every post is reduced to
// these few block types, so all of them share one style.

export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
};

export type Picture = { src: string; width: number; height: number };

export type Block =
  | { type: "paragraph"; content: Inline[] }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered: boolean; start?: number; items: Inline[][] }
  | { type: "quote"; content: Inline[] }
  | { type: "code"; text: string }
  | { type: "image"; src: string; width: number; height: number; alt: string; caption?: string }
  | { type: "video"; href: string; thumb: Picture }
  | { type: "divider" };

// The channel's hashtags decide the rubric: #ЕГЭ1–27 with "Разбор" → breakdown, #tpy → python,
// #useful → useful, #news → news, #view → video (docs/telegram-posts.md). The key order is the
// order of the blog tabs; a rubric without posts gets no tab.
export type Rubric = "breakdown" | "python" | "useful" | "news" | "video";

export const rubrics: Record<Rubric, { label: string; badge: string; heading: string; title: string; lead: string }> = {
  breakdown: {
    label: "Разборы ЕГЭ",
    badge: "Разбор ЕГЭ",
    heading: "Разборы заданий",
    title: "Разборы заданий ЕГЭ по информатике",
    lead: "Условие, решение на Python и комментарии к коду — по номерам заданий.",
  },
  python: {
    label: "Теория Python",
    badge: "Теория Python",
    heading: "Python-шпаргалки",
    title: "Python-шпаргалки для ЕГЭ по информатике",
    lead: "Короткие заметки о функциях, библиотеках и приёмах, которые пригодятся на экзамене.",
  },
  useful: {
    label: "Полезное о ЕГЭ",
    badge: "Полезное о ЕГЭ",
    heading: "Полезные материалы",
    title: "Полезное к ЕГЭ по информатике: варианты и подборки",
    lead: "Официальные варианты с файлами, дайджесты и подборки материалов.",
  },
  news: {
    label: "Новости",
    badge: "Новости ЕГЭ",
    heading: "Новости ЕГЭ",
    title: "Новости ЕГЭ по информатике",
    lead: "Изменения в экзамене и важные объявления.",
  },
  video: {
    label: "Видео",
    badge: "Видео",
    heading: "Видео о ЕГЭ",
    title: "Видео о ЕГЭ по информатике",
    lead: "Короткие ролики с разборами и советами.",
  },
};

export type Post = {
  id: number;
  slug: string;
  rubric: Rubric;
  title: string;
  description: string;
  date: string;
  // ЕГЭ task number of a breakdown; tasks lists all of them when a post covers several (19–21).
  task?: number;
  tasks?: number[];
  problem?: string;
  // Where the task comes from: КЕГЭ, Яндекс, СтатГрад… (by hashtag) and the "Автор:" line.
  collection?: string;
  meta?: { source?: string; level?: string };
  // The post in the channel.
  source: string;
  video?: { href: string; thumb?: Picture };
  // Reposts of an article stay stored but get no page.
  hidden?: boolean;
  blocks: Block[];
};

const postsDir = join(process.env.BLOG_DIR ?? join(process.cwd(), "content/blog"), "posts");
let cache: { stamp: number; posts: Post[] } | undefined;

// Re-reads the folder only when the sync has written to it (new files change its mtime).
export function getPosts(): Post[] {
  let stamp: number;
  try {
    stamp = statSync(postsDir).mtimeMs;
  } catch {
    return [];
  }
  if (cache?.stamp !== stamp) {
    const posts = readdirSync(postsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(readFileSync(join(postsDir, file), "utf8")) as Post)
      .filter((post) => !post.hidden)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    cache = { stamp, posts };
  }
  return cache.posts;
}

// Videos have no page of their own: their cards lead straight to the video.
export function findPost(slug: string) {
  return getPosts().find((post) => post.slug === slug && post.rubric !== "video");
}

export const hasPage = (post: Post) => post.rubric !== "video";

// The card text, unless it only repeats the title or is a list of numbers (answers of a variant).
export function cardText(post: Post) {
  const text = post.description?.trim();
  if (!text || text.startsWith(post.title) || post.title.startsWith(text)) return undefined;
  const digits = text.replace(/[^0-9]/g, "").length;
  return digits > text.replace(/\s/g, "").length / 2 ? undefined : text;
}

export const rubricsWithPosts = () => (Object.keys(rubrics) as Rubric[]).filter((rubric) => getPosts().some((post) => post.rubric === rubric));

export function taskLabel(post: Post) {
  if (!post.task) return undefined;
  return post.tasks && post.tasks.length > 1 ? `${post.tasks[0]}–${post.tasks.at(-1)}` : String(post.task);
}

export function ctaText(post: Post) {
  if (post.rubric === "breakdown" && post.task) return `Задание ${taskLabel(post)} вызывает трудности? Разберём его вместе на бесплатном пробном занятии.`;
  if (post.rubric === "python") return "Хочешь уверенно писать код на ЕГЭ? Начнём с бесплатного пробного занятия.";
  return "Хочешь разобраться в ЕГЭ вместе? Начнём с бесплатного пробного занятия.";
}

const wordsIn = (parts: Inline[]) => parts.reduce((sum, part) => sum + part.text.split(/\s+/).filter(Boolean).length, 0);

export function readingMinutes(post: Post) {
  const words = post.blocks.reduce((sum, block) => {
    if (block.type === "paragraph" || block.type === "quote") return sum + wordsIn(block.content);
    if (block.type === "list") return sum + block.items.reduce((total, item) => total + wordsIn(item), 0);
    if (block.type === "heading") return sum + block.text.split(/\s+/).length;
    if (block.type === "code") return sum + block.text.split(/\s+/).length / 2;
    return sum;
  }, 0);
  return Math.max(1, Math.round(words / 180));
}

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

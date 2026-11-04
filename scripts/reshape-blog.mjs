// Re-applies the rules from blog-shape.mjs to articles already in content/blog — body
// clean-up, titles, task numbers and slugs — without downloading anything, and hides reposts
// (the same task condition published again; the newest copy stays visible).
//
//   npm run blog:reshape
//   npm run blog:reshape -- --titles titles.json   fill in originalTitle from a { "<Dzen URL>": "<title>" } map

import { readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBody, shapeTitle, slugify } from "./blog-shape.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDir = join(root, "content/blog");
const imagesDir = join(root, "public/blog");
const args = process.argv.slice(2);
const titlesFile = args.includes("--titles") ? args[args.indexOf("--titles") + 1] : undefined;
const titles = titlesFile ? JSON.parse(await readFile(titlesFile, "utf8")) : {};

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const formatDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
};
const textOf = (block) => (block.content ?? []).map((part) => part.text).join("");

// What identifies an article when looking for reposts: the problem number from the Dzen
// title, every number in the text (different problems of one task differ in them even when
// worded alike) and three-word shingles of the text.
function fingerprint(post) {
  const text = post.blocks
    .flatMap((block) => (block.type === "list" ? block.items.map((item) => item.map((part) => part.text).join("")) : [textOf(block)]))
    .join(" ")
    .toLowerCase();
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const shingles = new Set();
  for (let index = 0; index + 2 < words.length; index++) shingles.add(words.slice(index, index + 3).join(" "));
  return {
    slug: post.slug,
    task: post.task,
    problem: post.originalTitle?.match(/номера\s+(\d{3,})/i)?.[1],
    numbers: (text.match(/\d+/g) ?? []).join(","),
    shingles,
  };
}

function isRepost(a, b) {
  if (a.problem || b.problem) return a.problem === b.problem;
  // Numbers only tell task breakdowns apart; guides on different topics never look alike.
  if ((a.task && a.numbers !== b.numbers) || a.shingles.size < 10) return false;
  let common = 0;
  for (const shingle of a.shingles) if (b.shingles.has(shingle)) common++;
  // An extended repost still contains almost all of the shorter copy.
  return common / Math.min(a.shingles.size, b.shingles.size) >= 0.9;
}

// Some Dzen posts are a single screenshot with no text: nothing to read or index on the site.
const MIN_WORDS = 15;
const wordCount = (post) =>
  post.blocks
    .flatMap((block) => (block.type === "list" ? block.items.map((item) => item.map((part) => part.text).join("")) : block.type === "heading" ? [block.text] : [textOf(block)]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

const files = (await readdir(contentDir)).filter((file) => file.endsWith(".json"));
const posts = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(contentDir, file), "utf8"))));
posts.sort((a, b) => b.date.localeCompare(a.date));

let untitled = 0;
let reposts = 0;
let thin = 0;
const kept = new Map();
for (const post of posts) {
  normalizeBody(post);
  const originalTitle = post.originalTitle ?? titles[post.source]?.replace(/^Читать статью:\s*/, "");
  if (originalTitle) {
    const { task, title } = shapeTitle(originalTitle, post.meta);
    Object.assign(post, { originalTitle, task, title });
  } else {
    untitled++;
  }

  if (!post.hidden && wordCount(post) < MIN_WORDS) {
    post.hidden = true;
    thin++;
    continue;
  }

  // Posts are newest first, so the newest copy of a repost is the one kept.
  const group = String(post.task ?? "");
  const own = fingerprint(post);
  const others = kept.get(group) ?? [];
  const original = post.hidden ? undefined : others.find((other) => isRepost(own, other));
  if (original) {
    post.hidden = true;
    reposts++;
    console.log(`  repost hidden: ${post.date} ${post.slug} = ${original.slug}`);
  }
  if (!post.hidden) kept.set(group, [...others, own]);
}

// Different articles that still share a title get their date appended.
const visible = posts.filter((post) => !post.hidden);
const counts = new Map();
for (const post of visible) counts.set(post.title, (counts.get(post.title) ?? 0) + 1);
for (const post of visible) if (counts.get(post.title) > 1) post.title = `${post.title} (${formatDate(post.date)})`;

const taken = new Set();
const moves = [];
for (const post of posts) {
  let slug = slugify(post.title);
  for (let suffix = 2; taken.has(slug); suffix++) slug = `${slugify(post.title)}-${suffix}`;
  taken.add(slug);
  if (slug !== post.slug) moves.push({ post, from: post.slug, to: slug });
}

// Two steps through temporary names, so a new slug never overwrites a folder that is still to be moved.
for (const move of moves) if (existsSync(join(imagesDir, move.from))) await rename(join(imagesDir, move.from), join(imagesDir, `${move.from}.__reshape__`));
for (const move of moves) if (existsSync(join(imagesDir, `${move.from}.__reshape__`))) await rename(join(imagesDir, `${move.from}.__reshape__`), join(imagesDir, move.to));

for (const { post, from, to } of moves) {
  const relocate = (src) => src.replace(`/blog/${from}/`, `/blog/${to}/`);
  for (const block of post.blocks) if (block.type === "image") block.src = relocate(block.src);
  if (post.cover) post.cover.src = relocate(post.cover.src);
  post.slug = to;
}

for (const file of files) await rm(join(contentDir, file));
for (const post of posts) await writeFile(join(contentDir, `${post.slug}.json`), `${JSON.stringify(post, null, 2)}\n`);

console.log(`${posts.length} articles: ${moves.length} renamed, ${reposts} reposts and ${thin} text-less posts hidden, ${posts.filter((post) => post.hidden).length} hidden in total${untitled ? `, ${untitled} without originalTitle left as they were` : ""}.`);

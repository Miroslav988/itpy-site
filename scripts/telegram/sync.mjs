// Keeps the blog in step with the channel: reads new posts from the public web preview,
// shapes the ones with a rubric hashtag into articles (shape.mjs) and stores them in
// content/blog: posts/<post id>.json, media/<post id>-<n>.jpg and state.json.
//
//   npm run blog:sync              new and recently edited posts
//   npm run blog:sync -- --all     the whole channel again
//
// The running site calls syncChannel() on a timer as well (instrumentation.ts).

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parsePage } from "./parse.mjs";
import { shapePost, slugify } from "./shape.mjs";

export const channel = process.env.BLOG_CHANNEL ?? "informatika_kege_itpy";
export const blogDir = () => process.env.BLOG_DIR ?? join(process.cwd(), "content/blog");

const PAGE_DELAY_MS = 1500;
const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const formatDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
};

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; itpy-blog-sync)" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

async function writeAtomic(file, data) {
  await writeFile(`${file}.tmp`, data);
  await rename(`${file}.tmp`, file);
}

const bodyWords = (article) =>
  new Set(JSON.stringify(article.blocks).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);

function similarity(a, b) {
  const left = bodyWords(a);
  const right = bodyWords(b);
  let shared = 0;
  for (const word of left) if (right.has(word)) shared++;
  return shared / Math.max(1, Math.min(left.size, right.size));
}

// Decides what is shown: the newest copy of a reposted article stays, titles that repeat get
// their date, and every article keeps the address it was first published under.
export function finalize(articles) {
  const list = [...articles.values()].sort((a, b) => b.id - a.id);
  for (const article of list) article.hidden = false;

  const kept = [];
  for (const article of list) {
    const twin = kept.find((other) =>
      other.rubric === article.rubric &&
      (article.problem
        ? other.problem === article.problem && other.task === article.task
        : other.baseTitle === article.baseTitle && similarity(other, article) >= 0.6));
    if (twin) article.hidden = true;
    else kept.push(article);
  }

  const titleCount = new Map();
  for (const article of kept) titleCount.set(article.baseTitle, (titleCount.get(article.baseTitle) ?? 0) + 1);
  for (const article of list) {
    article.title = !article.hidden && titleCount.get(article.baseTitle) > 1 ? `${article.baseTitle} (${formatDate(article.date)})` : article.baseTitle;
  }

  // Shown articles get the plain address before hidden copies do; older ones before newer.
  const taken = new Set(list.filter((article) => article.slug).map((article) => article.slug));
  const order = [...list].reverse().sort((a, b) => Number(a.hidden) - Number(b.hidden));
  for (const article of order) {
    if (article.slug) continue;
    let slug = slugify(article.title);
    if (taken.has(slug)) slug = `${slug}-${article.id}`;
    taken.add(slug);
    article.slug = slug;
  }
}

async function readStore(dir) {
  const postsDir = join(dir, "posts");
  const articles = new Map();
  if (!existsSync(postsDir)) return articles;
  for (const file of await readdir(postsDir)) {
    if (!file.endsWith(".json")) continue;
    const article = JSON.parse(await readFile(join(postsDir, file), "utf8"));
    articles.set(article.id, article);
  }
  return articles;
}

export async function syncChannel({ dir = blogDir(), all = false, log = console.log } = {}) {
  const postsDir = join(dir, "posts");
  const mediaDir = join(dir, "media");
  await mkdir(postsDir, { recursive: true });
  await mkdir(mediaDir, { recursive: true });
  const statePath = join(dir, "state.json");
  const state = existsSync(statePath) ? JSON.parse(await readFile(statePath, "utf8")) : { lastId: 0 };

  // Newest pages first, until the posts seen last time; the newest page is always re-read, so
  // recent edits arrive too. An empty store reads the whole channel.
  const seen = new Map();
  let before;
  for (let page = 0; page < 1000; page++) {
    if (page) await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));
    const url = `https://t.me/s/${channel}${before ? `?before=${before}` : ""}`;
    const found = parsePage(await (await fetchText(url)).text(), channel);
    if (!found.length) break;
    for (const post of found) seen.set(post.id, post);
    const oldest = Math.min(...found.map((post) => post.id));
    if ((!all && oldest <= state.lastId) || oldest === before || oldest <= 1) break;
    before = oldest;
  }

  const articles = await readStore(dir);
  const snapshot = new Map([...articles].map(([id, article]) => [id, JSON.stringify(article)]));
  let removed = 0;
  for (const post of seen.values()) {
    const shaped = shapePost(post, channel);
    const previous = articles.get(post.id);
    if (!shaped) {
      if (previous) {
        articles.delete(post.id);
        await rm(join(postsDir, `${post.id}.json`), { force: true });
        removed++;
      }
      continue;
    }
    const { title, ...rest } = shaped;
    articles.set(post.id, { ...rest, baseTitle: title, title, slug: previous?.slug });
  }

  finalize(articles);

  // Pictures are fetched once; a failed download is retried on the next run.
  for (const article of articles.values()) {
    if (article.hidden) continue;
    for (const { url, file } of article.media ?? []) {
      const target = join(mediaDir, file);
      if (existsSync(target)) continue;
      try {
        await writeAtomic(target, Buffer.from(await (await fetchText(url)).arrayBuffer()));
      } catch (error) {
        log(`  media ${file}: ${error.message}`);
      }
    }
  }

  let added = 0;
  let updated = 0;
  for (const [id, article] of articles) {
    const json = JSON.stringify(article);
    if (snapshot.get(id) === json) continue;
    if (snapshot.has(id)) updated++;
    else added++;
    await writeAtomic(join(postsDir, `${id}.json`), `${JSON.stringify(article, null, 2)}\n`);
  }

  const lastId = Math.max(state.lastId, ...seen.keys());
  await writeAtomic(statePath, `${JSON.stringify({ lastId, syncedAt: new Date().toISOString() }, null, 2)}\n`);
  const visible = [...articles.values()].filter((article) => !article.hidden).length;
  return { read: seen.size, added, updated, removed, visible };
}

// Runs inside the site: first a minute after start, then every BLOG_SYNC_MINUTES (30 by default).
let timer;
export function startBlogSync({ log = console.log } = {}) {
  if (timer) return;
  const minutes = Number(process.env.BLOG_SYNC_MINUTES) || 30;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await syncChannel({ log });
      if (result.added || result.updated || result.removed) log(`blog sync: ${JSON.stringify(result)}`);
    } catch (error) {
      log(`blog sync failed: ${error.message}`);
    } finally {
      running = false;
    }
  };
  setTimeout(run, 60_000).unref();
  timer = setInterval(run, minutes * 60_000);
  timer.unref();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = await syncChannel({ all: process.argv.includes("--all") });
  console.log(`${result.read} posts read: ${result.added} added, ${result.updated} updated, ${result.removed} removed; ${result.visible} articles on the site.`);
}

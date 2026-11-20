// Keeps the blog in step with the channel: reads posts from the public web preview, shapes the
// ones in the post format into articles (shape.mjs) and stores them in content/blog:
// posts/<post id>.json, media/<post id>-<n>.jpg and state.json.
//
//   npm run blog:sync                      new posts and edits of the last 20
//   npm run blog:sync -- --all             the whole channel: every edit, and articles whose posts
//                                          were deleted from the channel go too
//   npm run blog:sync -- --all --force     the same, even when many articles go at once
//
// The running site reads the whole channel once a day by itself (instrumentation.ts).

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

// Where Telegram is blocked, TELEGRAM_PROXY sends these requests (and only these) through the
// HTTP proxy of a VPN client, e.g. http://127.0.0.1:10809. The rest of the site stays direct.
let proxied;
async function proxiedFetch() {
  const proxy = process.env.TELEGRAM_PROXY;
  if (!proxy) return fetch;
  if (!proxied) {
    const { ProxyAgent, fetch: undiciFetch } = await import("undici");
    const dispatcher = new ProxyAgent(proxy);
    proxied = (url, options) => undiciFetch(url, { ...options, dispatcher });
  }
  return proxied;
}

async function fetchText(url) {
  const fetchFn = await proxiedFetch();
  const response = await fetchFn(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; itpy-blog-sync)" },
    signal: AbortSignal.timeout(30_000),
  });
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

// Articles whose posts are gone from the channel. Only a read that reached the oldest article
// counts (the newest page comes first, so everything newer was read too). A read that would take
// away many articles at once is suspect, since Telegram sometimes serves short pages: it removes
// nothing then and reports how many are held back, unless `force` says the deletions are real.
export function deletedPosts(articleIds, seenIds, { force = false } = {}) {
  const ids = [...articleIds];
  if (!ids.length || !seenIds.size || Math.min(...seenIds) > Math.min(...ids)) return { remove: [], held: 0 };
  const missing = ids.filter((id) => !seenIds.has(id));
  const limit = Math.max(10, Math.ceil(ids.length * 0.1));
  return missing.length > limit && !force ? { remove: [], held: missing.length } : { remove: missing, held: 0 };
}

export async function syncChannel({ dir = blogDir(), all = false, force = false, log = console.log } = {}) {
  const postsDir = join(dir, "posts");
  const mediaDir = join(dir, "media");
  await mkdir(postsDir, { recursive: true });
  await mkdir(mediaDir, { recursive: true });
  const statePath = join(dir, "state.json");
  const state = existsSync(statePath) ? JSON.parse(await readFile(statePath, "utf8")) : { lastId: 0 };

  // Newest pages first, until the posts seen last time (or to the very first post with `all`);
  // the newest page is always re-read, so recent edits arrive too.
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
  // Telegram signs picture addresses anew on every read, and every daily run reads the whole
  // channel with fresh ones: a file is rewritten only when something besides them changed.
  const comparable = (article) => JSON.stringify({ ...article, media: article.media?.map(({ file }) => file) });
  const snapshot = new Map([...articles].map(([id, article]) => [id, comparable(article)]));
  let removed = 0;
  for (const post of seen.values()) {
    const shaped = shapePost(post, channel);
    const previous = articles.get(post.id);
    if (!shaped) {
      if (previous) {
        articles.delete(post.id);
        await rm(join(postsDir, `${post.id}.json`), { force: true });
        for (const { file } of previous.media ?? []) await rm(join(mediaDir, file), { force: true });
        removed++;
      }
      continue;
    }
    const { title, ...rest } = shaped;
    articles.set(post.id, { ...rest, baseTitle: title, title, slug: previous?.slug });
  }

  // A post deleted from the channel takes its article and pictures with it.
  let held = 0;
  if (all) {
    const gone = deletedPosts(articles.keys(), new Set(seen.keys()), { force });
    held = gone.held;
    if (held) log(`blog sync: ${held} articles are missing from the channel, not removing that many at once (npm run blog:sync -- --all --force removes them)`);
    for (const id of gone.remove) {
      const previous = articles.get(id);
      articles.delete(id);
      await rm(join(postsDir, `${id}.json`), { force: true });
      for (const { file } of previous.media ?? []) await rm(join(mediaDir, file), { force: true });
      removed++;
    }
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
    if (snapshot.get(id) === comparable(article)) continue;
    if (snapshot.has(id)) updated++;
    else added++;
    await writeAtomic(join(postsDir, `${id}.json`), `${JSON.stringify(article, null, 2)}\n`);
  }

  const lastId = Math.max(state.lastId, ...seen.keys());
  await writeAtomic(statePath, `${JSON.stringify({ lastId, syncedAt: new Date().toISOString() }, null, 2)}\n`);
  const visible = [...articles.values()].filter((article) => !article.hidden).length;
  return { read: seen.size, added, updated, removed, held, visible };
}

// Runs inside the site: a minute after start, then once a day at BLOG_SYNC_TIME (the server's
// local time, 04:00 by default). Each run reads the whole channel (about 50 pages), so edits of old
// posts arrive and deleted posts leave. A failed run, e.g. with the VPN client down, is retried an
// hour later.
let timer;
export function startBlogSync({ log = console.log } = {}) {
  if (timer) return;
  const time = (process.env.BLOG_SYNC_TIME ?? "").match(/^(\d{1,2}):(\d{2})$/);
  const [hour, minute] = time ? [Number(time[1]), Number(time[2])] : [4, 0];
  const untilDaily = () => {
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    return next.getTime() - Date.now();
  };
  const schedule = (delay) => {
    timer = setTimeout(run, delay);
    timer.unref();
  };
  const run = async () => {
    let failed = false;
    try {
      const result = await syncChannel({ all: true, log });
      if (result.added || result.updated || result.removed) log(`blog sync: ${JSON.stringify(result)}`);
    } catch (error) {
      failed = true;
      // fetch() hides the network error in `cause` (e.g. ECONNREFUSED when the VPN proxy is down).
      const cause = error.cause?.code ?? error.cause?.message;
      log(`blog sync failed: ${error.message}${cause ? ` (${cause})` : ""}`);
    }
    schedule(failed ? Math.min(60 * 60_000, untilDaily()) : untilDaily());
  };
  schedule(60_000);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = await syncChannel({ all: process.argv.includes("--all"), force: process.argv.includes("--force") });
  console.log(`${result.read} posts read: ${result.added} added, ${result.updated} updated, ${result.removed} removed; ${result.visible} articles on the site.`);
}

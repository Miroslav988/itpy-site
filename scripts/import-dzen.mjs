// Imports articles from a Yandex Dzen channel into content/blog/*.json.
//
//   npm run blog:import -- https://dzen.ru/<channel>            new articles only
//   npm run blog:import -- https://dzen.ru/<channel> --force    re-import everything
//   npm run blog:import -- --article https://dzen.ru/a/<id>     one article
//   options: --limit N, --out <dir>, --images <dir>
//
// Dzen renders pages with JavaScript, so the script drives a local Chrome over the
// DevTools protocol (set CHROME_PATH if it is not found). Images are downloaded and,
// when cwebp is installed, converted to WebP.

import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBody, shapeTitle, slugify } from "./blog-shape.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const articleUrl = option("--article");
const channelUrl = args.find((arg) => /^https?:\/\//.test(arg) && arg !== articleUrl);
const limit = Number(option("--limit") ?? Infinity);
const force = args.includes("--force");
const outDir = option("--out") ?? join(root, "content/blog");
const imagesDir = option("--images") ?? join(root, "public/blog");

const chromePath =
  process.env.CHROME_PATH ??
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((path) => existsSync(path));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hasCwebp = (() => {
  try {
    execFileSync("cwebp", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

async function openBrowser() {
  if (!chromePath) throw new Error("Chrome not found: set CHROME_PATH");
  const profile = await mkdtemp(join(tmpdir(), "dzen-import-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const chrome = spawn(
    chromePath,
    ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1280,900", "about:blank"],
    { stdio: "ignore" },
  );

  let page;
  for (let attempt = 0; attempt < 50 && !page; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      page = targets.find((target) => target.type === "page");
    } catch {
      await sleep(200);
    }
  }
  if (!page) throw new Error("Chrome did not start");

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve);
    socket.addEventListener("error", reject);
  });

  let lastId = 0;
  const pending = new Map();
  const listeners = new Set();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method) {
      listeners.forEach((listener) => listener(message));
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++lastId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  await send("Page.enable");

  return {
    async goto(url) {
      const loaded = new Promise((resolve) => {
        const listener = (message) => {
          if (message.method !== "Page.loadEventFired") return;
          listeners.delete(listener);
          resolve();
        };
        listeners.add(listener);
        setTimeout(resolve, 30000);
      });
      await send("Page.navigate", { url });
      await loaded;
      await sleep(2000);
    },
    async evaluate(fn, arg = null) {
      const { result } = await send("Runtime.evaluate", {
        expression: `(${fn})(${JSON.stringify(arg)})`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    },
    async close() {
      socket.close();
      const exited = new Promise((resolve) => chrome.once("exit", resolve));
      chrome.kill();
      await exited;
      await rm(profile, { recursive: true, force: true, maxRetries: 5 });
    },
  };
}

// Runs in the channel page: scrolls the feed until no new article links appear.
async function collectArticleLinks(max) {
  const found = new Set();
  let idle = 0;
  while (idle < 4 && found.size < max) {
    const before = found.size;
    for (const link of document.querySelectorAll('a[href*="/a/"]')) {
      const match = link.href.match(/^https:\/\/dzen\.ru\/a\/([\w-]+)/);
      if (match) found.add(`https://dzen.ru/a/${match[1]}`);
    }
    idle = found.size === before ? idle + 1 : 0;
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return [...found].slice(0, max);
}

// Runs in the article page: reduces Dzen markup to the blog's block types.
async function extractArticle() {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  const body = document.querySelector('[data-testid="article-body"]');
  if (!body) return null;

  const meta = (selector) => document.querySelector(selector)?.getAttribute("content") ?? "";
  const unwrap = (href) => {
    if (!href) return undefined;
    try {
      const url = new URL(href, location.origin);
      return url.pathname === "/away" ? (url.searchParams.get("to") ?? undefined) : url.href;
    } catch {
      return undefined;
    }
  };
  const dimensions = (src) =>
    new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve([image.naturalWidth, image.naturalHeight]);
      image.onerror = () => resolve([0, 0]);
      image.src = src;
    });

  const marks = ["bold", "italic", "strike", "code", "href"];
  const inline = (element) => {
    // Only formatting that differs from the block itself counts: Dzen styles whole
    // quotes in italic, and the site applies its own quote style instead.
    const blockStyle = getComputedStyle(element);
    const blockBold = Number(blockStyle.fontWeight) >= 600;
    const blockItalic = blockStyle.fontStyle === "italic";
    const parts = [];
    const walk = (node, current) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) parts.push({ text: node.textContent, ...current });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.tagName === "BR") {
        parts.push({ text: "\n", ...current });
        return;
      }
      const next = { ...current };
      const tag = node.tagName;
      if (tag === "B" || tag === "STRONG") next.bold = true;
      if (tag === "I" || tag === "EM") next.italic = true;
      if (tag === "S" || tag === "DEL") next.strike = true;
      if (tag === "CODE") next.code = true;
      if (tag === "A") {
        const href = unwrap(node.getAttribute("href"));
        if (href) next.href = href;
      }
      if (tag === "SPAN") {
        const style = getComputedStyle(node);
        if (!blockBold && Number(style.fontWeight) >= 600) next.bold = true;
        if (!blockItalic && style.fontStyle === "italic") next.italic = true;
      }
      node.childNodes.forEach((child) => walk(child, next));
    };
    element.childNodes.forEach((child) => walk(child, {}));

    const merged = [];
    for (const part of parts) {
      const last = merged[merged.length - 1];
      if (last && marks.every((mark) => last[mark] === part[mark])) last.text += part.text;
      else merged.push({ ...part });
    }
    if (merged.length) {
      merged[0].text = merged[0].text.trimStart();
      merged[merged.length - 1].text = merged[merged.length - 1].text.trimEnd();
    }
    return merged.filter((part) => part.text);
  };

  const blocks = [];
  for (const element of body.querySelectorAll('[data-testid="article-render__block"]')) {
    const images = [...element.querySelectorAll("img")];
    if (images.length) {
      const caption = element.querySelector('[data-testid="article-image-caption"]')?.textContent.trim() || undefined;
      const seen = new Set();
      for (const image of images) {
        const src = image.currentSrc || image.src;
        const base = src.replace(/\/(scale|smart_crop)_[^/]+$/, "");
        if (!src || seen.has(base)) continue;
        seen.add(base);
        const [width, height] = image.naturalWidth ? [image.naturalWidth, image.naturalHeight] : await dimensions(src);
        blocks.push({ type: "image", src, width, height, alt: image.alt || caption || "", caption });
      }
      continue;
    }

    const tag = element.tagName;
    const list = element.matches("ul, ol") ? element : element.querySelector(":scope > ul, :scope > ol");
    if (/^H[1-6]$/.test(tag)) {
      const text = element.textContent.trim();
      if (text) blocks.push({ type: "heading", level: tag === "H1" || tag === "H2" ? 2 : 3, text });
    } else if (list) {
      blocks.push({ type: "list", ordered: list.tagName === "OL", items: [...list.querySelectorAll(":scope > li")].map(inline) });
    } else if (tag === "BLOCKQUOTE") {
      blocks.push({ type: "quote", content: inline(element) });
    } else if (tag === "PRE" || element.querySelector("pre")) {
      blocks.push({ type: "code", text: (element.querySelector("pre") ?? element).innerText.replace(/\s+$/, "") });
    } else if (tag === "HR" || element.querySelector("hr")) {
      blocks.push({ type: "divider" });
    } else if (tag === "P" || tag === "DIV") {
      const content = inline(element);
      if (content.some((part) => part.text.trim())) blocks.push({ type: "paragraph", content });
    } else {
      blocks.push({ type: "skipped", tag, text: element.innerText.slice(0, 80) });
    }
  }

  return {
    title: document.querySelector('[data-testid="article-title"]')?.textContent.trim() || meta('meta[property="og:title"]'),
    date: meta('meta[itemprop="datePublished"]'),
    description: meta('meta[property="og:description"]'),
    channel: document.querySelector('[data-testid="publisher-block-inline"] a[href]')?.href ?? "",
    blocks,
  };
}

const channelPath = (url) => new URL(url).pathname.replace(/\/+$/, "");

async function saveImage(src, dir, name, [width, height]) {
  const url = src.includes("dzeninfra.ru") ? src.replace(/\/(scale|smart_crop)_[^/]+$/, "/scale_1200") : src;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`image ${response.status}: ${url}`);
  const type = response.headers.get("content-type") ?? "";
  const extension = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
  const original = join(dir, `${name}.${extension}`);
  await writeFile(original, Buffer.from(await response.arrayBuffer()));

  const scaled = width > 1200 ? [1200, Math.round((height * 1200) / width)] : [width, height];
  if (!hasCwebp || extension === "gif" || extension === "webp") return { file: `${name}.${extension}`, size: scaled };
  const resize = width > 1200 ? ["-resize", "1200", "0"] : [];
  execFileSync("cwebp", ["-quiet", "-q", "80", "-metadata", "none", ...resize, original, "-o", join(dir, `${name}.webp`)]);
  await rm(original);
  return { file: `${name}.webp`, size: scaled };
}

const textOf = (block) => (block.content ?? []).map((part) => part.text).join("");
const PROMO = /t\.me\/|телеграм|подписывайтесь|больше разборов/i;

// Brings an ITPY task breakdown to the site's shape (see docs/dzen-article-template.md):
// "#ЕГЭ5" in the title gives the task number, the "Автор: … / Уровень: …" line becomes
// metadata, a "Пробное: …" line becomes the call to action, channel promos are dropped.
function shapeArticle(article) {
  const blocks = article.blocks.filter((block) => block.type !== "skipped");

  const { meta } = normalizeBody({ blocks });

  while (blocks.length) {
    const last = blocks[blocks.length - 1];
    const isPromo = (last.type === "quote" || last.type === "paragraph") && last.content.some((part) => PROMO.test(part.text) || PROMO.test(part.href ?? ""));
    if (!isPromo) break;
    blocks.pop();
  }

  let cta;
  const ctaIndex = blocks.findIndex((block) => (block.type === "paragraph" || block.type === "quote") && /^\s*Пробное:/i.test(textOf(block)));
  if (ctaIndex >= 0) {
    cta = textOf(blocks[ctaIndex]).replace(/^\s*Пробное:\s*/i, "").trim();
    blocks.splice(ctaIndex, 1);
  }

  const { task, title } = shapeTitle(article.title, meta);

  const conditionIndex = blocks.findIndex((block) => block.type === "heading" && /условие/i.test(block.text));
  const lead = blocks.slice(conditionIndex + 1).find((block) => block.type === "paragraph") ?? blocks.find((block) => block.type === "paragraph");
  const leadText = lead ? textOf(lead).replace(/\s+/g, " ").trim() : article.description.replace(/^Статья автора «[^»]*» в Дзене\s*✍?\s*:\s*/u, "").trim();
  const description = leadText.length > 180 ? `${leadText.slice(0, 180).replace(/\s+\S*$/, "")}…` : leadText;

  return { title, task, meta, cta, description, blocks };
}

async function existingPosts() {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(outDir)).filter((file) => file.endsWith(".json"));
  const posts = await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(outDir, file), "utf8"))));
  return new Map(posts.map((post) => [post.source, post]));
}

async function importArticle(browser, url, known, takenSlugs) {
  await browser.goto(url);
  const article = await browser.evaluate(extractArticle);
  if (!article?.title) return console.warn(`  skipped (no article body): ${url}`);
  if (channelUrl && article.channel && channelPath(article.channel) !== channelPath(channelUrl)) {
    return console.warn(`  skipped (another channel): ${url}`);
  }

  const shaped = shapeArticle(article);
  let slug = known.get(url)?.slug ?? slugify(shaped.title);
  if (!known.has(url)) {
    for (let suffix = 2; takenSlugs.has(slug); suffix++) slug = `${slugify(shaped.title)}-${suffix}`;
  }
  takenSlugs.add(slug);

  const dir = join(imagesDir, slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const skipped = article.blocks.filter((block) => block.type === "skipped");
  const blocks = [];
  let imageIndex = 0;
  for (const block of shaped.blocks) {
    if (block.type !== "image") {
      blocks.push(block);
      continue;
    }
    const name = String(++imageIndex).padStart(2, "0");
    const { file, size } = await saveImage(block.src, dir, name, [block.width, block.height]);
    blocks.push({ ...block, src: `/blog/${slug}/${file}`, width: size[0], height: size[1] });
  }
  if (!imageIndex) await rm(dir, { recursive: true, force: true });

  // Dzen's og:image has the title and channel name baked in. Task breakdowns get a
  // uniform "№ N" cover on the site; other articles use their first picture.
  const firstImage = blocks.find((block) => block.type === "image");
  const cover = !shaped.task && firstImage ? { src: firstImage.src, width: firstImage.width, height: firstImage.height } : undefined;

  const post = {
    slug,
    title: shaped.title,
    originalTitle: article.title,
    description: shaped.description,
    date: article.date,
    task: shaped.task,
    meta: shaped.meta,
    cta: shaped.cta,
    cover,
    source: url,
    // A manual "hidden": true survives re-imports.
    hidden: known.get(url)?.hidden,
    blocks,
  };
  await writeFile(join(outDir, `${slug}.json`), `${JSON.stringify(post, null, 2)}\n`);
  console.log(`  ✓ ${slug} (${blocks.length} blocks, ${imageIndex} images${skipped.length ? `, ${skipped.length} skipped: ${skipped.map((block) => block.tag).join(", ")}` : ""})`);
}

if (!articleUrl && !channelUrl) {
  console.error("Usage: npm run blog:import -- <https://dzen.ru/channel> [--force] [--limit N] | --article <https://dzen.ru/a/id>");
  process.exit(1);
}

const browser = await openBrowser();
try {
  const known = await existingPosts();
  const takenSlugs = new Set([...known.values()].map((post) => post.slug));
  let urls = [articleUrl];
  if (!articleUrl) {
    await browser.goto(channelUrl);
    urls = await browser.evaluate(collectArticleLinks, Number.isFinite(limit) ? limit : 1000);
    console.log(`Found ${urls.length} articles on ${channelUrl}`);
  }
  for (const url of urls) {
    if (known.has(url) && !force) {
      console.log(`  = ${known.get(url).slug} (already imported)`);
      continue;
    }
    await importArticle(browser, url, known, takenSlugs);
    await sleep(1500);
  }
} finally {
  await browser.close();
}

// Titles, reposts and text-less posts are settled across the whole blog, not per article.
if (!option("--out")) execFileSync(process.execPath, [join(root, "scripts/reshape-blog.mjs")], { stdio: "inherit" });

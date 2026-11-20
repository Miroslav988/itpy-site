import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

// Runs against the production build (`npm test` builds first) served by `next start`.
const root = fileURLToPath(new URL("..", import.meta.url));
const port = 4100 + Math.floor(Math.random() * 800);
const origin = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
  // BLOG_SYNC=off: the tests must not fetch the channel or write to content/blog.
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd: root, stdio: "ignore", env: { ...process.env, BLOG_SYNC: "off" } });
  for (let attempt = 0; attempt < 150; attempt++) {
    try {
      await fetch(origin);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error("next start did not respond");
});

after(() => server?.kill());

function request(path, headers = {}) {
  return fetch(`${origin}${path}`, { headers: { accept: "text/html", ...headers }, redirect: "manual" });
}

test("server-renders the home page with every section", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /<title>Подготовка к ЕГЭ по информатике — Илья Андрианов · ITPY<\/title>/);
  for (const id of ["formats", "route", "reviews", "about", "environment", "trial", "faq", "contacts"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
  assert.match(html, /href="https:\/\/planerka\.app\/ilandroxy\/first-lesson"/);
});

test("home page follows the spec's content rules", async () => {
  const html = await (await request("/")).text();
  assert.doesNotMatch(html, /ОГЭ/, "ОГЭ is out of the main offer");
  assert.doesNotMatch(html, />\s*999\s*</, "no placeholder figures");
  // The FAQ is Ilia's approved text («90+ … возможно, но балл зависит от ученика»); elsewhere no such claim.
  const outsideFaq = html.replace(/<script[^>]*>.*?<\/script>/gs, "").replace(/id="faq".*?id="trial"/s, "");
  assert.doesNotMatch(outsideFaq, /90\+/, "no unconfirmed 90+ claim");
  assert.equal((html.match(/class="faq-question"/g) ?? []).length, 30, "all 30 FAQ answers are in the HTML");
  assert.doesNotMatch(html, /[Нн]абор (на [^<]* )?открыт/, "no permanent «набор открыт»");
  assert.match(html, /Парные занятия/);
  assert.match(html, /Вебинары/);
  assert.match(html, /2 000 ₽/);
  // Platforms are named generically: «видеосвязь», «канал», «видеоблог».
  assert.doesNotMatch(html.replace(/https?:\/\/\S+?"/g, '"'), /Zoom|Telegram|Телеграм|YouTube/i, "no platform names");
});

test("server-renders the course catalog with Stepik links", async () => {
  const response = await request("/courses");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Курсы по Python и ЕГЭ на Stepik — ITPY<\/title>/);
  assert.match(html, /Каталог на Stepik/);
  assert.match(html, /скоро на Stepik/, "paid cards say where they will be sold");
  // Courses not on Stepik yet are shown with «Позже» instead of a link.
  const soon = html.match(/<article[^>]*aria-labelledby="task-27-title"[\s\S]*?<\/article>/)?.[0] ?? "";
  assert.match(soon, /Курс по заданию 27/);
  assert.match(soon, /aria-disabled="true">Позже</);
  assert.doesNotMatch(soon, /href="https:\/\/stepik/);
  for (const courseId of [203477, 122969, 282248]) {
    assert.match(html, new RegExp(`https://stepik\\.org/course/${courseId}/info`));
  }
});

test("renders the blog index and every imported article", async () => {
  const index = await request("/blog");
  assert.equal(index.status, 200);
  const html = await index.text();
  assert.match(html, /<title>Блог о ЕГЭ по информатике — ITPY<\/title>/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*><span class="nav-label">Блог</);

  const blogDir = new URL("../content/blog/posts/", import.meta.url);
  for (const file of (await readdir(blogDir)).filter((name) => name.endsWith(".json"))) {
    const post = JSON.parse(await readFile(new URL(file, blogDir), "utf8"));
    const page = await request(`/blog/${post.slug}`);
    // Reposts and videos have no page: video cards open the video itself.
    if (post.hidden || post.rubric === "video") {
      assert.equal(page.status, 404, `no page for ${post.slug}`);
      continue;
    }
    assert.equal(page.status, 200, post.slug);
    const article = await page.text();
    assert.match(article, /<h1 id="post-title">/, post.slug);
    assert.doesNotMatch(article, /[Тт]елеграм|Telegram|подписывайтесь/, `channel promo in ${post.slug}`);
  }

  assert.equal((await request("/blog/no-such-article")).status, 404);
});

test("shows each channel rubric with its own cards and serves post pictures", async () => {
  for (const [rubric, cardClass] of [["breakdown", "post-band-breakdown"], ["python", "post-band-python"], ["useful", "post-band-useful"], ["video", "post-band-video"]]) {
    const html = await (await request(`/blog?rubric=${rubric}`)).text();
    assert.match(html, new RegExp(`class="[^"]*${cardClass}`), rubric);
    assert.match(html, /<a[^>]*aria-current="page"[^>]*>/, rubric);
  }
  const breakdowns = await (await request("/blog?rubric=breakdown")).text();
  assert.match(breakdowns, /aria-label="Номер задания ЕГЭ"/);
  // «Показать ещё» opens the next page with the earlier cards still above.
  const firstPage = (breakdowns.match(/class="post-card /g) ?? []).length;
  const secondPage = await (await request("/blog?rubric=breakdown&page=2")).text();
  assert.equal((secondPage.match(/class="post-card /g) ?? []).length, firstPage * 2);
  assert.match(secondPage, /<li id="more">/);
  assert.match(secondPage, /noindex/);
  // A rubric without posts gets no tab.
  assert.doesNotMatch(breakdowns, /rubric=news/);

  const blogDir = new URL("../content/blog/media/", import.meta.url);
  const [picture] = (await readdir(blogDir)).filter((name) => name.endsWith(".jpg"));
  const response = await request(`/blog-media/${picture}`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.equal((await request("/blog-media/..%2Fstate.json")).status, 404);
});

test("serves robots.txt and sitemap.xml for the request host", async () => {
  const forwarded = { "x-forwarded-host": "itpy.example", "x-forwarded-proto": "https" };

  const robots = await request("/robots.txt", forwarded);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/itpy\.example\/sitemap\.xml/);

  const sitemap = await request("/sitemap.xml", forwarded);
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /<loc>https:\/\/itpy\.example\/courses<\/loc>/);
});

function jsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(match, "JSON-LD is missing");
  return JSON.parse(match[1])["@graph"];
}

test("describes pages to search engines with canonical URLs and JSON-LD", async () => {
  const forwarded = { "x-forwarded-host": "itpy.example", "x-forwarded-proto": "https" };

  const home = await (await request("/", forwarded)).text();
  assert.match(home, /<link rel="canonical" href="https:\/\/itpy\.example"/);
  const homeTypes = jsonLd(home).map((node) => node["@type"]);
  for (const type of ["WebSite", "Person", "Service", "FAQPage"]) assert.ok(homeTypes.includes(type), `missing ${type}`);
  assert.ok(!home.includes("aggregateRating"), "no ratings the site cannot back up");

  const courses = await (await request("/courses", forwarded)).text();
  assert.equal(jsonLd(courses).find((node) => node["@type"] === "ItemList").itemListElement.length, 3);

  const blog = await (await request("/blog?task=5", forwarded)).text();
  assert.match(blog, /<title>Задание 5 ЕГЭ по информатике/);
  assert.match(blog, /rel="canonical" href="https:\/\/itpy\.example\/blog\?task=5"/);
  assert.match(await (await request("/blog?task=99", forwarded)).text(), /noindex/);

  const sitemap = await (await request("/sitemap.xml", forwarded)).text();
  assert.match(sitemap, /<loc>https:\/\/itpy\.example\/blog\?task=5<\/loc>/);
  const slug = sitemap.match(/\/blog\/([a-z0-9-]+)<\/loc>/)[1];
  const article = await (await request(`/blog/${slug}`, forwarded)).text();
  assert.equal(jsonLd(article).find((node) => node["@type"] === "TechArticle").url, `https://itpy.example/blog/${slug}`);
});

test("answers unknown addresses with a real 404 page that is not indexed", async () => {
  for (const path of ["/no-such-page", "/blog/no-such-article", "/courses/no-such-course"]) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    const html = await response.text();
    assert.match(html, /Страница не найдена — ITPY/, path);
    assert.match(html, /<meta name="robots" content="noindex/, path);
    assert.doesNotMatch(html, /rel="canonical"/, path);
  }
});

test("publishes the legal documents and links them from every page", async () => {
  const pages = {
    "/offer": [/Публичная оферта/, /Редакция от 20 ноября 2026 г\./, /2 000 рублей за одно Занятие/, /ОГРНИП 324547600178946/, /Мессенджер: \+7 913 468-35-34/],
    "/privacy": [/Политика обработки персональных данных/, /Дата публикации: 20 ноября 2026 г\./, /3\.4\. Файлы cookie и аналитика сайта/, /href="mailto:ilyand98@mail\.ru"/],
    "/consent": [/Согласие на обработку персональных данных/, /<li>фамилия, имя, отчество;<\/li>/],
    "/booking-consent": [/при записи на пробное занятие/, /ООО «ДИПВОЙС»/],
  };
  for (const [path, patterns] of Object.entries(pages)) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    for (const pattern of patterns) assert.match(html, pattern, `${path}: ${pattern}`);
    assert.doesNotMatch(html, /Мессенждер|Платёжные реквизиты:/, path);
  }

  const home = await (await request("/")).text();
  for (const path of ["/offer", "/privacy", "/consent"]) assert.match(home, new RegExp(`href="${path}"`), `footer links ${path}`);
  assert.doesNotMatch(home, /cookie-banner|Настройки cookie/, "no cookie banner without an analytics counter");
  const environment = home.match(/id="environment".*?id="posts"/s)[0];
  assert.doesNotMatch(environment, /class="check"/, "the platform cards have no bullets");

  const sitemap = await (await request("/sitemap.xml")).text();
  assert.match(sitemap, /\/offer<\/loc>/);
});

test("serves llms.txt and lets AI crawlers in", async () => {
  const forwarded = { "x-forwarded-host": "itpy.example", "x-forwarded-proto": "https" };

  const index = await request("/llms.txt", forwarded);
  assert.equal(index.status, 200);
  assert.match(index.headers.get("content-type") ?? "", /^text\/plain/);
  const text = await index.text();
  assert.match(text, /^# ITPY/);
  assert.match(text, /https:\/\/itpy\.example\/llms-full\.txt/);
  assert.match(text, /2 000 ₽/);

  const full = await (await request("/llms-full.txt", forwarded)).text();
  assert.match(full, /## Частые вопросы/);
  assert.match(full, /https:\/\/itpy\.example\/blog\//);

  const robots = await (await request("/robots.txt", forwarded)).text();
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) assert.match(robots, new RegExp(`User-Agent: ${bot}`));
});

test("rejects reviews for courses outside the allowlist", async () => {
  const response = await request("/api/course-reviews?course=1");
  assert.equal(response.status, 400);
});

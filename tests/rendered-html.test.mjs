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
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd: root, stdio: "ignore" });
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
  assert.doesNotMatch(html, /90\+/, "no unconfirmed 90+ claim");
  assert.doesNotMatch(html, /[Нн]абор (на [^<]* )?открыт/, "no permanent «набор открыт»");
  assert.match(html, /Парные занятия/);
  assert.match(html, /Вебинары/);
  assert.match(html, /2 000 ₽/);
});

test("server-renders the course catalog with Stepik links", async () => {
  const response = await request("/courses");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Курсы по Python и ЕГЭ на Stepik — ITPY<\/title>/);
  assert.match(html, /Оплата и обучение проходят на Stepik/);
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

  const blogDir = new URL("../content/blog/", import.meta.url);
  for (const file of (await readdir(blogDir)).filter((name) => name.endsWith(".json"))) {
    const post = JSON.parse(await readFile(new URL(file, blogDir), "utf8"));
    const page = await request(`/blog/${post.slug}`);
    if (post.hidden) {
      assert.equal(page.status, 404, `hidden ${post.slug}`);
      continue;
    }
    assert.equal(page.status, 200, post.slug);
    assert.match(await page.text(), /<h1 id="post-title">/, post.slug);
  }

  assert.equal((await request("/blog/no-such-article")).status, 404);
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

test("rejects reviews for courses outside the allowlist", async () => {
  const response = await request("/api/course-reviews?course=1");
  assert.equal(response.status, 400);
});

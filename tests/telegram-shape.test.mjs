import assert from "node:assert/strict";
import { test } from "node:test";
import { shapePost } from "../scripts/telegram/shape.mjs";

// Posts as the channel's web preview renders them (scripts/telegram/parse.mjs), written by the
// template in docs/telegram-posts.md.
const channel = "informatika_kege_itpy";
const emoji = (char) => `<i class="emoji"><b>${char}</b></i>`;
const tag = (name) => `<a href="?q=%23${encodeURIComponent(name)}">#${name}</a>`;
const post = (html) => ({ id: 9999, date: "2026-11-16T10:00:00+00:00", html, photos: [] });
const text = (parts) => parts.map((part) => part.text).join("");

test("turns a breakdown written by the template into an article", () => {
  const article = shapePost(post([
    `${emoji("🚩")} <b>Разбор номера 25355 ${tag("kege")} по информатике ${tag("ЕГЭ16")}</b>`,
    "Автор: ЕГКР 13.12.25",
    "Уровень: Средний",
    "",
    `${emoji("🚩")} <b>Условие задачи:</b>`,
    "<blockquote>Алгоритм вычисления значения функции F(n), где n — натуральное число, задан соотношениями.</blockquote>",
    `${emoji("👩‍💻")} <b>Код решения:</b>`,
    "<pre><code>print(f(2025) // f(2023))</code></pre>",
    "Ответ: 47",
    "",
    `${emoji("👩‍💻")} <b>Комментарии к коду:</b>`,
    "1️⃣ <code>from functools import lru_cache</code>",
    "подключаем кэш",
    "2️⃣ <code>print(...)</code>",
    "выводим ответ",
    "",
    `${emoji("📱")} <a href="https://dzen.ru/informatika_kege_itpy">Читайте ДЗЕН канал</a>`,
    "Вопросы — в чатик t.me/chat",
  ].join("<br/>")), channel);

  assert.equal(article.rubric, "breakdown");
  assert.equal(article.title, "Задание 16 ЕГЭ: разбор задачи 25355");
  assert.deepEqual(article.meta, { source: "ЕГКР 13.12.25", level: "Средний" });
  assert.equal(article.collection, "КЕГЭ");
  assert.deepEqual(
    article.blocks.filter((block) => block.type === "heading").map((block) => block.text),
    ["Условие задачи", "Код решения", "Комментарии к коду"],
  );
  // Numbered lines in a row, without empty lines between them, are separate items.
  const list = article.blocks.find((block) => block.type === "list");
  assert.deepEqual(list.items.map(text), ["from functools import lru_cache\nподключаем кэш", "print(...)\nвыводим ответ"]);
  const json = JSON.stringify(article);
  assert.doesNotMatch(json, /дзен|dzen|t\.me\/chat/i, "Dzen and channel links stay out");
  assert.doesNotMatch(json, //, "no numbering markers leak into the text");
});

test("keeps posts without a rubric hashtag in the first line out of the blog", () => {
  assert.equal(shapePost(post("Друзья, завтра эфир в 19:00, приходите, будем решать вторую часть вместе со всеми."), channel), undefined);
  // An introduction first and the hashtag further down is not the format.
  const intro = [
    "Делюсь с вами небольшой шпаргалкой по 24 номеру, чтобы вам было чуть проще.",
    "",
    `<b>Библиотека re в Python ${tag("tpy")}</b>`,
    "Модуль re ищет в строке подстроки по шаблону, а findall возвращает все совпадения списком.",
  ];
  assert.equal(shapePost(post(intro.join("<br/>")), channel), undefined);
  // The same post with its header first is an article; a line of emoji before it does not count.
  const article = shapePost(post([emoji("🔥"), ...intro.slice(2), "", intro[0]].join("<br/>")), channel);
  assert.equal(article?.title, "Библиотека re в Python");
});

test("titles a Python post by its hashtag line and drops decorative keycaps", () => {
  const article = shapePost(post([
    `${emoji("🐍")} <b>Срезы строк в Python ${tag("tpy")}</b>`,
    "",
    "*️⃣ <b>Главное:</b> срез берёт часть строки по индексам, начало включается, конец нет.",
    "Шаг можно сделать отрицательным, тогда строка читается с конца.",
  ].join("<br/>")), channel);
  assert.equal(article.rubric, "python");
  assert.equal(article.title, "Срезы строк в Python");
  assert.doesNotMatch(JSON.stringify(article), /|⃣/);
});

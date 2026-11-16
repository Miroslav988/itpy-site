// Turns a channel post (see parse.mjs) into a blog article: picks the rubric by hashtag,
// converts the text to the site's block model and drops channel navigation and promo lines.
// Rubrics and post format: docs/telegram-posts.md.

import { decode } from "./parse.mjs";

const translit = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(title) {
  const words = [...title.toLowerCase()].map((char) => translit[char] ?? char).join("").split(/[^a-z0-9]+/).filter(Boolean);
  let slug = "";
  for (const word of words) {
    if (slug && slug.length + word.length + 1 > 60) break;
    slug = slug ? `${slug}-${word}` : word;
  }
  return slug || "post";
}

// Collections a task comes from, by the hashtag next to "Разбор номера …".
const collections = {
  kege: "КЕГЭ",
  кегэ: "КЕГЭ",
  yandex: "Яндекс",
  statgrad: "СтатГрад",
  polyakov: "К. Поляков",
  reshu: "Решу ЕГЭ",
};

// Lines that only point back to the channel, its chat or bots: the site does not repeat them.
const PROMO = /t\.me\/|telegram|телеграм|@ilandroxx?y|@\w+_bot|чатик|информатика егэ\s*\||кидайте свои вопросы|вся теория для егэ в одном месте|читать статью в notion|please open telegram|view in telegram|подписывайтесь|разбор на любую задачу можно найти|кнопка назад к меню/i;
// The site does not mention Dzen at all ("Смотреть в ДЗЕН", "поддержите наш проект в дзене").
const DZEN = /дзен|дзэн|dzen\.ru|zen\.yandex/i;

const HASHTAG = /#[\p{L}\p{N}_]+/gu;
// "#ЕГЭ17-го задания": a task tag used as a word keeps its number when hashtags are dropped.
// The site names platforms generically ("Смотреть на YouTube" → "Смотреть видео").
const generic = (text) =>
  text
    .replace(/ссылка на (YouTube|ютуб\S*)/gi, "ссылка на видео")
    .replace(/(Смотреть (?:видео|запись))\s*на (?:YouTube|ютубе?)/gi, "$1")
    .replace(/Смотреть\s+на (?:YouTube|ютубе?)/gi, "Смотреть видео")
    .replace(/\bYouTube\b/g, "видео");
const unhash = (text) => text.replace(/#(?:ЕГЭ)?(\d{1,2})(?=-)/giu, "$1").replace(HASHTAG, "");
const KEYCAPS = /^((?:[0-9]\uFE0F?\u20E3|\u{1F51F})+)\s*/u;
// "*\u20E3" and "#\u20E3" are keycaps too, but only decoration.
const DECOR = /^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*]\uFE0F?\u20E3|\uFE0F|\u200D|[\u2190-\u21FF\u2B00-\u2BFF\u2700-\u27BF]|\s)+/u;

// --- HTML of the post text → lines of inline parts ---------------------------------------

function inlines(html) {
  const parts = [];
  const stack = [];
  for (const [, closing, tag, attrs, text] of html.matchAll(/<(\/?)([a-z0-9-]+)([^>]*)>|([^<]+)/gi)) {
    if (text !== undefined) {
      const format = Object.assign({}, ...stack.map((entry) => entry.format));
      const value = decode(text);
      const last = parts.at(-1);
      const same = last && ["bold", "italic", "strike", "code", "href"].every((key) => last[key] === format[key]);
      if (same) last.text += value;
      else parts.push({ text: value, ...format });
      continue;
    }
    const name = tag.toLowerCase();
    if (closing) {
      const index = stack.findLastIndex((entry) => entry.name === name);
      if (index >= 0) stack.splice(index, 1);
      continue;
    }
    const href = name === "a" ? decode(attrs.match(/href="([^"]*)"/)?.[1] ?? "") : "";
    const format =
      name === "b" || name === "strong" ? { bold: true }
      : name === "i" || name === "em" ? { italic: true }
      : name === "s" || name === "del" || name === "strike" ? { strike: true }
      : name === "code" ? { code: true }
      // Hashtag links ("?q=%23…") are channel search, not links.
      : name === "a" && /^https?:/.test(href) ? { href }
      : {};
    if (!/^(br|img|hr)$/.test(name) && !attrs.endsWith("/")) stack.push({ name, format });
  }
  return parts.map((part) => Object.fromEntries(Object.entries(part).filter(([, value]) => value !== undefined)));
}

const textOf = (parts) => parts.map((part) => part.text).join("");
const lineHasPromo = (parts) => {
  const text = parts.map((part) => `${part.text} ${part.href ?? ""}`).join(" ");
  return PROMO.test(text) || DZEN.test(text);
};

function trimParts(parts) {
  const result = parts.map((part) => ({ ...part }));
  while (result.length && !result[0].text.trim()) result.shift();
  while (result.length && !result.at(-1).text.trim()) result.pop();
  if (result.length) {
    result[0].text = result[0].text.trimStart();
    result.at(-1).text = result.at(-1).text.trimEnd();
  }
  return result;
}

function withoutHashtags(parts) {
  return trimParts(parts.map((part) => ({ ...part, text: (part.code ? part.text : generic(unhash(part.text))).replace(/[ \t]{2,}/g, " ") })).filter((part) => part.text));
}

// Splits the post text into elements: text lines, empty lines, code blocks and quotes.
function elements(html) {
  const source = html
    .replace(/<i class="emoji"[^>]*><b>([\s\S]*?)<\/b><\/i>/g, "$1")
    .replace(/<tg-emoji[^>]*>([\s\S]*?)<\/tg-emoji>/g, "$1");
  const stash = [];
  const marked = source
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (match, code) => {
      stash.push({ kind: "code", text: decode(code.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).replace(/\s+$/, "") });
      return `<br/>\uE000${stash.length - 1}\uE000<br/>`;
    })
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (match, inner) => {
      stash.push({ kind: "quote", lines: inner.split(/<br\s*\/?>/).map(inlines) });
      return `<br/>\uE000${stash.length - 1}\uE000<br/>`;
    });
  return marked.split(/<br\s*\/?>/).map((line) => {
    const placeholder = line.match(/^\uE000(\d+)\uE000$/);
    if (placeholder) return stash[Number(placeholder[1])];
    const parts = trimParts(inlines(line));
    return parts.length ? { kind: "line", parts } : { kind: "empty" };
  });
}

// --- Elements → blocks ------------------------------------------------------------------

function cleanLine(parts) {
  if (lineHasPromo(parts)) return [];
  const cleaned = withoutHashtags(parts);
  if (!cleaned.length) return [];
  // Decorative emoji at the start of a line (🚩, 🔥, 👩‍💻 …) are dropped; number keycaps become "1." etc.
  const first = cleaned[0];
  const keycaps = first.text.match(KEYCAPS);
  if (keycaps) {
    const number = keycaps[1].replace(/\u{1F51F}/gu, "10").replace(/[\uFE0F\u20E3]/gu, "");
    first.text = first.text.slice(keycaps[0].length);
    return [{ text: `\uE001${number}\uE001` }, ...trimParts(cleaned)];
  }
  first.text = first.text.replace(DECOR, "");
  const result = trimParts(cleaned.filter((part) => part.text));
  return result.length && /[\p{L}\p{N}]/u.test(textOf(result)) ? result : [];
}

const joinLines = (lines) => lines.flatMap((line, index) => (index ? [{ text: "\n" }, ...line] : line));

function toBlocks(items) {
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
    paragraph = [];
  };
  for (const item of items) {
    if (item.kind === "line") {
      const parts = cleanLine(item.parts);
      if (parts.length) paragraph.push(parts);
    } else if (item.kind === "empty") {
      flush();
    } else if (item.kind === "code") {
      flush();
      if (item.text.trim()) blocks.push({ type: "code", text: item.text });
    } else if (item.kind === "quote") {
      flush();
      const lines = item.lines.map((line) => cleanLine(trimParts(line))).filter((line) => line.length);
      if (lines.length) blocks.push({ type: "quote", lines });
    }
  }
  flush();
  return blocks;
}

const isNumbered = (line) => /^\uE001\d+\uE001$/.test(line[0]?.text ?? "");
const unnumber = (line) => line.filter((part, index) => index > 0 || !isNumbered([part]));

// "1⃣ code ↵ what it does ↵ 2⃣ code ↵ …" with no empty lines between items: every numbered
// line starts its own item, as if the items were separate paragraphs.
function splitNumbered(block) {
  if (block.type !== "paragraph" || !block.lines.slice(1).some(isNumbered)) return [block];
  const groups = [];
  for (const line of block.lines) {
    if (isNumbered(line) || !groups.length) groups.push([line]);
    else groups.at(-1).push(line);
  }
  return groups.map((lines) => ({ type: "paragraph", lines }));
}

// Headings ("Условие задачи:"), numbered explanations ("1⃣ code ↵ what it does") and bullet lists.
function finish(rawBlocks) {
  const blocks = [];
  for (const block of rawBlocks.flatMap(splitNumbered)) {
    if (block.type === "code") {
      blocks.push(block);
      continue;
    }
    if (block.type === "quote") {
      const content = joinLines(block.lines.map((line) => (isNumbered(line) ? [{ text: `${line[0].text.replace(/\uE001/g, "")}. ` }, ...unnumber(line)] : line)));
      const previous = blocks.at(-1);
      if (previous?.type === "list" && previous.ordered) {
        // The explanation of a numbered line, set as a quote under it.
        const explanation = trimParts([{ ...content[0], text: content[0].text.replace(/^[•·▪\-—–]\s*/, "") }, ...content.slice(1)]);
        previous.items.at(-1).push({ text: "\n" }, ...explanation);
      } else if (textOf(content).length < 40 && content.some((part) => part.href)) {
        blocks.push({ type: "paragraph", content });
      } else {
        blocks.push({ type: "quote", content });
      }
      continue;
    }
    const lines = block.lines;
    const text = textOf(lines[0]);
    if (lines.length === 1 && !isNumbered(lines[0]) && /:\s*$/.test(text) && text.length <= 70) {
      blocks.push({ type: "heading", level: 2, text: text.replace(/\s*:\s*$/, "").trim() });
      continue;
    }
    // A heading line followed by its text in the same paragraph.
    if (lines.length > 1 && !isNumbered(lines[0]) && /:\s*$/.test(text) && text.length <= 50 && lines[0].every((part) => part.bold || !part.text.trim() || part.text.trim() === ":")) {
      blocks.push({ type: "heading", level: 2, text: text.replace(/\s*:\s*$/, "").trim() });
      blocks.push(...finish([{ type: "paragraph", lines: lines.slice(1) }]));
      continue;
    }
    if (isNumbered(lines[0])) {
      const number = Number(lines[0][0].text.replace(/\uE001/g, ""));
      const item = joinLines([unnumber(lines[0]), ...lines.slice(1)]);
      const previous = blocks.at(-1);
      // Numbered lines in a row are one list whatever their digits say: the channel's custom
      // emoji sometimes fall back to the wrong keycap ("0⃣" for nine).
      if (previous?.type === "list" && previous.ordered) previous.items.push(item);
      else blocks.push({ type: "list", ordered: true, ...(number > 1 ? { start: number } : {}), items: [item] });
      continue;
    }
    // "Делаем разбор? ↵ - Да ↵ - Нет" is a vote by reactions, which means nothing on the site.
    if (lines.length > 1 && /\?\s*$/.test(text) && lines.slice(1).every((line) => /^[-—–]\s/.test(textOf(line)))) continue;
    if (lines.length > 1 && lines.every((line) => /^[•·▪\-—–]\s/.test(textOf(line)))) {
      blocks.push({ type: "list", ordered: false, items: lines.map((line) => trimParts([{ ...line[0], text: line[0].text.replace(/^[•·▪\-—–]\s*/, "") }, ...line.slice(1)])) });
      continue;
    }
    blocks.push({ type: "paragraph", content: joinLines(lines.map((line) => line.filter((part) => !/^\uE001\d+\uE001$/.test(part.text)))) });
  }
  return blocks;
}

// --- Post → article ---------------------------------------------------------------------

const blockText = (block) =>
  block.type === "heading" ? block.text
  : block.type === "code" ? block.text
  : block.type === "list" ? block.items.map(textOf).join(" ")
  : textOf(block.content ?? []);

const words = (blocks) => blocks.filter((block) => block.type !== "code").map(blockText).join(" ").split(/\s+/).filter(Boolean).length;

export function describe(blocks) {
  const condition = blocks.findIndex((block) => block.type === "heading" && /услови/i.test(block.text));
  const isLead = (block) => (block.type === "paragraph" || block.type === "quote") && blockText(block).split(/\s+/).filter(Boolean).length >= 6;
  const lead = (condition >= 0 ? blocks.slice(condition + 1) : blocks).find(isLead) ?? blocks.find(isLead);
  const text = lead ? blockText(lead).replace(/\s+/g, " ").trim() : "";
  return text.length > 180 ? `${text.slice(0, 180).replace(/\s+\S*$/, "")}…` : text;
}

function cleanTitle(text) {
  const title = unhash(text)
    // A leading keycap is a series number ("2⃣🐢 Turtle…"); inside the text keycaps are digits ("для 2⃣5⃣-го").
    .replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D]*(?:[0-9]\uFE0F?\u20E3|\u{1F51F})+/u, "")
    .replace(/\u{1F51F}/gu, "10")
    .replace(/([0-9])\uFE0F?\u20E3/gu, "$1")
    .replace(/(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\uFE0F|\u200D)/gu, "")
    .replace(/^[\s|:–—,.-]+|[\s|:–—,-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (title.length <= 90) return title;
  // A whole paragraph used as a header: keep its first sentence, or cut at a word.
  const sentence = title.match(/^(.{20,90}?[.!?])(\s|$)/)?.[1]?.replace(/\.$/, "");
  return sentence ?? `${title.slice(0, 80).replace(/\s+\S*$/, "")}…`;
}

const taskRange = (tasks) => (tasks.length > 1 ? `${tasks[0]}–${tasks.at(-1)}` : String(tasks[0]));

// Rubric hashtags: a task number (#ЕГЭ16, or #16 in older posts) or one of these.
const RUBRIC_TAGS = { tpy: "python", useful: "useful", news: "news", новости: "news", view: "video" };
const taskOf = (tag) => {
  const task = Number(tag.match(/^(?:егэ)?(\d{1,2})$/)?.[1]);
  return task >= 1 && task <= 27 ? task : undefined;
};
const isRubricTag = (tag) => Boolean(taskOf(tag) || RUBRIC_TAGS[tag]);

// The rubric of a post comes from its hashtags; posts without one of these stay out of the blog.
export function rubricOf(tags, text, headerTags = new Set()) {
  if (tags.has("реклама") || tags.has("хэштеги") || tags.has("хэштег")) return undefined;
  if ([...tags].some(taskOf) && /разбор|услови/i.test(text)) return "breakdown";
  // When a post carries several rubric tags, the one in its header line wins.
  const own = Object.keys(RUBRIC_TAGS).find((tag) => headerTags.has(tag)) ?? Object.keys(RUBRIC_TAGS).find((tag) => tags.has(tag));
  return own ? RUBRIC_TAGS[own] : undefined;
}

// Returns the article, or undefined when the post is not for the blog.
export function shapePost(post, channel) {
  if (post.poll || post.roundVideo || !post.date) return undefined;
  const items = elements(post.html);
  const allText = decode(post.html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""));
  const tags = new Set([...allText.matchAll(HASHTAG)].map(([tag]) => tag.slice(1).toLowerCase()));

  // The header is the post's first line with words (or a quote at the very top) and gives the
  // title. By the format (docs/telegram-posts.md) it carries the rubric hashtag; a post that
  // opens with anything else, e.g. an introduction with the hashtag further down, stays out.
  const header = items.find((item) => item.kind === "code" || item.kind === "quote" || (item.kind === "line" && /[\p{L}\p{N}]/u.test(textOf(item.parts))));
  const headerText = header?.kind === "quote" ? header.lines.map(textOf).join(" ") : header?.kind === "line" ? textOf(header.parts) : "";
  const headerTags = new Set([...headerText.matchAll(HASHTAG)].map(([tag]) => tag.slice(1).toLowerCase()));
  if (![...headerTags].some(isRubricTag)) return undefined;
  const rubric = rubricOf(tags, allText, headerTags);
  if (!rubric) return undefined;
  const body = items.filter((item) => item !== header);

  // "Автор: … / Уровень: …" lines become metadata.
  const meta = {};
  const rest = body.filter((item) => {
    if (item.kind !== "line") return true;
    const text = textOf(item.parts);
    const author = text.match(/^\s*Автор(?: задачи)?:\s*(.+)$/i)?.[1]?.trim();
    const level = text.match(/Уровень:\s*(.+)$/i)?.[1]?.trim();
    if (author) meta.source = author;
    if (level) meta.level = level;
    return !author && !/^\s*Уровень:/i.test(text);
  });

  const blocks = finish(toBlocks(rest));
  const id = post.id;
  const source = `https://t.me/${channel}/${id}`;
  const date = post.date.slice(0, 10);
  const media = [];
  const addMedia = (url, width, height) => {
    const file = `${id}-${media.length + 1}.jpg`;
    media.push({ url, file });
    return { src: `/blog-media/${file}`, width, height };
  };

  const article = { id, rubric, title: "", description: "", date, source, blocks, media };

  if (rubric === "video") {
    const preview = post.linkPreview;
    const thumb = preview?.image ?? post.video?.thumb ?? post.photos[0]?.url;
    article.title = cleanTitle(headerText) || preview?.title || "Видео";
    article.video = {
      href: preview?.url || post.video?.href || source,
      thumb: thumb ? addMedia(thumb, post.video?.width || 640, post.video?.height || 360) : undefined,
    };
    article.description = describe(blocks);
    return article;
  }

  if (rubric === "breakdown") {
    const tasks = [...new Set([...headerText.matchAll(/#(?:ЕГЭ)?\s?(\d{1,2})(?!\d)/gi)].map((match) => Number(match[1])).filter((n) => n >= 1 && n <= 27))].sort((a, b) => a - b);
    const allTasks = tasks.length ? tasks : [...tags].map((tag) => Number(tag.match(/^(?:егэ)?(\d{1,2})$/)?.[1])).filter((n) => n >= 1 && n <= 27).sort((a, b) => a - b);
    const problem = headerText.match(/номера\s+(\d{3,})/i)?.[1];
    const collection = [...tags].map((tag) => collections[tag]).find(Boolean);
    const label = allTasks.length > 1 ? `Задания ${taskRange(allTasks)}` : `Задание ${allTasks[0]}`;
    const variant = headerText.match(/Разбор\s+([^#|]*?(?:Дальнего Востока|досрочн\S* волны|основн\S* волны|демоверси\S*)[^#|]*)/i)?.[1]?.trim();
    article.task = allTasks[0];
    if (allTasks.length > 1) article.tasks = allTasks;
    if (problem) article.problem = problem;
    if (collection) article.collection = collection;
    article.title =
      problem ? `${label} ЕГЭ: разбор задачи ${problem}`
      : variant ? `${label} ЕГЭ: разбор ${/^(Дальн|досрочн|основн)/i.test(variant) ? "варианта " : ""}${variant}${/\d{4}/.test(variant) ? "" : ` ${date.slice(0, 4)}`}`
      : meta.source ? `${label} ЕГЭ: разбор задачи — ${meta.source}`
      : `${label} ЕГЭ: разбор задачи`;
    // Teasers that only link to a full article elsewhere have nothing to show.
    if (!blocks.some((block) => block.type === "code" || block.type === "quote") && words(blocks) < 40) return undefined;
  } else {
    article.title = cleanTitle(headerText);
    if (article.title.length < 10) {
      const first = blocks.findIndex((block) => block.type === "paragraph");
      if (first >= 0) article.title = cleanTitle(textOf(blocks.splice(first, 1)[0].content).split("\n")[0]);
    }
    if (words(blocks) < 15 && !blocks.some((block) => block.type === "code")) return undefined;
  }
  // Posts about the messenger itself (folders, text formatting) have no place on the site.
  if (/телеграм|telegram/i.test(article.title)) return undefined;
  if (Object.keys(meta).length) article.meta = meta;

  // Photos go first, as in the channel; a video becomes a picture that links to it.
  const pictures = post.photos.map((photo) => ({ type: "image", ...addMedia(photo.url, photo.width, photo.height), alt: article.title }));
  const film = post.video?.thumb ? [{ type: "video", href: source, thumb: addMedia(post.video.thumb, post.video.width, post.video.height) }] : [];
  article.blocks = [...pictures, ...film, ...blocks];
  article.description = describe(blocks) || article.title;
  return article;
}

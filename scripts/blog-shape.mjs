// Naming rules for imported Dzen articles, shared by import-dzen.mjs and reshape-blog.mjs.
// Format of the source titles: docs/dzen-article-template.md.

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

const textOf = (block) => (block.content ?? []).map((part) => part.text).join("");

// Body clean-up that is safe to repeat on stored articles (reshape-blog.mjs runs it again):
// "Автор: … / Уровень: …" lines at the top become metadata, even when split over two
// paragraphs; in "Комментарии к коду" lists the bold line of code becomes code; trailing
// colons are dropped from headings.
export function normalizeBody(post) {
  const meta = { ...(post.meta ?? {}) };
  while (post.blocks[0]?.type === "paragraph" && /^\s*(Автор(?: задачи)?|Уровень):/i.test(textOf(post.blocks[0]))) {
    const line = post.blocks.shift();
    const text = textOf(line);
    const link = line.content.find((part) => part.href);
    const author = text.match(/Автор(?: задачи)?:\s*([^\n]+)/i)?.[1]?.trim();
    if (author && !meta.source) {
      meta.source = (link?.text ?? author).trim();
      if (link?.href) meta.sourceHref = link.href;
    }
    const level = text.match(/Уровень:\s*([^\n]+)/i)?.[1]?.trim();
    if (level) meta.level = level;
  }
  post.meta = Object.keys(meta).length ? meta : undefined;

  let heading = "";
  for (const block of post.blocks) {
    if (block.type === "heading") {
      block.text = block.text.replace(/:\s*$/, "");
      heading = block.text;
    }
    if (block.type === "list" && /код/i.test(heading)) {
      for (const item of block.items) {
        if (item[0]?.bold && (item.length === 1 || item[1]?.text.startsWith("\n"))) item[0] = { text: item[0].text, code: true };
      }
    }
  }
  return post;
}

const isTask = (value) => value >= 1 && value <= 27;

// The ЕГЭ task number, in any of the formats used on the channel over the years:
// "#ЕГЭ5", "№8", "8 номера", or a trailing "#15" hashtag (years like "#2024" are ignored).
export function taskFromTitle(title) {
  const explicit = [/#ЕГЭ\s*(\d{1,2})(?!\d)/i, /№\s*(\d{1,2})(?!\d)/, /(?:^|\s)(\d{1,2})\s+(?:номера|задачи|задания)/i];
  for (const pattern of explicit) {
    const value = Number(title.match(pattern)?.[1]);
    if (isTask(value)) return value;
  }
  const hashtags = [...title.matchAll(/#(\d{1,2})(?!\d)/g)].map((match) => Number(match[1])).filter(isTask);
  return hashtags.at(-1);
}

export function shapeTitle(originalTitle, meta) {
  const raw = originalTitle.replace(/^Читать статью:\s*/, "").trim();
  const task = taskFromTitle(raw);
  if (task) {
    const number = raw.match(/номера\s+(\d{3,})/i)?.[1];
    const wave = raw.match(/#ДВ\s*(20\d\d)|ДВ\s*#?(20\d\d)/i);
    const source = wave ? `досрочной волны ${wave[1] ?? wave[2]}` : /#yandex/i.test(raw) ? "сборника Яндекса" : undefined;
    if (number) return { task, title: `Задание ${task} ЕГЭ: разбор задачи ${number}` };
    if (source) return { task, title: `Задание ${task} ЕГЭ: разбор задачи из ${source}` };
    if (meta?.source) return { task, title: `Задание ${task} ЕГЭ: разбор задачи — ${meta.source}` };
    return { task, title: `Задание ${task} ЕГЭ: разбор задачи` };
  }
  const title = raw
    .replace(/#\S+/g, "")
    .replace(/^(?:\p{Extended_Pictographic}|\u200d|\ufe0f|\s)+/u, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[\s.]+$/, "")
    .trim();
  return { task: undefined, title };
}

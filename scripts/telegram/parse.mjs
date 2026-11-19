// Reads the public web preview of a Telegram channel (https://t.me/s/<channel>) into plain
// data: one object per post with its text as HTML, photos, video, link preview and date.
// The preview needs no login and no API keys; it shows 20 posts per page, newest last.

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === "#") return String.fromCodePoint(code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
    return entities[code.toLowerCase()] ?? match;
  });
}

// The inner HTML of the element whose opening tag starts at `start`, matching nested tags of the same name.
function innerOf(html, start) {
  const tag = html.slice(start + 1).match(/^[a-z-]+/i)[0];
  const open = new RegExp(`<${tag}[\\s>]|</${tag}>`, "gi");
  const bodyStart = html.indexOf(">", start) + 1;
  open.lastIndex = bodyStart;
  let depth = 1;
  for (let match = open.exec(html); match; match = open.exec(html)) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(bodyStart, match.index);
  }
  return html.slice(bodyStart);
}

const styleNumber = (style, name) => Number(style.match(new RegExp(`${name}:\\s*([\\d.]+)`))?.[1] ?? 0);
const styleUrl = (style) => style.match(/url\('([^']+)'\)/)?.[1];

function photos(chunk) {
  return [...chunk.matchAll(/<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*style="([^"]*)"[^>]*>\s*<div class="tgme_widget_message_photo" style="([^"]*)"/g)]
    .map(([, style, inner]) => {
      const width = styleNumber(style, "width");
      return { url: styleUrl(style), width, height: Math.round((width * styleNumber(inner, "padding-top")) / 100) };
    })
    .filter((photo) => photo.url && photo.width && photo.height);
}

function video(chunk) {
  const player = chunk.match(/<a class="tgme_widget_message_video_player[^"]*" href="([^"]+)"[\s\S]*?tgme_widget_message_video_thumb" style="([^"]*)"[\s\S]*?tgme_widget_message_video_wrap" style="([^"]*)"/);
  if (!player) return undefined;
  const width = styleNumber(player[3], "width");
  return { href: player[1], thumb: styleUrl(player[2]), width, height: Math.round((width * styleNumber(player[3], "padding-top")) / 100) };
}

function linkPreview(chunk) {
  const start = chunk.indexOf('<a class="tgme_widget_message_link_preview"');
  if (start < 0) return undefined;
  const tag = chunk.slice(start, chunk.indexOf(">", start));
  const inner = innerOf(chunk, start);
  const image = inner.match(/class="link_preview_(?:right_)?image" style="([^"]*)"/);
  const text = (name) => {
    const found = inner.match(new RegExp(`class="link_preview_${name}[^"]*"[^>]*>([\\s\\S]*?)</div>`));
    return found ? decode(found[1].replace(/<[^>]+>/g, "")).trim() : undefined;
  };
  return { url: decode(tag.match(/href="([^"]+)"/)?.[1] ?? ""), image: image ? styleUrl(image[1]) : undefined, title: text("title"), site: text("site_name") };
}

export function parsePage(html, channel) {
  const posts = [];
  for (const chunk of html.split('<div class="tgme_widget_message_wrap').slice(1)) {
    const id = Number(chunk.match(new RegExp(`data-post="${channel}/(\\d+)"`))?.[1]);
    if (!id) continue;
    // The post's own text, not the quoted text of the post it replies to.
    const textStart = chunk.search(/<div class="tgme_widget_message_text js-message_text"/);
    posts.push({
      id,
      date: chunk.match(/class="tgme_widget_message_date"[^>]*><time datetime="([^"]+)"/)?.[1],
      edited: /tgme_widget_message_meta">edited/.test(chunk),
      html: textStart >= 0 ? innerOf(chunk, textStart) : "",
      photos: photos(chunk),
      video: video(chunk),
      roundVideo: /tgme_widget_message_roundvideo/.test(chunk),
      linkPreview: linkPreview(chunk),
      documents: [...chunk.matchAll(/tgme_widget_message_document_title[^>]*>([^<]*)</g)].map((match) => decode(match[1])),
      poll: /tgme_widget_message_poll/.test(chunk),
    });
  }
  return posts;
}

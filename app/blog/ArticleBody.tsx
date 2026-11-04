import { Fragment, type ReactNode } from "react";
import type { Block, Inline } from "./posts";

// Line breaks inside a block ("code line ↵ explanation") are kept as <br>.
const withBreaks = (text: string) => text.split("\n").flatMap((line, index) => (index ? [<br key={index} />, line] : [line]));

function Inlines({ content }: { content: Inline[] }) {
  return content.map((part, index) => {
    let node: ReactNode = withBreaks(part.text);
    if (part.code) node = <code>{node}</code>;
    if (part.bold) node = <strong>{node}</strong>;
    if (part.italic) node = <em>{node}</em>;
    if (part.strike) node = <s>{node}</s>;
    if (part.href) node = <a href={part.href} target="_blank" rel="noopener noreferrer nofollow">{node}</a>;
    return <Fragment key={index}>{node}</Fragment>;
  });
}

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index}><Inlines content={block.content} /></p>;
          case "heading":
            return block.level === 2 ? <h2 key={index}>{block.text}</h2> : <h3 key={index}>{block.text}</h3>;
          case "list": {
            const items = block.items.map((item, itemIndex) => <li key={itemIndex}><Inlines content={item} /></li>);
            return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>;
          }
          case "quote":
            return <blockquote key={index}><Inlines content={block.content} /></blockquote>;
          case "code":
            return <pre key={index}><code>{block.text}</code></pre>;
          case "image":
            return (
              <figure key={index}>
                <img src={block.src} alt={block.alt} width={block.width} height={block.height} loading="lazy" decoding="async" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case "divider":
            return <hr key={index} />;
        }
      })}
    </div>
  );
}

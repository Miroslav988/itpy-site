import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { pageMetadata } from "../seo";
import { legalDocuments, type LegalDocument } from "./documents";

export const legalMetadata = (document: LegalDocument): Metadata =>
  pageMetadata({ title: `${document.title} — ITPY`, description: document.description, path: document.path });

// E-mail addresses and the site's address become links; «№» stays with its number.
function linkify(text: string): ReactNode[] {
  return text.replace(/№ /g, "№\u00a0").split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+|https:\/\/itpy\.online\/?)/).map((part, index) => {
    if (index % 2 === 0) return part;
    if (part.includes("@")) return <a key={index} href={`mailto:${part}`}>{part}</a>;
    return <Link key={index} href="/">{part}</Link>;
  });
}

// Groups the lines into headings, paragraphs and lists (see app/legal/texts.ts).
function render(text: string[]) {
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    nodes.push(<ul key={`list-${nodes.length}`}>{list.map((item) => <li key={item}>{linkify(item.slice(2))}</li>)}</ul>);
    list = [];
  };
  text.forEach((line, index) => {
    if (line.startsWith("— ")) {
      list.push(line);
      return;
    }
    flush();
    if (line.startsWith("### ")) nodes.push(<h3 key={index}>{line.slice(4)}</h3>);
    else if (line.startsWith("## ")) nodes.push(<h2 key={index}>{line.slice(3)}</h2>);
    else nodes.push(<p key={index}>{linkify(line)}</p>);
  });
  flush();
  return nodes;
}

export default function LegalPage({ document }: { document: LegalDocument }) {
  const others = legalDocuments.filter((other) => other.path !== document.path);
  return (
    <>
      <SiteHeader />
      <main id="top">
        <article className="legal" aria-labelledby="legal-title">
          <div className="container">
            <p className="part-label">Документы</p>
            <h1 id="legal-title">{document.title}</h1>
            {document.lead && <p className="legal-lead">{document.lead}</p>}
            {document.dated.date && <p className="legal-date">{document.dated.label} {document.dated.date}</p>}
            <div className="legal-body">{render(document.text)}</div>
            <nav className="legal-others" aria-label="Другие документы">
              <p className="part-label">Другие документы</p>
              <ul>
                {others.map((other) => <li key={other.path}><Link href={other.path}>{other.short}</Link></li>)}
              </ul>
            </nav>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

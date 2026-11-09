import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { PenUnderline } from "../ui";
import { links } from "../content";
import PostCard from "./PostCard";
import { posts } from "./posts";
import { JsonLd, breadcrumbSchema, pageMetadata } from "../seo";
import { siteOrigin } from "../site";

const PAGE_SIZE = 24;

type Props = { searchParams: Promise<{ task?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const task = Number(params.task) || undefined;
  const page = Number(params.page) || 1;
  const query = new URLSearchParams();
  if (task) query.set("task", String(task));
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  const pageSuffix = page > 1 ? ` — страница ${page}` : "";
  const found = task ? posts.filter((post) => post.task === task).length : posts.length;

  return pageMetadata({
    path: search ? `/blog?${search}` : "/blog",
    title: task
      ? `Задание ${task} ЕГЭ по информатике: разборы с решением на Python${pageSuffix} — ITPY`
      : `Блог о ЕГЭ по информатике${pageSuffix} — ITPY`,
    description: task
      ? `Разборы задания ${task} ЕГЭ по информатике от Ильи Андрианова: условие, решение на Python и комментарии к коду. Статей: ${found}.`
      : "Разборы заданий ЕГЭ по информатике от Ильи Андрианова: условие, решение на Python и комментарии к каждой строке кода.",
    robots: found === 0 ? { index: false, follow: true } : undefined,
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const task = Number(params.task) || undefined;
  const tasks = [...new Set(posts.flatMap((post) => (post.task ? [post.task] : [])))].sort((a, b) => a - b);
  const filtered = task ? posts.filter((post) => post.task === task) : posts;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(params.page) || 1));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const origin = await siteOrigin();
  const trail: Array<[string, string]> = [["Главная", "/"], ["Блог", "/blog"]];
  if (task) trail.push([`Задание ${task}`, `/blog?task=${task}`]);

  const href = (nextTask: number | undefined, nextPage = 1) => {
    const query = new URLSearchParams();
    if (nextTask) query.set("task", String(nextTask));
    if (nextPage > 1) query.set("page", String(nextPage));
    const search = query.toString();
    return search ? `/blog?${search}` : "/blog";
  };

  return (
    <>
      <JsonLd nodes={[breadcrumbSchema(origin, trail)]} />
      <SiteHeader active="blog" />
      <main id="top">
        <section className="page-hero" aria-labelledby="blog-title">
          <div className="container">
            <p className="part-label">ITPY · Блог</p>
            <h1 id="blog-title">{task ? `Задание ${task}: ` : "Статьи и "}<span className="pen-word">разборы<PenUnderline /></span></h1>
            <p className="page-lead">Разборы заданий ЕГЭ по информатике: условие, решение на Python и комментарии к каждой строке кода — из моего канала на Дзене.</p>
          </div>
        </section>

        <section className="section section-white blog-list" aria-label="Статьи">
          <div className="container">
            {posts.length > 0 ? (
              <>
                {tasks.length > 0 && (
                  <nav className="task-filter" aria-label="Номер задания ЕГЭ">
                    <Link href={href(undefined)} aria-current={!task ? "page" : undefined}>Все</Link>
                    {tasks.map((number) => (
                      <Link href={href(number)} key={number} aria-current={task === number ? "page" : undefined}>№ {number}</Link>
                    ))}
                  </nav>
                )}
                <ul className="post-grid">
                  {visible.map((post) => (
                    <li key={post.slug}><PostCard post={post} /></li>
                  ))}
                </ul>
                {pageCount > 1 && (
                  <nav className="pagination" aria-label="Страницы">
                    {page > 1 ? <Link className="btn btn-outline" href={href(task, page - 1)}>← Назад</Link> : <span />}
                    <span>Страница {page} из {pageCount}</span>
                    {page < pageCount ? <Link className="btn btn-outline" href={href(task, page + 1)}>Дальше →</Link> : <span />}
                  </nav>
                )}
              </>
            ) : (
              <div className="blog-empty">
                <p>Статьи скоро появятся. Пока новые материалы выходят в Telegram-канале.</p>
                <a className="btn btn-outline" href={links.telegramChannel} target="_blank" rel="noopener noreferrer">Открыть канал <span aria-hidden="true">↗</span></a>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

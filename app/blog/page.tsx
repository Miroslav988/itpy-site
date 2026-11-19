import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { Icon, PenUnderline, type IconName } from "../ui";
import { Drawing, Strokes } from "../illustrations";
import { links } from "../content";
import PostCard from "./PostCard";
import { getPosts, rubrics, rubricsWithPosts, type Rubric } from "./posts";
import { JsonLd, breadcrumbSchema, pageMetadata } from "../seo";
import { siteOrigin } from "../site";

// «Показать ещё» opens the next page with all the cards above it, so no script is needed.
const PAGE_SIZE = 12;

const tabIcons: Record<Rubric, IconName | "python"> = { breakdown: "code", python: "python", useful: "cap", news: "bell", video: "screenPlay" };

type Params = { rubric?: string; task?: string; page?: string };
type Props = { searchParams: Promise<Params> };

const isRubric = (value: string | undefined): value is Rubric => Boolean(value && value in rubrics);

// A task number implies breakdowns; an unknown rubric shows everything.
function select(params: Params) {
  const task = Number(params.task) || undefined;
  const rubric = task ? "breakdown" : isRubric(params.rubric) ? params.rubric : undefined;
  const posts = getPosts().filter((post) => (!rubric || post.rubric === rubric) && (!task || post.task === task || post.tasks?.includes(task)));
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(params.page) || 1));
  return { task, rubric, posts, page, pageCount };
}

function href({ rubric, task, page = 1 }: { rubric?: Rubric; task?: number; page?: number }) {
  const query = new URLSearchParams();
  if (task) query.set("task", String(task));
  else if (rubric) query.set("rubric", rubric);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `/blog?${search}` : "/blog";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { task, rubric, posts, page } = select(await searchParams);
  const pageSuffix = page > 1 ? ` — страница ${page}` : "";
  return pageMetadata({
    path: href({ rubric, task, page }),
    title: task
      ? `Задание ${task} ЕГЭ по информатике: разборы с решением на Python${pageSuffix} — ITPY`
      : rubric
        ? `${rubrics[rubric].title}${pageSuffix} — блог ITPY`
        : `Блог о ЕГЭ по информатике${pageSuffix} — ITPY`,
    description: task
      ? `Разборы задания ${task} ЕГЭ по информатике от Ильи Андрианова: условие, решение на Python и комментарии к коду. Статей: ${posts.length}.`
      : rubric
        ? `${rubrics[rubric].lead} Блог Ильи Андрианова о подготовке к ЕГЭ по информатике.`
        : "Разборы заданий ЕГЭ по информатике, Python-шпаргалки, варианты и видео от Ильи Андрианова.",
    // Later pages repeat the first one and more, so only the first is indexed.
    robots: posts.length === 0 || page > 1 ? { index: false, follow: true } : undefined,
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const { task, rubric, posts, page, pageCount } = select(await searchParams);
  const all = getPosts();
  const tasks = [...new Set(all.flatMap((post) => (post.rubric === "breakdown" ? post.tasks ?? (post.task ? [post.task] : []) : [])))].sort((a, b) => a - b);
  const shown = posts.slice(0, page * PAGE_SIZE);
  const firstNew = (page - 1) * PAGE_SIZE;

  const heading = task ? `Задание ${task}: разборы` : rubric ? rubrics[rubric].heading : "Статьи и разборы";
  const lastSpace = heading.lastIndexOf(" ");
  const origin = await siteOrigin();
  const trail: Array<[string, string]> = [["Главная", "/"], ["Блог", "/blog"]];
  if (rubric) trail.push([rubrics[rubric].label, href({ rubric })]);
  if (task) trail.push([`Задание ${task}`, href({ task })]);

  return (
    <>
      <JsonLd nodes={[breadcrumbSchema(origin, trail)]} />
      <SiteHeader active="blog" />
      <main id="top">
        <section className="blog" aria-labelledby="blog-title">
          <div className="container">
            <p className="part-label">ITPY · Блог</p>
            <h1 id="blog-title">
              {lastSpace > 0 ? `${heading.slice(0, lastSpace)} ` : ""}
              <span className="pen-word">{heading.slice(lastSpace + 1)}<PenUnderline /><Strokes /></span>
            </h1>
            <p className="page-lead">
              {rubric ? rubrics[rubric].lead : "Разбираю задания ЕГЭ, объясняю Python простым языком и делюсь полезными материалами для подготовки. Всё самое важное — в одном месте."}
            </p>

            {all.length > 0 ? (
              <>
                <nav className="rubric-tabs" aria-label="Рубрики">
                  <Link href="/blog" aria-current={!rubric ? "page" : undefined}><Icon name="grid" />Все материалы</Link>
                  {rubricsWithPosts().map((value) => {
                    const icon = tabIcons[value];
                    return (
                      <Link href={href({ rubric: value })} key={value} aria-current={rubric === value ? "page" : undefined}>
                        {icon === "python" ? <Drawing name="python" className="tab-pic" /> : <Icon name={icon} />}
                        {rubrics[value].label}
                      </Link>
                    );
                  })}
                </nav>
                {(!rubric || rubric === "breakdown") && tasks.length > 0 && (
                  <nav className="task-filter" aria-label="Номер задания ЕГЭ">
                    <span className="task-filter-label">Номер задания:</span>
                    <Link href={href({ rubric })} aria-current={!task ? "page" : undefined}>Все</Link>
                    {tasks.map((number) => (
                      <Link href={href({ task: number })} key={number} aria-current={task === number ? "page" : undefined}>№ {number}</Link>
                    ))}
                  </nav>
                )}
                {shown.length > 0 ? (
                  <ul className="post-grid">
                    {shown.map((post, index) => (
                      <li key={post.slug} id={page > 1 && index === firstNew ? "more" : undefined}><PostCard post={post} /></li>
                    ))}
                  </ul>
                ) : (
                  <p className="blog-empty">Здесь пока ничего нет.</p>
                )}
                {page < pageCount && (
                  <div className="blog-more">
                    <Link className="btn btn-outline btn-lg" href={`${href({ rubric, task, page: page + 1 })}#more`} scroll={false}>
                      Показать ещё материалы <Icon name="chevronDown" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="blog-empty">
                <p>Статьи скоро появятся. Пока новые материалы выходят в канале.</p>
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

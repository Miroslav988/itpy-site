import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import { BookingButton } from "../../booking/Booking";
import ArticleBody from "../ArticleBody";
import PostCard from "../PostCard";
import { ctaText, findPost, formatDate, getPosts, hasPage, readingMinutes, rubrics, taskLabel, type Post } from "../posts";
import { JsonLd, articleSchema, breadcrumbSchema, pageMetadata, personSchema } from "../../seo";
import { siteOrigin } from "../../site";

type Props = { params: Promise<{ slug: string }> };

const firstImage = (post: Post) => post.blocks.find((block) => block.type === "image");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  const image = firstImage(post);
  return pageMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.title} — блог ITPY`,
    description: post.description,
    image: image ? { src: image.src, width: image.width, height: image.height } : undefined,
    openGraph: { type: "article", publishedTime: post.date },
  });
}

export default async function PostPage({ params }: Props) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  // More of the same task first, then of the same rubric.
  const others = getPosts().filter((other) => other.slug !== post.slug && hasPage(other));
  const sameTask = post.task ? others.filter((other) => other.task === post.task) : [];
  const sameRubric = others.filter((other) => other.rubric === post.rubric && !sameTask.includes(other));
  const more = [...sameTask, ...sameRubric].slice(0, 3);
  const origin = await siteOrigin();
  const trail: Array<[string, string]> = [["Главная", "/"], ["Блог", "/blog"], [rubrics[post.rubric].label, `/blog?rubric=${post.rubric}`]];
  if (post.task) trail.push([`Задание ${post.task}`, `/blog?task=${post.task}`]);
  trail.push([post.title, `/blog/${post.slug}`]);

  return (
    <>
      <JsonLd nodes={[personSchema(origin), articleSchema(origin, post), breadcrumbSchema(origin, trail)]} />
      <SiteHeader active="blog" />
      <main id="top">
        <article className="post" aria-labelledby="post-title">
          <div className="container">
            <div className="post-sheet">
              <Link className="post-back" href={`/blog?rubric=${post.rubric}`}>← {rubrics[post.rubric].heading}</Link>
              <p className="post-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} мин чтения
              </p>
              <h1 id="post-title">{post.title}</h1>
              <ul className="post-tags" aria-label="О материале">
                {post.rubric === "breakdown" && post.task ? (
                  (post.tasks ?? [post.task]).map((task) => <li key={task}><Link href={`/blog?task=${task}`}>Задание {task}</Link></li>)
                ) : (
                  <li><Link href={`/blog?rubric=${post.rubric}`}>{rubrics[post.rubric].label}</Link></li>
                )}
                {post.meta?.level && <li>Уровень: {post.meta.level}</li>}
                {post.collection && <li>Сборник: {post.collection}</li>}
                {post.meta?.source && <li>Источник: {post.meta.source}</li>}
              </ul>
              <ArticleBody blocks={post.blocks} />
              <p className="post-source">
                Опубликовано <a href={post.source} target="_blank" rel="noopener noreferrer">в канале ↗</a> — там же можно задать вопрос в комментариях.
              </p>
              <div className="post-cta">
                <p><strong>{ctaText(post)}</strong></p>
                <BookingButton className="btn btn-ink">Записаться на пробное <span aria-hidden="true">→</span></BookingButton>
              </div>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <section className="section post-more" aria-labelledby="more-title">
            <div className="container">
              <h2 id="more-title">{sameTask.length > 0 ? `Ещё разборы задания ${taskLabel(post)}` : `Ещё: ${rubrics[post.rubric].heading.toLowerCase()}`}</h2>
              <ul className="post-grid">
                {more.map((other) => (
                  <li key={other.slug}><PostCard post={other} /></li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import { BookingButton } from "../../booking/Booking";
import ArticleBody from "../ArticleBody";
import PostCard from "../PostCard";
import { ctaText, findPost, formatDate, posts, readingMinutes } from "../posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  const image = post.cover ?? { src: "/og.png", width: 1200, height: 630 };
  return {
    title: `${post.title} — блог ITPY`,
    description: post.description,
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      siteName: "ITPY",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      images: [{ url: image.src, width: image.width, height: image.height, alt: post.title }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  const others = posts.filter((other) => other.slug !== post.slug && !other.draft);
  const sameTask = post.task ? others.filter((other) => other.task === post.task) : [];
  const more = [...sameTask, ...others.filter((other) => !sameTask.includes(other))].slice(0, 3);

  return (
    <>
      <SiteHeader active="blog" />
      <main id="top">
        <article className="post" aria-labelledby="post-title">
          <div className="container">
            <div className="post-sheet">
              <Link className="post-back" href="/blog">← Все статьи</Link>
              <p className="post-meta">
                {post.draft && <span className="draft-badge">черновик</span>}
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} мин чтения
              </p>
              <h1 id="post-title">{post.title}</h1>
              {(post.task || post.meta) && (
                <ul className="post-tags" aria-label="О задаче">
                  {post.task && <li><Link href={`/blog?task=${post.task}`}>Задание {post.task}</Link></li>}
                  {post.meta?.level && <li>Уровень: {post.meta.level}</li>}
                  {post.meta?.source && (
                    <li>
                      {post.meta.sourceHref ? (
                        <a href={post.meta.sourceHref} target="_blank" rel="noopener noreferrer nofollow">Источник: {post.meta.source} ↗</a>
                      ) : <>Источник: {post.meta.source}</>}
                    </li>
                  )}
                </ul>
              )}
              <ArticleBody blocks={post.blocks} />
              {post.source && (
                <p className="post-source">
                  Впервые опубликовано <a href={post.source} target="_blank" rel="noopener noreferrer">на Дзене ↗</a>
                </p>
              )}
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
              <h2 id="more-title">{sameTask.length > 0 ? `Ещё разборы задания ${post.task}` : "Ещё статьи"}</h2>
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

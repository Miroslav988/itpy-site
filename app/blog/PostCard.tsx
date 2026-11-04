import Link from "next/link";
import { formatDate, readingMinutes, type Post } from "./posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      {post.task ? (
        <div className="post-card-placeholder post-card-task" aria-hidden="true">
          <span className="task-label">Задание ЕГЭ</span>
          <span className="task-number">№ {post.task}</span>
        </div>
      ) : post.cover ? (
        <img src={post.cover.src} alt="" width={post.cover.width} height={post.cover.height} loading="lazy" decoding="async" />
      ) : (
        <div className="post-card-placeholder" aria-hidden="true"><span>ITPY · блог</span></div>
      )}
      <div className="post-card-body">
        <p className="post-meta">
          {post.draft && <span className="draft-badge">черновик</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.meta?.level && <> · {post.meta.level}</>} · {readingMinutes(post)} мин
        </p>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.description && <p className="post-card-text">{post.description}</p>}
        <span className="post-card-more" aria-hidden="true">Читать →</span>
      </div>
    </article>
  );
}

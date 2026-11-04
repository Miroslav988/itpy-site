"use client";

import { useRef, useState } from "react";

type Review = {
  id: number;
  userId: number;
  name: string;
  score: number;
  text: string;
};

type Props = { courseId: number; title: string };

function reviewCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  const word = lastTwo >= 11 && lastTwo <= 14 ? "отзывов" : last === 1 ? "отзыв" : last >= 2 && last <= 4 ? "отзыва" : "отзывов";
  return `${count} ${word}`;
}

export default function CourseReviews({ courseId, title }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  async function openReviews() {
    dialogRef.current?.showModal();
    if (status === "ready" || status === "loading") return;
    setStatus("loading");
    try {
      const response = await fetch(`/api/course-reviews?course=${courseId}`);
      if (!response.ok) throw new Error("Reviews unavailable");
      const data = (await response.json()) as { reviews?: Review[] };
      setReviews(data.reviews ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  function move(direction: number) {
    const card = trackRef.current?.querySelector<HTMLElement>(".course-review");
    trackRef.current?.scrollBy({
      left: direction * ((card?.offsetWidth ?? 380) + 16),
      behavior: "smooth",
    });
  }

  return (
    <>
      <button className="btn btn-outline" type="button" onClick={openReviews}>
        Отзывы о курсе <span aria-hidden="true">↗</span>
      </button>
      <dialog className="course-reviews-dialog" ref={dialogRef} aria-label={`Отзывы: ${title}`}>
        <div className="course-reviews-dialog-inner">
          <div className="course-reviews-heading">
            <div>
              <p className="part-label">Оригинальные отзывы на Stepik</p>
              <h2>{title}</h2>
              {status === "ready" && <p className="course-reviews-count">{reviewCount(reviews.length)}</p>}
            </div>
            <form method="dialog"><button className="icon-button" type="submit" aria-label="Закрыть отзывы">×</button></form>
          </div>

          {status === "loading" && <p className="course-reviews-state" role="status">Загружаю отзывы со Stepik…</p>}
          {status === "error" && (
            <p className="course-reviews-state" role="alert">
              Не удалось загрузить отзывы. <a href={`https://stepik.org/course/${courseId}/reviews`} target="_blank" rel="noopener noreferrer">Посмотреть их на Stepik ↗</a>
            </p>
          )}
          {status === "ready" && reviews.length === 0 && <p className="course-reviews-state">На Stepik пока нет отзывов об этом курсе.</p>}
          {status === "ready" && reviews.length > 0 && (
            <>
              <div className="course-review-controls">
                <button className="icon-button" type="button" onClick={() => move(-1)} aria-label="Предыдущий отзыв">←</button>
                <button className="icon-button icon-button-ink" type="button" onClick={() => move(1)} aria-label="Следующий отзыв">→</button>
              </div>
              <div className="course-review-track" ref={trackRef} aria-label={`Отзывы: ${title}`}>
                {reviews.map((review) => (
                  <article className="course-review" key={review.id}>
                    <span className="course-review-stars" aria-label={`${review.score} из 5 звёзд`}>{"★".repeat(Math.max(0, Math.min(5, review.score)))}</span>
                    <p>{review.text}</p>
                    <div>
                      <a className="course-review-author" href={`https://stepik.org/users/${review.userId}`} target="_blank" rel="noopener noreferrer">{review.name}</a>
                      <a href={`https://stepik.org/course/${courseId}/reviews`} target="_blank" rel="noopener noreferrer">Stepik ↗</a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          <p className="course-review-note">
            Отзывы загружаются без изменений со <a href={`https://stepik.org/course/${courseId}/reviews`} target="_blank" rel="noopener noreferrer">Stepik</a>. Авторы указаны; материалы пользователей доступны по лицензии <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
          </p>
        </div>
      </dialog>
    </>
  );
}

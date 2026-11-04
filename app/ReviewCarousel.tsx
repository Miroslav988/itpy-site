"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";
import { reviews } from "./content";

const pad = (value: number) => String(value).padStart(2, "0");

export default function ReviewCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const isOpen = selected !== null;
  const current = selected === null ? null : reviews[selected];

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  function cardStep() {
    const card = trackRef.current?.querySelector<HTMLElement>(".review-card");
    const gap = parseFloat(getComputedStyle(trackRef.current ?? document.body).columnGap) || 16;
    return (card?.offsetWidth ?? 320) + gap;
  }

  function scrollByCards(direction: number) {
    trackRef.current?.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
  }

  function open(index: number) {
    setSelected(index);
    setZoomed(false);
    dialogRef.current?.showModal();
  }

  function step(direction: number) {
    setZoomed(false);
    setSelected((index) => (index === null ? index : (index + direction + reviews.length) % reviews.length));
  }

  function handleKey(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  }

  // A click anywhere outside the picture and the buttons closes the viewer.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target instanceof Element && !event.target.closest("button")) event.currentTarget.close();
  }

  function handleTouchStart(event: TouchEvent<HTMLDialogElement>) {
    touchStartX.current = zoomed ? null : event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDialogElement>) {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1);
  }

  return (
    <div className="reviews">
      <div className="reviews-toolbar">
        <p className="reviews-counter" aria-live="polite">
          <strong>{pad(active + 1)}</strong> / {reviews.length}
        </p>
        <div className="reviews-buttons">
          <button className="icon-button" type="button" aria-label="Предыдущие отзывы" onClick={() => scrollByCards(-1)}>←</button>
          <button className="icon-button icon-button-ink" type="button" aria-label="Следующие отзывы" onClick={() => scrollByCards(1)}>→</button>
        </div>
      </div>

      <ul
        className="review-track"
        ref={trackRef}
        onScroll={(event) => {
          const index = Math.round(event.currentTarget.scrollLeft / cardStep());
          setActive(Math.min(reviews.length - 1, Math.max(0, index)));
        }}
      >
        {reviews.map((review, index) => (
          <li key={review.src}>
            <button className="review-card" type="button" onClick={() => open(index)} aria-label={`Открыть отзыв ${index + 1} из ${reviews.length}`}>
              <img
                src={review.thumb}
                srcSet={`${review.thumb} 720w, ${review.src} ${review.width}w`}
                sizes="(min-width: 700px) 580px, 88vw"
                alt=""
                width={review.width}
                height={review.height}
                loading={index > 1 ? "lazy" : "eager"}
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Escape closes the native <dialog>; arrows switch reviews; the backdrop click is a mouse shortcut. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        className="lightbox"
        ref={dialogRef}
        aria-label={selected === null ? "Отзыв" : `Отзыв ${selected + 1} из ${reviews.length}`}
        onClose={() => setSelected(null)}
        onKeyDown={handleKey}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {current && selected !== null && (
          <>
            <div className="lightbox-top">
              <span className="lightbox-counter">{pad(selected + 1)} / {reviews.length}</span>
              <button className="lightbox-close" type="button" aria-label="Закрыть" onClick={() => dialogRef.current?.close()}>×</button>
            </div>
            <div className={`lightbox-stage${zoomed ? " is-zoomed" : ""}`}>
              <button
                className="lightbox-image"
                type="button"
                aria-label={zoomed ? "Уменьшить отзыв" : "Увеличить отзыв"}
                onClick={() => setZoomed((value) => !value)}
              >
                <img src={current.src} alt={`Отзыв ученика ${selected + 1}`} width={current.width} height={current.height} />
              </button>
            </div>
            <button className="lightbox-arrow lightbox-prev" type="button" aria-label="Предыдущий отзыв" onClick={() => step(-1)}>←</button>
            <button className="lightbox-arrow lightbox-next" type="button" aria-label="Следующий отзыв" onClick={() => step(1)}>→</button>
          </>
        )}
      </dialog>
    </div>
  );
}

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

  // Start on the second review so both neighbours are visible, as in the mockup.
  useEffect(() => {
    const track = trackRef.current;
    if (track && track.scrollLeft === 0) track.scrollLeft = cardStep();
  }, []);

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

  // Cards snap to the centre, so card N is centred at scrollLeft = N * step.
  function goTo(index: number) {
    const target = (index + reviews.length) % reviews.length;
    trackRef.current?.scrollTo({ left: target * cardStep(), behavior: "smooth" });
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
      <div className="reviews-stage">
        <button className="icon-button reviews-arrow reviews-prev" type="button" aria-label="Предыдущий отзыв" onClick={() => goTo(active - 1)}>←</button>
        <ul
          className="review-track"
          ref={trackRef}
          onScroll={(event) => {
            const index = Math.round(event.currentTarget.scrollLeft / cardStep());
            setActive(Math.min(reviews.length - 1, Math.max(0, index)));
          }}
        >
          {reviews.map((review, index) => (
            <li key={review.src} className={index === active ? "is-active" : undefined}>
              <button className="review-card" type="button" onClick={() => open(index)} aria-label={`Открыть отзыв ${index + 1} из ${reviews.length}`}>
                <img
                  src={review.thumb}
                  srcSet={`${review.thumb} 720w, ${review.src} ${review.width}w`}
                  sizes="(min-width: 700px) 560px, 84vw"
                  alt={`Отзыв ученика о подготовке к ЕГЭ по информатике, ${index + 1} из ${reviews.length}`}
                  width={review.width}
                  height={review.height}
                  loading={index > 2 ? "lazy" : "eager"}
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
        <button className="icon-button reviews-arrow reviews-next" type="button" aria-label="Следующий отзыв" onClick={() => goTo(active + 1)}>→</button>
      </div>

      <div className="reviews-dots">
        {reviews.map((review, index) => (
          <button
            className="reviews-dot"
            type="button"
            key={review.src}
            aria-label={`Отзыв ${index + 1} из ${reviews.length}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>

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

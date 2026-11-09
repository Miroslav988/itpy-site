"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";
import { reviews } from "./content";

const pad = (value: number) => String(value).padStart(2, "0");

export default function ReviewCarousel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const stageTouchX = useRef<number | null>(null);
  // Index 1, as in the mockup: Вячеслав in the centre.
  const [active, setActive] = useState(1);
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

  function goTo(index: number) {
    setActive((index + reviews.length) % reviews.length);
  }

  // Signed distance from the current card around the loop: 0 is centred, ±1 are the neighbours.
  function distanceFrom(index: number) {
    const forward = (index - active + reviews.length) % reviews.length;
    return forward > reviews.length / 2 ? forward - reviews.length : forward;
  }

  function handleStageTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (stageTouchX.current === null) return;
    const distance = event.changedTouches[0].clientX - stageTouchX.current;
    stageTouchX.current = null;
    if (Math.abs(distance) > 40) goTo(active + (distance < 0 ? 1 : -1));
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
      <div
        className="reviews-stage"
        onTouchStart={(event) => { stageTouchX.current = event.touches[0].clientX; }}
        onTouchEnd={handleStageTouchEnd}
      >
        <button className="icon-button reviews-arrow reviews-prev" type="button" aria-label="Предыдущий отзыв" onClick={() => goTo(active - 1)}>←</button>
        <ul className="review-track">
          {reviews.map((review, index) => {
            const distance = distanceFrom(index);
            const near = Math.abs(distance) <= 1;
            return (
              <li key={review.src} data-position={near ? distance : distance < 0 ? "far-left" : "far-right"} inert={!near}>
                <button
                  className="review-card"
                  type="button"
                  onClick={() => (distance === 0 ? open(index) : goTo(index))}
                  aria-label={distance === 0 ? `Открыть отзыв ${index + 1} из ${reviews.length}` : `Показать отзыв ${index + 1} из ${reviews.length}`}
                >
                  {/* Cards two steps away are loaded ahead so that switching shows no blank card. */}
                  {Math.abs(distance) <= 2 && (
                    <img
                      src={review.thumb}
                      srcSet={`${review.thumb} 720w, ${review.src} ${review.width}w`}
                      sizes="(min-width: 760px) 520px, 84vw"
                      alt={`Отзыв ученика о подготовке к ЕГЭ по информатике, ${index + 1} из ${reviews.length}`}
                      width={review.width}
                      height={review.height}
                      decoding="async"
                    />
                  )}
                </button>
              </li>
            );
          })}
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

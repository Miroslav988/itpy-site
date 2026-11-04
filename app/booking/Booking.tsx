"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { links, planerkaEmbed } from "../content";

const BookingContext = createContext<() => void>(() => {});

export function BookingProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const openBooking = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Planerka's embed script scans the page for its container when it loads,
    // so it is attached after the container renders and removed on close.
    const script = document.createElement("script");
    script.src = planerkaEmbed.script;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
    };
  }, [open]);

  return (
    <BookingContext.Provider value={openBooking}>
      {children}
      {/* Backdrop click is a mouse shortcut; <dialog> already closes on Escape. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        className="booking-dialog"
        ref={dialogRef}
        aria-labelledby="booking-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="booking-panel">
          <div className="booking-head">
            <div>
              <p className="part-label">Бесплатное пробное · 60 минут</p>
              <h2 id="booking-title">Выбери дату и время</h2>
            </div>
            <button className="icon-button" type="button" onClick={() => dialogRef.current?.close()} aria-label="Закрыть запись">×</button>
          </div>
          <div className="booking-body">
            {open && (
              <div
                className="app-planerka-embed"
                data-planerka-embed="default"
                data-planerka-url={planerkaEmbed.url}
                data-planerka-user={planerkaEmbed.user}
                data-planerka-event={planerkaEmbed.event}
                data-planerka-bg="transparent"
                data-planerka-border-width="0"
                data-planerka-shadow="none"
              />
            )}
          </div>
          <div className="booking-foot">
            <span>Не открывается календарь?</span>
            <a href={links.planerka} target="_blank" rel="noopener noreferrer">Записаться на сайте Планёрки ↗</a>
          </div>
        </div>
      </dialog>
    </BookingContext.Provider>
  );
}

// A real link to Planerka, upgraded to the in-page dialog on a plain click.
export function BookingButton({ className, children }: { className?: string; children: ReactNode }) {
  const openBooking = useContext(BookingContext);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openBooking();
  }

  return (
    <a className={className} href={links.planerka} onClick={handleClick} aria-haspopup="dialog">
      {children}
    </a>
  );
}

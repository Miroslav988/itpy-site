"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { links, planerkaEmbed } from "../content";

type Booking = { open: () => void; warm: () => void };
const BookingContext = createContext<Booking>({ open: () => {}, warm: () => {} });

// The booking page inside the dialog, with the parameters Planerka's own embed script would
// add (planerka.app/assets/external/embed.js), but at its final address: the script and the
// /meet/ path both redirect, which cost two round trips before anything showed.
function frameSrc() {
  const params = new URLSearchParams();
  // As in the embed script, utm_* and prefilled fields (?planerka_name=…) are passed on.
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    if (!value) continue;
    if (key.startsWith("utm_")) params.set(key, value);
    const field = key.replace(/^planerka_/, "");
    if (key !== field && ["name", "email", "phone", "telegram", "notes", "guest"].includes(field)) params.set(field, value);
  }
  params.set("embed", "1");
  params.set("embed_bg", "transparent");
  params.set("embed_border_width", "0");
  params.set("embed_shadow", "none");
  return `${planerkaEmbed.origin}/${planerkaEmbed.user}/${planerkaEmbed.event}?${params}`;
}

// Planerka tells the page how tall its content is (planerka:resize) and when it needs to
// scroll by itself (planerka:enable_scroll, e.g. before a payment page).
function readMessage(data: unknown): { type?: string; height?: number } | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data && typeof data === "object" ? (data as { type?: string; height?: number }) : null;
}

const SLOW_MS = 8000;

export function BookingProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Planerka puts this id into its resize messages.
  const frameId = `planerka-${useId().replace(/[^\w-]/g, "")}`;
  const warmed = useRef(false);
  const [open, setOpen] = useState(false);
  // The calendar starts loading on the first open and then stays, so reopening is instant.
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "slow" | "ready">("loading");
  const [height, setHeight] = useState<number | null>(null);
  const [scrolls, setScrolls] = useState(false);

  // Hovering or focusing a booking button opens the connection to Planerka ahead of the click.
  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = planerkaEmbed.origin;
    document.head.appendChild(link);
  }, []);

  // After a booking Planerka shows its own confirmation screen inside the frame.
  const openBooking = useCallback(() => {
    setSrc((current) => current ?? frameSrc());
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (!src) return;
    const slow = window.setTimeout(() => setStatus((current) => (current === "loading" ? "slow" : current)), SLOW_MS);
    function handleMessage(event: MessageEvent) {
      if (event.origin !== planerkaEmbed.origin || event.source !== frameRef.current?.contentWindow) return;
      const data = readMessage(event.data);
      if (data?.type === "planerka:enable_scroll") setScrolls(true);
      if (data?.type === "planerka:resize" && typeof data.height === "number" && data.height > 0) {
        setHeight(Math.max(data.height, 400));
        setStatus("ready");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.clearTimeout(slow);
      window.removeEventListener("message", handleMessage);
    };
  }, [src]);

  function handleFrameLoad() {
    frameRef.current?.contentWindow?.postMessage({ type: "planerka:init", frameId }, planerkaEmbed.origin);
    setStatus("ready");
  }

  return (
    <BookingContext.Provider value={{ open: openBooking, warm }}>
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
            {src && (
              <div className="booking-frame" data-status={status}>
                {status !== "ready" && (
                  <div className="booking-loader" role="status">
                    <span className="booking-spinner" aria-hidden="true" />
                    <p>Загружаем календарь…</p>
                    {status === "slow" && (
                      <p className="booking-loader-slow">
                        Календарь грузится дольше обычного. <a href={links.planerka} target="_blank" rel="noopener noreferrer">Открыть запись в новой вкладке ↗</a>
                      </p>
                    )}
                  </div>
                )}
                <iframe
                  ref={frameRef}
                  id={frameId}
                  src={src}
                  title="Запись на пробное занятие в Планёрке"
                  scrolling={scrolls ? "auto" : "no"}
                  style={{ height: scrolls ? 900 : (height ?? 760) }}
                  onLoad={handleFrameLoad}
                />
              </div>
            )}
          </div>
          <div className="booking-foot">
            <span>
              Не открывается календарь? <a href={links.planerka} target="_blank" rel="noopener noreferrer">Записаться на сайте Планёрки ↗</a>
            </span>
            <Link href="/privacy" onClick={() => dialogRef.current?.close()}>Обработка персональных данных</Link>
          </div>
        </div>
      </dialog>
    </BookingContext.Provider>
  );
}

// A real link to Planerka, upgraded to the in-page dialog on a plain click.
export function BookingButton({ className, children }: { className?: string; children: ReactNode }) {
  const { open, warm } = useContext(BookingContext);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open();
  }

  return (
    <a
      className={className}
      href={links.planerka}
      onClick={handleClick}
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      aria-haspopup="dialog"
    >
      {children}
    </a>
  );
}

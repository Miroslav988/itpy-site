"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Web analytics (Yandex Metrika) loads only after the visitor allows it, as the privacy policy
// says (section 3.4). Without NEXT_PUBLIC_METRIKA_ID at build time there is no counter, and then
// no banner either. The choice is kept in this browser; «Настройки cookie» in the footer reopens it.

export const metrikaId = Number(process.env.NEXT_PUBLIC_METRIKA_ID) || null;

const KEY = "itpy-cookie-consent";
const OPEN_EVENT = "itpy:cookie-settings";
const CHANGE_EVENT = "itpy:cookie-choice";
type Choice = "granted" | "denied";
type Ym = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // No storage: the choice holds until the page is closed.
    sessionChoice = choice;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

let sessionChoice: Choice | null = null;
const currentChoice = () => readChoice() ?? sessionChoice;
// The server cannot know the choice; the banner appears after hydration.
const serverChoice = () => "unknown" as const;

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function loadMetrika(id: number) {
  const w = window as unknown as { ym?: Ym };
  if (w.ym) return;
  const ym: Ym = (...args) => { (ym.a ??= []).push(args); };
  ym.l = Date.now();
  w.ym = ym;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);
  // defer: page views are sent by hand, so client-side navigation counts too.
  ym(id, "init", { defer: true, webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

// Metrika's own cookies, removed when analytics is turned off again.
function removeMetrikaCookies() {
  const domains = ["", location.hostname, `.${location.hostname.split(".").slice(-2).join(".")}`];
  for (const name of document.cookie.split(";").map((cookie) => cookie.split("=")[0].trim())) {
    if (!name.startsWith("_ym")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export default function CookieConsent() {
  const pathname = usePathname();
  const choice = useSyncExternalStore(subscribe, currentChoice, serverChoice);
  const [reopened, setReopened] = useState(false);
  const lastHit = useRef<string | null>(null);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (!metrikaId || choice !== "granted") return;
    loadMetrika(metrikaId);
    const url = location.href;
    if (lastHit.current === url) return;
    const ym = (window as unknown as { ym: Ym }).ym;
    ym(metrikaId, "hit", url, { referer: lastHit.current ?? document.referrer });
    lastHit.current = url;
  }, [choice, pathname]);

  if (!metrikaId || choice === "unknown" || (choice !== null && !reopened)) return null;

  function decide(next: Choice) {
    const before = choice;
    saveChoice(next);
    setReopened(false);
    if (next === "denied" && before === "granted") {
      // The counter cannot be unloaded from a running page: drop its cookies and start clean.
      removeMetrikaCookies();
      location.reload();
    }
  }

  return (
    <section className="cookie-banner" aria-labelledby="cookie-title">
      <p className="cookie-title" id="cookie-title">Файлы cookie</p>
      <p>
        Мы используем аналитические файлы cookie и аналогичные технологии, чтобы оценивать посещаемость и делать сайт
        удобнее. Аналитика включается после вашего согласия. Вы можете отклонить её или изменить свой выбор в разделе
        «Настройки cookie». Удалить сохранённые файлы cookie можно в настройках браузера. Подробнее — в{" "}
        <Link href="/privacy">Политике обработки персональных данных</Link>.
      </p>
      <div className="cookie-actions">
        <button className="btn btn-lime" type="button" onClick={() => decide("granted")}>Разрешить аналитику</button>
        <button className="btn btn-outline" type="button" onClick={() => decide("denied")}>Отклонить</button>
      </div>
    </section>
  );
}

// «Настройки cookie» in the footer.
export function CookieSettingsButton() {
  if (!metrikaId) return null;
  return (
    <button className="footer-link-button" type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Настройки cookie
    </button>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { PenUnderline } from "./ui";

export const metadata: Metadata = {
  title: "Страница не найдена — ITPY",
  description: "Такой страницы на сайте ITPY нет.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="page-hero not-found" aria-labelledby="not-found-title">
          <div className="container">
            <p className="part-label">Ошибка 404</p>
            <h1 id="not-found-title">Такой страницы <span className="pen-word">нет<PenUnderline /></span></h1>
            <p className="page-lead">Возможно, в адресе опечатка или страница переехала. Начните с главной или загляните в разборы заданий ЕГЭ.</p>
            <div className="actions">
              <Link className="btn btn-ink btn-lg" href="/">На главную <span aria-hidden="true">→</span></Link>
              <Link className="btn btn-outline btn-lg" href="/blog">Разборы заданий</Link>
              <Link className="btn btn-outline btn-lg" href="/courses">Курсы</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

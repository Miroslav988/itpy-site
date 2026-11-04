"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { BookingButton } from "./booking/Booking";
import { links, teacher } from "./content";
import { categories } from "./courses/catalog";

type Page = "home" | "courses" | "blog";
type SiteHeaderProps = { active: Page };

const pages: Array<{ id: Page; href: string; label: string }> = [
  { id: "home", href: "/", label: "Занятия со мной" },
  { id: "courses", href: "/courses", label: "Курсы" },
  { id: "blog", href: "/blog", label: "Блог" },
];

const sectionLinks: Record<Page, Array<{ href: string; label: string }>> = {
  home: [
    { href: "#formats", label: "Форматы и цены" },
    { href: "#route", label: "Как устроена подготовка" },
    { href: "#reviews", label: "Отзывы учеников" },
    { href: "#about", label: "Обо мне" },
    { href: "#posts", label: "Разборы заданий" },
    { href: "#faq", label: "Частые вопросы" },
    { href: "#trial", label: "Пробное занятие" },
  ],
  courses: [
    ...categories.map((category) => ({ href: `#${category.id}`, label: category.title })),
    { href: "#help", label: "Занятия со мной" },
  ],
  blog: [],
};

export default function SiteHeader({ active }: SiteHeaderProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const avatarDialogRef = useRef<HTMLDialogElement>(null);
  const avatarDialogId = useId();
  const closeMenu = () => { if (menuRef.current) menuRef.current.open = false; };

  useEffect(() => {
    function dismissMenu(event: PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) closeMenu();
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && menuRef.current?.open) {
        closeMenu();
        menuRef.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismissMenu);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", dismissMenu);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const menuLabel = { home: "Разделы главной страницы", courses: "Разделы каталога курсов", blog: "Меню сайта" }[active];

  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <div className="header-profile">
            <button
              className="header-avatar"
              type="button"
              aria-label={`Открыть фото: ${teacher.name}`}
              aria-haspopup="dialog"
              aria-controls={avatarDialogId}
              onClick={() => {
                closeMenu();
                avatarDialogRef.current?.showModal();
              }}
            >
              <img src={teacher.photo.src} alt="" width={teacher.photo.width} height={teacher.photo.height} />
            </button>
            <div className="header-profile-copy">
              <Link className="header-name" href="/">{teacher.name}</Link>
              <span className="header-role">{teacher.role}</span>
            </div>
          </div>

          <nav className="header-nav" aria-label="Основная навигация">
            {pages.map((page) => (
              <Link href={page.href} key={page.id} aria-current={active === page.id ? "page" : undefined}>
                <span className="nav-label">{page.label}</span>
              </Link>
            ))}
            <a href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">
              <span className="nav-label">Telegram</span> <span aria-hidden="true">↗</span>
            </a>
          </nav>

          <div className="header-actions">
            <BookingButton className="btn btn-lime header-cta">
              <span className="label-long">Записаться на пробное</span>
              <span className="label-short">Пробное</span>
            </BookingButton>
            <details className="header-menu" ref={menuRef}>
              <summary aria-label={menuLabel}>
                <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
              </summary>
              <nav className="header-menu-panel" aria-label={menuLabel}>
                <div className="header-menu-main">
                  {pages.map((page) => (
                    <Link href={page.href} key={page.id} onClick={closeMenu} aria-current={active === page.id ? "page" : undefined}>
                      <span className="nav-label">{page.label}</span>
                    </Link>
                  ))}
                  <a href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">Telegram ↗</a>
                </div>
                {sectionLinks[active].length > 0 && (
                  <ol className="header-menu-sections">
                    {sectionLinks[active].map((section) => (
                      <li key={section.href}>
                        <a href={section.href} onClick={closeMenu}>{section.label}</a>
                      </li>
                    ))}
                  </ol>
                )}
              </nav>
            </details>
          </div>
        </div>
      </header>

      {/* Backdrop click is a mouse shortcut; <dialog> already closes on Escape. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        className="photo-dialog"
        id={avatarDialogId}
        ref={avatarDialogRef}
        aria-label={`Фото: ${teacher.name}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) avatarDialogRef.current?.close();
        }}
      >
        <div className="photo-dialog-bar">
          <span>{teacher.name}</span>
          <button className="icon-button" type="button" aria-label="Закрыть фото" onClick={() => avatarDialogRef.current?.close()}>×</button>
        </div>
        <img src={teacher.photo.src} alt={`${teacher.name} за рабочим столом`} width={teacher.photo.width} height={teacher.photo.height} />
      </dialog>
    </>
  );
}

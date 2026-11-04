import Link from "next/link";
import { links } from "./content";

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contacts">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="logo" href="/"><span className="logo-mark" aria-hidden="true" />ITPY</Link>
          <p>Подготовка к ЕГЭ по информатике с Ильёй Андриановым. Материалы — в канале, вопросы по занятиям — в личных сообщениях.</p>
        </div>
        <nav className="footer-col" aria-label="Связь">
          <p className="part-label">Связь</p>
          <a href={links.telegramChannel} target="_blank" rel="noopener noreferrer">Telegram-канал ↗</a>
          <a href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">Написать Илье ↗</a>
        </nav>
        <nav className="footer-col" aria-label="Сайт">
          <p className="part-label">Сайт</p>
          <Link href="/#formats">Занятия со мной</Link>
          <Link href="/courses">Курсы на Stepik</Link>
          <Link href="/blog">Блог</Link>
        </nav>
        <nav className="footer-col" aria-label="Документы">
          <p className="part-label">Документы</p>
          <a href={links.diploma} target="_blank" rel="noopener noreferrer">Диплом ↗</a>
          <a href={links.officialDocs} target="_blank" rel="noopener noreferrer">Работаю как ИП ↗</a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ITPY</span>
        <a href="#top">Наверх ↑</a>
      </div>
    </footer>
  );
}

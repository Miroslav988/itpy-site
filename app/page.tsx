import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ReviewCarousel from "./ReviewCarousel";
import { BookingButton } from "./booking/Booking";
import { Check, Icon, PenUnderline, SectionHead } from "./ui";
import { aboutFacts, environment, faqs, features, formats, heroFacts, heroFormats, links, pairsNote, steps, teacher } from "./content";
import PostCard from "./blog/PostCard";
import { commentedBreakdown, posts } from "./blog/posts";
import { JsonLd, faqSchema, pageMetadata, personSchema, servicesSchema, websiteSchema } from "./seo";
import { siteOrigin } from "./site";

const latestPosts = posts.filter((post) => !post.draft).slice(0, 3);
const commentedExample = commentedBreakdown();

export const metadata = pageMetadata({
  path: "/",
  title: "Подготовка к ЕГЭ по информатике — Илья Андрианов · ITPY",
  description:
    "Онлайн-подготовка к ЕГЭ по информатике с Ильёй Андриановым: занятия в паре, вебинары и курсы на Stepik. Разборы заданий на Python, бесплатное пробное занятие.",
});

export default async function Home() {
  const origin = await siteOrigin();

  return (
    <>
      <JsonLd nodes={[websiteSchema(origin), personSchema(origin), ...servicesSchema(origin), faqSchema(origin)]} />
      <SiteHeader active="home" />
      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="tag">ЕГЭ по информатике · 10–11 класс</p>
              <h1 id="hero-title">
                Информатика, которую <span className="pen-word">понимаешь<PenUnderline /></span>
              </h1>
              <p className="hero-lead">
                <strong>Я Андрианов Илья,</strong> преподаватель с многолетним опытом, который помогает успешно сдавать ЕГЭ
                по информатике своим ученикам <mark>с 2019 года.</mark>
              </p>
              <div className="actions">
                <a className="btn btn-ink btn-lg hero-lesson" href={links.freeLesson} target="_blank" rel="noopener noreferrer">
                  <span>Получить запись урока<br />и оценку уровня знаний</span> <span aria-hidden="true">→</span>
                </a>
                <a className="btn btn-outline btn-lg" href="#formats">Форматы и цены</a>
              </div>
            </div>

            <img
              className="hero-photo"
              src={teacher.cutout.src}
              alt={teacher.name}
              width={teacher.cutout.width}
              height={teacher.cutout.height}
              fetchPriority="high"
            />

            <aside className="sheet hero-card" aria-labelledby="hero-card-title">
              <span className="sheet-corners" aria-hidden="true" />
              <p className="hero-card-tag"><Icon name="cap" /> Я не онлайн-школа</p>
              <h2 id="hero-card-title">Занятия веду лично я —<br />Андрианов Илья</h2>
              <p className="part-label">Форматы работы</p>
              <ul className="hero-formats">
                {heroFormats.map((item) => (
                  <li key={item.title}>
                    <span className="feature-icon"><Icon name={item.icon} /></span>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <ul className="hero-facts">
              {heroFacts.map((fact) => (
                <li key={fact.title}>
                  <span className="feature-icon"><Icon name={fact.icon} /></span>
                  <strong>{fact.title}</strong>
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-white" id="formats" aria-labelledby="formats-title">
          <div className="container">
            <SectionHead
              id="formats-title"
              part="Часть 1 · Форматы и цены"
              title="Три формата подготовки к ЕГЭ"
              lead="Выбирайте удобный формат подготовки под свои цели, график и уровень — от занятий в паре до вебинаров со мной и готовых курсов в записи."
            />
            <div className="formats">
              {formats.map((format) => (
                <article className="format" id={format.id} key={format.id} aria-labelledby={`${format.id}-title`}>
                  <div className="format-head">
                    <h3 id={`${format.id}-title`}>{format.title}</h3>
                    {format.subtitle && <p className="format-subtitle">{format.subtitle}</p>}
                    <p className="format-meta">{format.meta}</p>
                  </div>
                  <dl className="format-rows">
                    {format.rows.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="format-price">
                    <strong>{format.price}</strong>
                    {format.priceNote && <span>{format.priceNote}</span>}
                  </p>
                  {format.action === "booking" && (
                    <BookingButton className="btn btn-ink btn-wide">{format.actionLabel} <span aria-hidden="true">→</span></BookingButton>
                  )}
                  {format.action === "telegram" && (
                    <a className="btn btn-outline btn-wide" href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">
                      {format.actionLabel} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {format.action === "courses" && (
                    <Link className="btn btn-outline btn-wide" href="/courses">{format.actionLabel} <span aria-hidden="true">→</span></Link>
                  )}
                </article>
              ))}
            </div>
            <p className="section-note">
              <Icon name="info" />
              <span><strong>Парные занятия.</strong> {pairsNote}</span>
            </p>
          </div>
        </section>

        <section className="section" id="route" aria-labelledby="route-title">
          <div className="container">
            <SectionHead
              id="route-title"
              part="Часть 2 · Как устроена подготовка"
              title={<>Комплексная подготовка <mark>по чёткому плану</mark></>}
              lead={<>Понятный маршрут и системная работа без случайных тем и <strong>лишней теории</strong>.</>}
            />
            <ol className="steps">
              {steps.map((step, index) => (
                <li className={index === steps.length - 1 ? "step step-finish" : "step"} key={step.title}>
                  <span className="step-number" aria-hidden="true">{index + 1}</span>
                  <Icon name={step.icon} className="icon step-icon" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <ul className="features">
              {features.map((feature) => (
                <li key={feature.title}>
                  <span className="feature-icon"><Icon name={feature.icon} /></span>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
            <p className="section-note">
              <Icon name="info" />
              <span><strong>Этот маршрут — для регулярной подготовки со мной (пары и вебинары).</strong> Курсы в записи на Stepik имеют собственные программы.</span>
            </p>
          </div>
        </section>

        <section className="section section-white" id="reviews" aria-labelledby="reviews-title">
          <div className="container">
            <SectionHead
              id="reviews-title"
              part="Часть 3 · Отзывы учеников"
              title={<>150+ отзывов <mark>на Авито</mark></>}
              lead={
                <>
                  Реальные отзывы от учеников и родителей на моём профиле{" "}
                  {links.avito ? <a href={links.avito} target="_blank" rel="noopener noreferrer"><strong>Авито</strong></a> : <strong>Авито</strong>}.
                </>
              }
            />
            <ReviewCarousel />
            {links.avito && (
              <div className="section-more reviews-more">
                <a className="btn btn-ink btn-lg" href={links.avito} target="_blank" rel="noopener noreferrer">Посмотреть все отзывы на Авито <span aria-hidden="true">↗</span></a>
              </div>
            )}
          </div>
        </section>

        <section className="section" id="about" aria-labelledby="about-title">
          <div className="container about-grid">
            <figure className="polaroid">
              <img src={teacher.portrait.src} alt={`${teacher.name} за рабочим столом`} width={teacher.portrait.width} height={teacher.portrait.height} loading="lazy" decoding="async" />
              <figcaption>
                <span className="polaroid-nick">Мой ник — <mark>@ilandroxxy</mark></span>
                <span className="polaroid-social">Ищите меня в соцсетях:<br />YouTube · VK · TikTok</span>
              </figcaption>
            </figure>
            <div className="about-copy">
              <p className="part-label">Часть 4 · О преподавателе</p>
              <h2 id="about-title">Занятия веду сам</h2>
              <p className="section-lead">
                <strong>ITPY</strong> — мой авторский проект по подготовке к ЕГЭ по информатике. Я лично разрабатываю программу,
                провожу занятия и подбираю задания, которые помогают не просто запоминать решения, а действительно понимать информатику.
              </p>
              <ul className="checklist">
                <li><Check />Лично провожу занятия</li>
                <li><Check />Записи занятий доступны для повторения</li>
                <li><Check />Помогаю на занятиях, а между ними на вопросы отвечают кураторы</li>
              </ul>
              <dl className="form-table">
                {aboutFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.value}
                      {fact.link && <> · <a href={fact.link.href} target="_blank" rel="noopener noreferrer">{fact.link.label} ↗</a></>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="section section-white" id="environment" aria-labelledby="environment-title">
          <div className="container">
            <SectionHead
              id="environment-title"
              part="Часть 5 · Где проходит обучение"
              title={<>Материалы и поддержка <mark>на всём пути подготовки</mark></>}
              lead="Занятия, домашние задания и поддержка всегда под рукой."
            />
            <ul className="env-grid">
              {environment.map((item) => (
                <li className="env-card" key={item.name}>
                  <div className="env-head">
                    <img src={item.icon} alt="" width={40} height={40} loading="lazy" />
                    <p className="env-role">{item.role}</p>
                    <h3>{item.name}</h3>
                  </div>
                  {item.text && <p>{item.text}</p>}
                  {item.points && (
                    <ul className="env-points">
                      {item.points.map((point) => <li key={point}><Check />{point}</li>)}
                    </ul>
                  )}
                  {item.link.external ? (
                    <a href={item.link.href} target="_blank" rel="noopener noreferrer">{item.link.label}</a>
                  ) : (
                    <Link href={item.link.href}>{item.link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className="section" id="posts" aria-labelledby="posts-title">
            <div className="container">
              <SectionHead
                id="posts-title"
                part="Часть 6 · Разборы заданий"
                title="Так я объясняю задачи ЕГЭ"
                lead={<>Подробные разборы заданий ЕГЭ: от условия до готового решения. Объясняю <strong>логику</strong>, показываю <strong>способы решения</strong> и разбираю <strong>сложные моменты</strong>.</>}
              />
              <ul className="post-grid">
                {latestPosts.map((post) => (
                  <li key={post.slug}><PostCard post={post} /></li>
                ))}
              </ul>
              <div className="section-more">
                <Link className="btn btn-outline" href="/blog">Все разборы <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>
        )}

        <section className="section section-white" id="faq" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <div className="faq-side">
              <p className="part-label">Часть 7 · Вопросы</p>
              <h2 id="faq-title">Часто спрашивают</h2>
              <div className="faq-contact">
                <strong>Не нашли свой вопрос?</strong>
                <p>Напишите в Telegram — отвечу лично.</p>
                <a className="btn btn-outline" href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">Написать Илье <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => (
                <details key={item.q} open={index === 0}>
                  <summary>
                    <span className="faq-number" aria-hidden="true">{index + 1}</span>
                    <span className="faq-question">{item.q}</span>
                    <span className="faq-sign" aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                  {item.showsCommentedExample && commentedExample && (
                    <p className="faq-example">
                      Как это выглядит — в разборе{" "}
                      <Link href={`/blog/${commentedExample.slug}`}>«{commentedExample.title}»</Link>: каждая строка кода объяснена отдельно.
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="trial" id="trial" aria-labelledby="trial-title">
          <div className="container trial-grid">
            <div>
              <p className="part-label">Часть 8 · Первый шаг · бесплатно</p>
              <h2 id="trial-title">Начнём с пробного занятия</h2>
              <p className="section-lead">Знакомство онлайн, около 60 минут. Можно прийти с родителем.</p>
              <div className="actions">
                <BookingButton className="btn btn-lime btn-lg">Выбрать дату и время <span aria-hidden="true">→</span></BookingButton>
              </div>
            </div>
            <ol className="trial-steps">
              <li><Check /><span><strong>Определим уровень</strong>Обсудим цель и то, что пока вызывает трудности.</span></li>
              <li><Check /><span><strong>Порешаем вместе</strong>Увидишь, как я объясняю, и оценишь подход.</span></li>
              <li><Check /><span><strong>Составим план и выберем формат</strong>Пара или вебинар — с учётом времени до экзамена.</span></li>
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

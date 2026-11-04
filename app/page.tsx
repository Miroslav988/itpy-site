import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import ReviewCarousel from "./ReviewCarousel";
import { BookingButton } from "./booking/Booking";
import { AnswerCells, Check, PenUnderline, SectionHead } from "./ui";
import { answerSheet, environment, faqs, features, formats, links, metrics, reviews, steps, teacher } from "./content";
import PostCard from "./blog/PostCard";
import { commentedBreakdown, posts } from "./blog/posts";

const latestPosts = posts.filter((post) => !post.draft).slice(0, 3);
const commentedExample = commentedBreakdown();

export const metadata: Metadata = {
  title: "Подготовка к ЕГЭ по информатике — Илья Андрианов · ITPY",
  description:
    "Парные занятия и вебинары по ЕГЭ по информатике. Занятия ведёт Илья Андрианов: объясняет сложное человеческим языком и сам проверяет практику. Бесплатное пробное занятие.",
};

function yearsLabel(years: number) {
  const lastTwo = years % 100;
  const last = years % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${years} лет`;
  if (last === 1) return `${years} год`;
  if (last >= 2 && last <= 4) return `${years} года`;
  return `${years} лет`;
}

export default function Home() {
  return (
    <>
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
                Я — {teacher.name}. Готовлю к ЕГЭ по информатике в парах и на вебинарах: сам веду занятия,
                проверяю практику и объясняю сложное человеческим языком.
              </p>
              <div className="actions">
                <BookingButton className="btn btn-ink btn-lg">Бесплатное пробное занятие <span aria-hidden="true">→</span></BookingButton>
                <a className="btn btn-outline btn-lg" href="#formats">Форматы и цены</a>
              </div>
              {metrics.length > 0 && (
                <dl className="metrics">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <aside className="sheet" aria-label="Бланк ответов">
              <span className="sheet-corners" aria-hidden="true" />
              <p className="sheet-title">Бланк ответов № 1 · Информатика</p>
              <ol className="sheet-list">
                {answerSheet.map((item) => (
                  <li key={item.question}>
                    <p>{item.question}</p>
                    <AnswerCells text={item.answer} />
                  </li>
                ))}
                <li>
                  <p>С чего начать?</p>
                  <div className="sheet-answer">
                    <BookingButton className="cell-link">с бесплатного пробного →</BookingButton>
                    <span className="pen-note" aria-hidden="true">верно!</span>
                  </div>
                </li>
              </ol>
            </aside>
          </div>
        </section>

        <section className="section section-white" id="formats" aria-labelledby="formats-title">
          <div className="container">
            <SectionHead
              id="formats-title"
              part="Часть 1 · Форматы и цены"
              title="Два формата подготовки к ЕГЭ"
              lead="Маршрут подготовки один — отличаются размер группы, внимание на уроке и стоимость."
            />
            <div className="formats">
              {formats.map((format) => (
                <article className={`format${format.featured ? " format-featured" : ""}`} id={format.id} key={format.id} aria-labelledby={`${format.id}-title`}>
                  <div className="format-head">
                    <span className="badge">{format.badge}</span>
                    <span className="format-meta">{format.meta}</span>
                  </div>
                  <h3 id={`${format.id}-title`}>{format.title}</h3>
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
                  {format.note && <p className="format-note">{format.note}</p>}
                  {format.action === "booking" ? (
                    <BookingButton className="btn btn-ink btn-wide">{format.actionLabel} <span aria-hidden="true">→</span></BookingButton>
                  ) : (
                    <a className="btn btn-outline btn-wide" href={links.telegramPersonal} target="_blank" rel="noopener noreferrer">
                      {format.actionLabel} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="route" aria-labelledby="route-title">
          <div className="container">
            <SectionHead
              id="route-title"
              part="Часть 2 · Как устроена подготовка"
              title={<>Учёба без режима <mark>«ничего не понимаю»</mark></>}
              lead="Понятный маршрут вместо случайных уроков и надежды, что всё сложится само."
            />
            <ol className="steps">
              {steps.map((step, index) => (
                <li className={index === steps.length - 1 ? "step step-finish" : "step"} key={step.title}>
                  <span className="step-number" aria-hidden="true">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <ul className="features">
              {features.map((feature) => (
                <li key={feature.title}>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-white" id="reviews" aria-labelledby="reviews-title">
          <div className="container">
            <SectionHead
              id="reviews-title"
              part="Часть 3 · Проверено учениками"
              title={`${reviews.length} отзывов учеников`}
              lead="Нажмите на отзыв, чтобы открыть его крупно."
            />
            <ReviewCarousel />
          </div>
        </section>

        <section className="section" id="about" aria-labelledby="about-title">
          <div className="container about-grid">
            <figure className="polaroid">
              <img src={teacher.photo.src} alt={`${teacher.name} за рабочим столом`} width={teacher.photo.width} height={teacher.photo.height} loading="lazy" decoding="async" />
              <figcaption>на связи и между уроками</figcaption>
            </figure>
            <div className="about-copy">
              <p className="part-label">Часть 4 · Сведения о преподавателе</p>
              <h2 id="about-title">Занятия веду сам</h2>
              <p className="section-lead">ITPY — мой проект, а не онлайн-школа. От первой встречи до экзамена вы общаетесь напрямую со мной.</p>
              {teacher.story && <p className="about-story">{teacher.story}</p>}
              <ul className="checklist">
                <li><Check />Лично веду каждое занятие</li>
                <li><Check />Сам проверяю практику и разбираю ошибки</li>
                <li><Check />Отвечаю на вопросы напрямую</li>
              </ul>
              <dl className="form-table">
                <div>
                  <dt>Ф. И. О.</dt>
                  <dd className="handwritten">{teacher.name.split(" ").reverse().join(" ")}</dd>
                </div>
                <div>
                  <dt>Образование</dt>
                  <dd>{teacher.education} · <a href={links.diploma} target="_blank" rel="noopener noreferrer">диплом ↗</a></dd>
                </div>
                {teacher.experienceYears !== null && (
                  <div>
                    <dt>Опыт</dt>
                    <dd>{yearsLabel(teacher.experienceYears)} репетиторства</dd>
                  </div>
                )}
                <div>
                  <dt>Оформление</dt>
                  <dd>{teacher.official} · <a href={links.officialDocs} target="_blank" rel="noopener noreferrer">подробнее ↗</a></dd>
                </div>
                <div>
                  <dt>Вычет</dt>
                  <dd>{teacher.taxDeduction}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section section-white" id="environment" aria-labelledby="environment-title">
          <div className="container">
            <SectionHead
              id="environment-title"
              part="Часть 5 · Где проходит обучение"
              title="Материалы и помощь — и между занятиями"
              lead="Что именно входит, зависит от формата — расскажу на пробном уроке."
            />
            <ul className="env-grid">
              {environment.map((item) => (
                <li className="env-card" key={item.name}>
                  <img src={item.icon} alt="" width={40} height={40} loading="lazy" />
                  <p className="env-role">{item.role}</p>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                  {item.link && (item.link.external ? (
                    <a href={item.link.href} target="_blank" rel="noopener noreferrer">{item.link.label}</a>
                  ) : (
                    <Link href={item.link.href}>{item.link.label}</Link>
                  ))}
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
                lead="Условие, решение на Python и комментарий к каждой строке кода — так же, как на занятиях."
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

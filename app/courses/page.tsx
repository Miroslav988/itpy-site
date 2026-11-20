import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { BookingButton } from "../booking/Booking";
import { Icon, PenUnderline } from "../ui";
import { Drawing, Strokes, type Picture } from "../illustrations";
import CourseReviews from "./CourseReviews";
import { courses, filters, isFree, isSoon, shownCategories, stepikUrl, type CategoryId } from "./catalog";
import { JsonLd, breadcrumbSchema, coursesSchema, pageMetadata } from "../seo";
import { siteOrigin } from "../site";

export const metadata = pageMetadata({
  path: "/courses",
  title: "Курсы по Python и ЕГЭ на Stepik — ITPY",
  description: "Записанные курсы ITPY на Stepik: Python с нуля, задания ЕГЭ по информатике и сборники вариантов. Оплата и обучение — на Stepik.",
});

// The stacked cards in the hero; each shows while its category has courses.
const heroCards: Array<{ badge: string; text: string; picture: Picture; category: CategoryId }> = [
  { badge: "Python", text: "Основы языка и задания ЕГЭ", picture: "python", category: "free" },
  { badge: "Задания ЕГЭ", text: "Разбор всех типов номеров", picture: "clipboard", category: "free" },
  { badge: "Вторая часть", text: "Сложные задания 23–27", picture: "window", category: "part2" },
];

const steps: Array<{ text: string; icon: "pointer" | "screenPlay" | "bars" }> = [
  { text: "Выберите тему и подходящий курс", icon: "pointer" },
  { text: "Изучайте теорию и решайте задачи", icon: "screenPlay" },
  { text: "Закрепляйте знания в своём темпе", icon: "bars" },
];

type Props = { searchParams: Promise<{ show?: string }> };

export default async function CoursesPage({ searchParams }: Props) {
  const origin = await siteOrigin();
  const shownFilters = filters.filter((filter) => shownCategories.some((category) => filter.categories.includes(category.id)));
  const { show } = await searchParams;
  const filter = shownFilters.find((item) => item.id === show);
  const filled = filter ? shownCategories.filter((category) => filter.categories.includes(category.id)) : shownCategories;
  const hasPaid = courses.some((course) => !isFree(course));

  return (
    <>
      <JsonLd nodes={[coursesSchema(origin), breadcrumbSchema(origin, [["Главная", "/"], ["Курсы", "/courses"]])]} />
      <SiteHeader active="courses" />
      <main id="top" className="catalog">
        <section className="catalog-hero" aria-labelledby="catalog-title">
          <div className="container catalog-hero-grid">
            <div>
              <p className="part-label">ITPY · Каталог на Stepik</p>
              <h1 id="catalog-title">Мои <span className="pen-word">курсы<PenUnderline /></span></h1>
              <p className="catalog-lead">От основ Python до сложных заданий ЕГЭ. Видеоуроки, понятная теория и много практики — выбирайте нужную тему и занимайтесь в удобном темпе.</p>
              {shownFilters.length > 1 && (
                <nav className="catalog-filter" aria-label="Какие курсы показать">
                  <Link href="/courses#catalog" aria-current={!filter ? "page" : undefined}>Все курсы</Link>
                  {shownFilters.map((item) => (
                    <Link href={`/courses?show=${item.id}#catalog`} key={item.id} aria-current={filter?.id === item.id ? "page" : undefined}>{item.label}</Link>
                  ))}
                </nav>
              )}
              <div className="catalog-cta">
                <a className="btn btn-lg catalog-choose" href="#catalog">Выбрать курс <span aria-hidden="true">→</span></a>
                {hasPaid && <p><Icon name="layers" />Есть бесплатные<br />и платные курсы</p>}
              </div>
            </div>
            <div className="catalog-stack" aria-hidden="true">
              {heroCards.filter((card) => shownCategories.some((category) => category.id === card.category)).map((card) => (
                <div className="catalog-stack-card" key={card.badge}>
                  <span className="catalog-stack-badge">{card.badge}</span>
                  <span className="catalog-stack-text">{card.text}</span>
                  <Drawing name={card.picture} />
                </div>
              ))}
              <Strokes className="catalog-stack-strokes" />
            </div>
          </div>
        </section>

        <section className="catalog-how" aria-label="Как учиться по курсам">
          <ol className="container catalog-steps">
            {steps.map((step, index) => (
              <li key={step.text}>
                <span className="catalog-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <Icon name={step.icon} className="icon catalog-step-icon" />
                {step.text}
              </li>
            ))}
          </ol>
        </section>

        <div id="catalog" />
        {filled.map((category) => (
          <section className="catalog-group" id={category.id} key={category.id} aria-labelledby={`${category.id}-title`}>
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="part-label">Категория</p>
                  <h2 id={`${category.id}-title`}>{category.title}</h2>
                </div>
                <p className="section-lead">{category.lead}</p>
              </div>
              <ul className="course-grid">
                {courses.filter((course) => course.category === category.id).map((course) => (
                  <li key={course.id}>
                    <article className="course-card" aria-labelledby={`${course.id}-title`}>
                      <div className="course-card-head">
                        <img src={course.cover.src} alt="" width={course.cover.width} height={course.cover.height} loading="lazy" />
                        <div>
                          <span className="badge">{course.subject}</span>
                          <h3 id={`${course.id}-title`}>{course.title}</h3>
                        </div>
                      </div>
                      <p>{course.description}</p>
                      <dl className="course-facts">
                        <div><dt>Для кого</dt><dd>{course.audience}</dd></div>
                        <div><dt>Чему научитесь</dt><dd><ul>{course.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
                        <div><dt>Внутри</dt><dd>{course.format.join(" · ")}</dd></div>
                      </dl>
                      <div className="course-card-foot">
                        <p className="course-price">
                          {course.price ?? "Цена — на странице курса"}
                          {!isFree(course) && <span>{isSoon(course) ? "скоро на Stepik" : "оплата на Stepik"}</span>}
                        </p>
                        <div className="course-actions">
                          {course.stepikId === null ? (
                            // Not on Stepik yet: the card is there, the link comes later.
                            <span className="btn course-soon" aria-disabled="true">Позже</span>
                          ) : (
                            <a className="btn btn-ink" href={stepikUrl({ ...course, stepikId: course.stepikId })} target="_blank" rel="noopener noreferrer">
                              {isFree(course) ? "Открыть на Stepik" : "Подробнее"} <span aria-hidden="true">↗</span>
                            </a>
                          )}
                          {course.showReviews && course.stepikId && <CourseReviews courseId={course.stepikId} title={course.title} />}
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="catalog-help" id="help" aria-labelledby="help-title">
          <div className="container">
            <div className="catalog-help-box">
              <div>
                <p className="part-label">Если нужна помощь</p>
                <h2 id="help-title">Хочешь заниматься со мной?</h2>
                <p>Парные занятия и вебинары по ЕГЭ — начнём с бесплатного пробного урока.</p>
              </div>
              <div className="actions">
                <BookingButton className="btn btn-lime btn-lg">Записаться на пробное <span aria-hidden="true">→</span></BookingButton>
                <Link className="btn btn-ghost btn-lg" href="/#formats">Форматы и цены</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

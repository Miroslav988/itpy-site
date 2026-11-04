import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { BookingButton } from "../booking/Booking";
import { PenUnderline } from "../ui";
import CourseReviews from "./CourseReviews";
import { categories, courses, stepikUrl } from "./catalog";

export const metadata: Metadata = {
  title: "Курсы по Python и ЕГЭ на Stepik — ITPY",
  description: "Записанные курсы ITPY на Stepik: Python с нуля, задания ЕГЭ по информатике и сборники вариантов. Оплата и обучение — на Stepik.",
};

export default function CoursesPage() {
  const filled = categories.filter((category) => courses.some((course) => course.category === category.id));

  return (
    <>
      <SiteHeader active="courses" />
      <main id="top" className="catalog">
        <section className="catalog-hero" aria-labelledby="catalog-title">
          <div className="container">
            <p className="part-label">ITPY · Каталог на Stepik</p>
            <h1 id="catalog-title">Мои <span className="pen-word">курсы<PenUnderline /></span></h1>
            <p className="catalog-lead">Записанные курсы и сборники для самостоятельной подготовки. Оплата и обучение проходят на Stepik — регистрироваться на ITPY не нужно.</p>
            <nav className="catalog-jump" aria-label="Категории курсов">
              {filled.map((category) => (
                <a href={`#${category.id}`} key={category.id}>{category.title} <span aria-hidden="true">↓</span></a>
              ))}
            </nav>
          </div>
        </section>

        <section className="catalog-how" aria-label="Как купить курс">
          <ol className="container catalog-steps">
            <li><span aria-hidden="true">1</span>Выберите курс и откройте его на Stepik</li>
            <li><span aria-hidden="true">2</span>Оплата и доступ — на стороне Stepik</li>
            <li><span aria-hidden="true">3</span>Учитесь в своём темпе, к темам можно вернуться</li>
          </ol>
        </section>

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
                        <p className="course-price">{course.price ?? "Цена — на странице курса"}</p>
                        <div className="course-actions">
                          <a className="btn btn-ink" href={stepikUrl(course)} target="_blank" rel="noopener noreferrer">Открыть на Stepik <span aria-hidden="true">↗</span></a>
                          {course.showReviews && <CourseReviews courseId={course.stepikId} title={course.title} />}
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

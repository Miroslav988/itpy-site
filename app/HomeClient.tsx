"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "./SiteHeader";
import LinkHub from "./LinkHub";

type Program = "ЕГЭ" | "ОГЭ" | "Python";
type StudyFormat = "Мини-группа" | "Индивидуально";

function CourseArtwork({ program }: { program: Program }) {
  return (
    <svg className="course-artwork" viewBox="0 0 320 130" fill="none" aria-hidden="true" focusable="false">
      <text x="18" y="94" fill="currentColor" fontSize="48" fontWeight="650" letterSpacing="-3">{program === "Python" ? "PY" : program}</text>
      {program === "ЕГЭ" ? (
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M162 98C198 98 185 65 223 65S252 32 288 32" strokeDasharray="3 7" opacity=".55" />
          <rect x="144" y="80" width="36" height="36" rx="11" fill="white" />
          <rect x="205" y="47" width="36" height="36" rx="11" fill="white" />
          <rect x="266" y="14" width="36" height="36" rx="11" fill="white" />
          <g fill="currentColor" stroke="none" fontSize="12" fontWeight="600" textAnchor="middle">
            <text x="162" y="103">01</text><text x="223" y="70">14</text><text x="284" y="37">27</text>
          </g>
          <path d="M274 81l8 8 17-21" strokeWidth="4" />
        </g>
      ) : program === "ОГЭ" ? (
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="170" y="20" width="97" height="103" rx="12" transform="rotate(-8 170 20)" opacity=".3" />
          <rect x="182" y="12" width="97" height="103" rx="12" fill="white" />
          <path d="M197 37l4 4 7-8m-11 29 4 4 7-8m-11 29 4 4 7-8" />
          <path d="M219 37h43m-43 25h35m-35 25h25" opacity=".5" />
          <path d="M264 93l24-29 8 7-24 29-13 5z" fill="white" />
        </g>
      ) : (
        <g>
          <rect x="148" y="16" width="158" height="106" rx="14" fill="currentColor" />
          <path d="M149 40h156" stroke="white" opacity=".2" />
          <g fill="white" opacity=".65"><circle cx="162" cy="28" r="3" /><circle cx="173" cy="28" r="3" /><circle cx="184" cy="28" r="3" /></g>
          <g fill="white" fontFamily="Consolas, monospace" fontSize="13">
            <text x="162" y="64" opacity=".7">{"> x = 1"}</text>
            <text x="162" y="86">{"print(x + 1)"}</text>
            <text x="162" y="108" opacity=".7">2 <tspan fill="#dfff68">▌</tspan></text>
          </g>
        </g>
      )}
    </svg>
  );
}

const programs: Array<{
  id: Program;
  code: string;
  title: string;
  description: string;
  accent: string;
  topics: string[];
}> = [
  {
    id: "ЕГЭ",
    code: "27/27",
    title: "Подготовка к ЕГЭ",
    description:
      "Закрываем всю программу: от базовой логики до сложных задач на Python.",
    accent: "violet",
    topics: ["1 учебный год", "все типы задач", "пробники"],
  },
  {
    id: "ОГЭ",
    code: "15/15",
    title: "Подготовка к ОГЭ",
    description:
      "Собираем уверенную базу и учимся решать экзамен без паники и угадываний.",
    accent: "lime",
    topics: ["с нуля", "практика", "разбор ошибок"],
  },
  {
    id: "Python",
    code: "PY",
    title: "Python с нуля",
    description:
      "Не просто учим команды — создаём программы и начинаем думать как разработчик.",
    accent: "peach",
    topics: ["7–10 класс", "проекты", "портфолио"],
  },
];

function LearningArtwork({ step }: { step: string }) {
  return (
    <svg className="learning-artwork" viewBox="0 0 160 105" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="80" cy="55" rx="66" ry="43" fill="currentColor" opacity=".09" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {step === "01" ? (
          <>
            <path d="M31 25h68a12 12 0 0 1 12 12v25a12 12 0 0 1-12 12H57L38 88V74h-7a12 12 0 0 1-12-12V37a12 12 0 0 1 12-12Z" fill="white" />
            <path d="M111 46h15a12 12 0 0 1 12 12v20l-1 12-16-9H95" opacity=".55" />
            <path d="M40 44h49M40 56h31" opacity=".45" />
            <path d="m104 15 4-7m13 15 8-2" />
          </>
        ) : step === "02" ? (
          <>
            <path d="M26 30c22-7 39-3 54 8 15-11 32-15 54-8v53c-22-7-39-3-54 8-15-11-32-15-54-8Z" fill="white" />
            <path d="M80 38v53M39 45l25 5M39 58l25 5m33-13 24-5m-24 18 24-5" opacity=".5" />
            <path d="M71 14h18m-9-8v16" />
          </>
        ) : step === "03" ? (
          <>
            <rect x="24" y="23" width="112" height="65" rx="12" fill="white" />
            <path d="M25 40h110" opacity=".3" />
            <path d="m57 53-12 11 12 11m45-22 12 11-12 11m-17-25-10 29" />
            <path d="m125 12 5-7m10 18 8-1" />
          </>
        ) : step === "04" ? (
          <>
            <rect x="36" y="18" width="77" height="76" rx="11" fill="white" />
            <rect x="58" y="12" width="33" height="13" rx="5" fill="white" />
            <path d="m50 44 4 4 7-9m-11 23 4 4 7-9m-11 23 4 4 7-9M71 44h27M71 62h20M71 80h14" />
            <circle cx="119" cy="76" r="19" fill="white" />
            <path d="M119 65v12l7 4" />
          </>
        ) : (
          <>
            <path d="M55 20h50v26a25 25 0 0 1-50 0Z" fill="white" />
            <path d="M55 28H39v11a18 18 0 0 0 21 18m45-29h16v11a18 18 0 0 1-21 18M80 71v16M65 91h30" />
            <path d="m80 29 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="currentColor" stroke="none" />
            <path d="m28 66 4 6m95-57 5-5m-1 56 6-3M36 14l5 4" />
          </>
        )}
      </g>
    </svg>
  );
}

function AboutArtwork({ kind }: { kind: "education" | "experience" | "official" }) {
  return (
    <svg className="about-artwork" viewBox="0 0 130 90" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="68" cy="48" rx="54" ry="35" fill="currentColor" opacity=".08" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === "education" ? (
          <>
            <rect x="24" y="19" width="79" height="53" rx="8" fill="white" transform="rotate(-8 24 19)" opacity=".45" />
            <rect x="32" y="12" width="79" height="53" rx="8" fill="white" />
            <path d="M45 28h40M45 40h27" opacity=".45" />
            <circle cx="94" cy="55" r="12" fill="white" />
            <path d="m87 65-2 14 9-5 9 5-2-14m-12-11 4 4 7-8" />
          </>
        ) : kind === "experience" ? (
          <>
            <path d="M22 66c21 0 17-19 38-19s20-23 43-23" strokeDasharray="3 6" opacity=".5" />
            <circle cx="23" cy="66" r="8" fill="white" />
            <circle cx="63" cy="46" r="8" fill="white" />
            <rect x="90" y="12" width="30" height="29" rx="10" fill="white" />
            <path d="m98 26 5 5 9-11M72 72h40m-24-9v18" />
          </>
        ) : (
          <>
            <path d="M39 12h54v66l-9-5-9 5-9-5-9 5-9-5-9 5Z" fill="white" />
            <path d="M51 29h28M51 41h19M51 53h12" opacity=".45" />
            <circle cx="98" cy="61" r="18" fill="white" />
            <path d="m90 61 6 6 11-13" />
          </>
        )}
      </g>
    </svg>
  );
}

const learningSteps = [
  {
    number: "01",
    title: "Пробное занятие",
    text: "Знакомимся, определяем стартовый уровень и намечаем маршрут подготовки.",
  },
  {
    number: "02",
    title: "Осваиваем базу",
    text: "Разбираем теорию и закрепляем её заданиями из банка ФИПИ.",
  },
  {
    number: "03",
    title: "Решаем сложнее",
    text: "Переходим к авторским задачам повышенной сложности и разбираем ошибки.",
  },
  {
    number: "04",
    title: "Готовимся к экзамену",
    text: "Пишем пробники, отслеживаем прогресс и выходим на экзамен увереннее.",
  },
  {
    number: "05",
    title: "Сдаём экзамен",
    text: "Выходим на экзамен с отработанными заданиями и понятным планом действий.",
  },
];

const teacherPrinciples = [
  "Лично веду занятия",
  "Сам проверяю практику",
  "Отвечаю на вопросы напрямую",
  "Адаптирую темп под ученика",
];

const reviewImages = Array.from({ length: 18 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const extension = index === 17 ? "jpg" : "png";
  return `/reviews/review-${number}.${extension}`;
});

const faqs = [
  {
    q: "Я не умею программировать. Мне вообще сюда можно?",
    a: "Можно. Начальный уровень не проблема: сначала разбираемся с базой, а потом постепенно переходим к экзаменационным задачам и коду.",
  },
  {
    q: "Я учусь в 10 классе. Начинать сейчас или подождать?",
    a: "Начать заранее — хорошая идея: будет больше времени спокойно разобраться в темах и набрать практику без гонки перед экзаменом.",
  },
  {
    q: "Реально подготовиться к информатике за учебный год?",
    a: "Во многих случаях — да, но всё зависит от стартового уровня и цели. Поэтому сначала я оцениваю точку А и только потом честно предлагаю маршрут.",
  },
  {
    q: "Я запоминаю шаблоны, но всё равно не понимаю код. Что делать?",
    a: "Не зубрить ещё больше. Я разбираю, что делает каждая часть программы и почему решение работает — тогда изменение условия уже не ломает всю задачу.",
  },
];

export default function HomeClient() {
  const [program, setProgram] = useState<Program>("ЕГЭ");
  const [studyFormat, setStudyFormat] =
    useState<StudyFormat>("Мини-группа");
  const reviewsRef = useRef<HTMLDivElement>(null);
  const bookingDialogRef = useRef<HTMLDialogElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  useEffect(() => {
    if (!bookingOpen) return;
    const dialog = bookingDialogRef.current;
    dialog?.showModal();
    const script = document.createElement("script");
    script.src = "https://planerka.app/meet/assets/external/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
      dialog?.close();
    };
  }, [bookingOpen]);

  function moveReviews(direction: number) {
    const track = reviewsRef.current;
    const card = track?.querySelector<HTMLElement>(".review-orbit-card");
    track?.scrollBy({ left: direction * ((card?.offsetWidth ?? 310) + 16), behavior: "smooth" });
  }

  function chooseProgram(nextProgram: Program) {
    setProgram(nextProgram);
  }

  return (
    <main>
      <section className="hero" id="top">
        <SiteHeader active="home" />

        <div className="hero-grid hero-grid-text-only">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              набор на 2026/27 учебный год открыт
            </div>

            <h1>
              Информатика,
              <br />
              которую <span className="highlight">понимаешь</span>
            </h1>

            <p className="hero-lead">
              Готовлю к ЕГЭ и ОГЭ по информатике и учу Python с нуля.
              Объясняю сложное человеческим языком и веду каждого ученика
              до качественного результата на экзамене.
            </p>

            <dl className="hero-proof" aria-label="Опыт и результаты преподавателя">
              {/* Temporary figures requested by the owner; replace with confirmed statistics. */}
              <div><dt>учеников подготовлено</dt><dd>999</dd></div>
              <div><dt>средний балл ЕГЭ</dt><dd>999</dd></div>
              <div><dt>профильное IT-образование</dt><dd>Высшее</dd></div>
            </dl>

            <div className="hero-actions">
              <a className="primary-cta" href="#trial">
                Обсудить подготовку
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <span className="action-note">
                <strong>Без формальностей</strong>
                познакомимся и поймём задачу
              </span>
            </div>
          </div>

        </div>

      </section>

      <section className="courses-section section" id="courses">
        <div className="section-heading">
          <p className="section-kicker">Направления</p>
          <h2>Выбери цель. Маршрут соберём вместе</h2>
          <p className="directions-lead">Три направления — с понятным маршрутом, практикой и обратной связью.</p>
        </div>

        <div className="courses-grid">
          {programs.map((course) => (
            <article
              className={"course-card course-" + course.accent}
              key={course.id}
            >
              <div className="course-visual">
                <div className="course-card-head">
                  <span className="course-code">{course.code}</span>
                  <span className="course-scope">{course.id === "Python" ? "Программирование" : "Подготовка к экзамену"}</span>
                </div>
                <CourseArtwork program={course.id} />
              </div>
              <div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
              <div className="course-tags">
                {course.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <a
                href="#trial"
                className="course-button"
                onClick={() => chooseProgram(course.id)}
              >
                {course.id === "Python" ? "Начать учить Python" : `Готовиться к ${course.id}`} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="teaching-features section" aria-label="Формат занятий">
        <div className="hero-bottom" aria-label="Ключевые особенности">
          <div>
            <span className="feature-number">01</span>
            <p>
              <strong>Живые занятия</strong>
              <br />в группе или один на один
            </p>
          </div>
          <div>
            <span className="feature-number">02</span>
            <p>
              <strong>Домашка с обратной связью</strong>
              <br />а не просто «правильно / неправильно»
            </p>
          </div>
          <div>
            <span className="feature-number">03</span>
            <p>
              <strong>Поддержка весь год</strong>
              <br />от первого урока до экзамена
            </p>
          </div>
          <div>
            <span className="feature-number">04</span>
            <p>
              <strong>Личный маршрут</strong>
              <br />темы и темп под конкретную цель
            </p>
          </div>
          <div>
            <span className="feature-number">05</span>
            <p>
              <strong>Записи и конспекты</strong>
              <br />можно вернуться к теме в любой момент
            </p>
          </div>
          <div>
            <span className="feature-number">06</span>
            <p>
              <strong>Регулярные пробники</strong>
              <br />видим прогресс и разбираем ошибки
            </p>
          </div>
        </div>
      </section>

      <section className="learning-section section" id="learning">
        <div className="section-heading section-heading-light">
          <p className="section-kicker">Как всё устроено</p>
          <h2>Учёба без режима «ничего не понимаю»</h2>
          <p className="section-intro">
            Понятный маршрут вместо бесконечных файлов, случайных уроков и
            надежды, что однажды всё сложится само.
          </p>
        </div>

        <div className="learning-grid">
          {learningSteps.map((step) => (
            <article className={`learning-card${step.number === "05" ? " learning-card-finish" : ""}`} key={step.number}>
              <div className="learning-card-top">
                <span>{step.number}</span>
                <span className="learning-stage-label">{({ "01": "Старт", "02": "База", "03": "Практика", "04": "Пробники", "05": "Финиш" } as Record<string, string>)[step.number]}</span>
              </div>
              <LearningArtwork step={step.number} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.number === "05" && (
                <div className="learning-finish-score">
                  {/* Temporary average requested by the owner. */}
                  <strong>999</strong><span>средний балл<br />учеников на ЕГЭ</span>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="learning-results-link">
          <p>Как ученики прошли этот путь — в их отзывах.</p>
          <a href="#results">Посмотреть отзывы <span aria-hidden="true">→</span></a>
        </div>

        <div className="learning-media">
          <figure className="media-card media-card-featured">
            <img
              src="/media/learning-system.png"
              alt="Система подготовки ITPY: занятия в Zoom, домашние задания на Stepik, Telegram-канал и бот"
              width={2048}
              height={1536}
            />
          </figure>
          <div className="tools-gallery">
            <figure className="media-card">
              <img
                src="/media/student-bot.png"
                alt="Меню Telegram-бота ITPY с домашними заданиями, расписанием и конспектами"
                width={2048}
                height={1536}
              />
            </figure>
            <figure className="media-card">
              <img
                src="/media/score-bot.png"
                alt="Бот ITPY мгновенно проверяет пробник ЕГЭ и считает баллы"
                width={2048}
                height={1536}
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="results-section section" id="results">
        <div className="results-heading">
          <div className="section-heading">
            <p className="section-kicker">Результаты</p>
            <h2>Отзывы учеников</h2>
          </div>
          <div className="results-caption">
            <span>точка А</span>
            <div className="caption-line" />
            <span>точка Б</span>
          </div>
        </div>

        <div className="results-track">
          <article className="result-card result-before">
            <span className="result-status">до старта</span>
            <h3>«Я вообще не понимаю 27 задачу»</h3>
            <div className="result-meter">
              <span style={{ width: "28%" }} />
            </div>
            <p>Есть пробелы, нет системы и непонятно, за что хвататься.</p>
          </article>
          <span className="results-arrow" aria-hidden="true">
            →
          </span>
          <article className="result-card result-after">
            <span className="result-status">после маршрута</span>
            <h3>«Знаю алгоритм и спокойно решаю»</h3>
            <div className="result-meter">
              <span style={{ width: "86%" }} />
            </div>
            <p>Тема разложена по шагам, ошибки понятны, есть уверенность.</p>
          </article>
        </div>

        <div className="review-carousel" aria-label="Отзывы учеников">
          <div className="review-carousel-toolbar">
            <div>
              <strong>
                {String(activeReview + 1).padStart(2, "0")} / {reviewImages.length}
              </strong>
              <span>Листайте отзывы стрелками или свайпом</span>
            </div>
            <div className="review-carousel-buttons">
              <button
                type="button"
                aria-label="Предыдущий отзыв"
                onClick={() => moveReviews(-1)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Следующий отзыв"
                onClick={() => moveReviews(1)}
              >
                →
              </button>
            </div>
          </div>

          <div
            className="review-orbit"
            ref={reviewsRef}
            onScroll={(event) => {
              const card = event.currentTarget.querySelector<HTMLElement>(".review-orbit-card");
              if (card) setActiveReview(Math.min(reviewImages.length - 1, Math.round(event.currentTarget.scrollLeft / (card.offsetWidth + 16))));
            }}
          >
            {reviewImages.map((src, index) => (
                <button
                  className="review-orbit-card"
                  type="button"
                  key={src}
                  aria-label={`Открыть отзыв ${index + 1}`}
                  onClick={() => setSelectedReview(index)}
                >
                  <span className="review-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={src}
                    alt={`Отзыв ученика ${index + 1}`}
                    width={index < 2 ? 1536 : index === 17 ? 1280 : 1448}
                    height={index < 2 ? 1024 : index === 17 ? 960 : 1086}
                    loading={index > 3 ? "lazy" : "eager"}
                  />
                  <span className="review-card-open">Открыть оригинал ↗</span>
                </button>
            ))}
          </div>

          {selectedReview !== null && (
            <div className="review-lightbox">
              <button className="review-lightbox-backdrop" type="button" aria-label="Закрыть отзыв" onClick={() => setSelectedReview(null)} />
              <div
                className="review-lightbox-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={`Отзыв ${selectedReview + 1} из ${reviewImages.length}`}
              >
                <div className="review-lightbox-topbar">
                  <span>
                    {String(selectedReview + 1).padStart(2, "0")} / {reviewImages.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Закрыть отзыв"
                    onClick={() => setSelectedReview(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="review-lightbox-content">
                  <button
                    type="button"
                    aria-label="Предыдущий отзыв"
                    onClick={() =>
                      setSelectedReview((current) =>
                        current === null || current === 0
                          ? reviewImages.length - 1
                          : current - 1,
                      )
                    }
                  >
                    ←
                  </button>
                  <img
                    src={reviewImages[selectedReview]}
                    alt={`Отзыв ученика ${selectedReview + 1}`}
                    width={
                      selectedReview < 2
                        ? 1536
                        : selectedReview === 17
                          ? 1280
                          : 1448
                    }
                    height={
                      selectedReview < 2
                        ? 1024
                        : selectedReview === 17
                          ? 960
                          : 1086
                    }
                  />
                  <button
                    type="button"
                    aria-label="Следующий отзыв"
                    onClick={() =>
                      setSelectedReview((current) =>
                        current === null || current === reviewImages.length - 1
                          ? 0
                          : current + 1,
                      )
                    }
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <a className="results-cta" href="#trial">Обсудить свою цель ↗</a>
      </section>

      <section className="team-section section" id="about">
        <div className="team-heading">
          <div className="section-heading">
            <p className="section-kicker">Обо мне</p>
            <h2>Занятия веду сам</h2>
          </div>
          <p>
            ITPY — мой проект. От первой встречи до экзамена вы общаетесь
            напрямую со мной: я веду занятия, проверяю работу и вижу прогресс.
          </p>
        </div>

        <div className="solo-teacher-card">
          <div className="solo-photo solo-photo-placeholder">
            {/* Replace this temporary image with the owner's new photo. */}
            <img
              src="/media/teacher-photo-placeholder.svg"
              alt="Здесь могла бы быть ваша реклама. Но скоро здесь будет Илья. Не забыть заменить фото."
              width={800}
              height={600}
            />
          </div>
          <div className="solo-teacher-copy">
            <span className="solo-role">Илья Андрианов · ITPY</span>
            <h3>ЕГЭ, ОГЭ и Python — лично со мной</h3>
            <p>
              Помогаю разобраться в информатике, а не просто запомнить решения.
              Сам объясняю темы, проверяю практику и подбираю темп под ученика.
              Между занятиями можно задать вопрос напрямую мне.
            </p>
            <div className="solo-principles">
              {teacherPrinciples.map((item, index) => (
                <span key={item}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="expertise-gallery" aria-label="Образование, опыт и официальная работа">
          <article className="expertise-card expertise-proof">
            <div className="about-proof-top"><span>Образование</span><AboutArtwork kind="education" /></div>
            <h3>Информатика — моя специальность</h3>
            <p>Высшее IT-образование: бакалавриат по направлению «Информатика и вычислительная техника».</p>
            <a href="/media/teacher-diploma.png" target="_blank" rel="noopener noreferrer">Посмотреть диплом <span aria-hidden="true">↗</span></a>
          </article>
          <article className="expertise-card expertise-proof">
            <div className="about-proof-top"><span>Опыт</span><AboutArtwork kind="experience" /></div>
            {/* Temporary teaching experience requested by the owner. */}
            <h3><strong className="about-experience-number">999</strong> лет репетиторства</h3>
            <p>Лично веду учеников от знакомства и первых задач до итогового экзамена.</p>
          </article>
          <article className="expertise-card expertise-proof">
            <div className="about-proof-top"><span>Официально</span><AboutArtwork kind="official" /></div>
            <h3>Работаю как ИП</h3>
            <p>Выдаю чеки после оплаты и предоставляю документы для оформления налогового вычета.</p>
            <a href="/media/teacher-official.png" target="_blank" rel="noopener noreferrer">Подробнее о документах <span aria-hidden="true">↗</span></a>
          </article>
        </div>

        <div className="about-preparation">
          <div className="about-preparation-heading">
            <div><span className="about-small-label">На протяжении подготовки</span><h3>Занятия заканчиваются.<br />Поддержка — продолжается.</h3></div>
            <p>Материалы, практика и помощь собраны в одном маршруте — понятно, где учиться и к кому идти с вопросом.</p>
          </div>
          <div className="about-resource-grid">
            <article className="about-resource-card">
              <span className="about-service-mark" aria-hidden="true"><img src="/brands/zoom.png" alt="" width={32} height={32} /></span>
              <div><span className="about-small-label">Zoom · живые занятия</span><h4>Разбираемся вместе</h4><p>Объясняю тему, показываю решение и отвечаю на вопросы прямо на уроке.</p></div>
            </article>
            <article className="about-resource-card">
              <span className="about-service-mark" aria-hidden="true"><img src="/brands/stepik.webp" alt="" width={32} height={32} /></span>
              <div><span className="about-small-label">Stepik · теория и практика</span><h4>Закрепляем в своём темпе</h4><p>Учебные материалы, задания и курсы по Python и ЕГЭ — для работы между уроками.</p><a href="/courses">Открыть курсы <span aria-hidden="true">↗</span></a></div>
            </article>
            <article className="about-resource-card">
              <span className="about-service-mark" aria-hidden="true"><img src="/brands/telegram.svg" alt="" width={32} height={32} /></span>
              <div><span className="about-small-label">Telegram · канал и бот</span><h4>Всё нужное под рукой</h4><p>Конспекты, домашние задания и расписание в боте. Дополнительные материалы — в канале.</p><a href="https://t.me/informatika_kege_itpy" target="_blank" rel="noopener noreferrer">Перейти в канал <span aria-hidden="true">↗</span></a></div>
            </article>
            <article className="about-resource-card">
              <span className="about-service-mark" aria-hidden="true">?</span>
              <div><span className="about-small-label">Личная обратная связь</span><h4>С вопросами — ко мне</h4><p>Сам проверяю решения, разбираю ошибки и помогаю вернуться к задаче, если что-то не получается.</p><a href="https://t.me/ilandroxxy" target="_blank" rel="noopener noreferrer">Написать Илье <span aria-hidden="true">↗</span></a></div>
            </article>
          </div>
        </div>
      </section>

      <section className="benefits-section section">
        <div className="section-heading section-heading-light">
          <p className="section-kicker">Почему ITPY</p>
          <h2>
            Я убрал всё,
            <br />
            что мешает учиться
          </h2>
        </div>

        <div className="benefits-grid">
          <article className="benefit-card benefit-card-big">
            <span className="benefit-icon">{"{ }"}</span>
            <div>
              <h3>Сложное становится понятным</h3>
              <p>
                Разбираю тему на маленькие шаги и сразу показываю, где она
                встречается в реальных задачах.
              </p>
            </div>
          </article>
          <article className="benefit-card">
            <span className="benefit-icon">↻</span>
            <div>
              <h3>Можно пересмотреть</h3>
              <p>Записи и материалы остаются у ученика.</p>
            </div>
          </article>
          <article className="benefit-card">
            <span className="benefit-icon">?</span>
            <div>
              <h3>Не страшно спросить</h3>
              <p>Вопросы — часть процесса, а не повод чувствовать себя хуже.</p>
            </div>
          </article>
          <article className="benefit-card benefit-card-wide">
            <span className="benefit-icon">⌁</span>
            <div>
              <h3>Темп, который можно выдержать</h3>
              <p>
                Никаких рывков на две недели. Помогаю выстроить системную
                подготовку, которая вписывается в жизнь.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="support-section section">
        <div className="section-heading section-heading-light">
          <p className="section-kicker">Поддержка</p>
          <h2>
            Один на один
            <br />с задачей — но не один
          </h2>
        </div>

        <div className="support-layout">
          <div className="support-copy">
            <p>
              Если что-то не получается между уроками, не нужно ждать неделю.
              Можно написать напрямую мне — помогу разобраться и вернуться к
              плану.
            </p>
            <ul>
              <li>
                <span>✓</span> мои ответы на вопросы по практике
              </li>
              <li>
                <span>✓</span> помощь с темпом и графиком
              </li>
              <li>
                <span>✓</span> спокойная обратная связь без давления
              </li>
            </ul>
          </div>
          <div className="support-chat">
            <div className="chat-message chat-message-student">
              Не понимаю, почему здесь цикл не заканчивается 😵
              <span>18:42</span>
            </div>
            <div className="chat-message chat-message-teacher">
              Смотри: значение i не меняется внутри цикла. Давай добавим одну
              строку и проверим вместе?
              <span>18:44 · преподаватель ITPY</span>
            </div>
            <div className="chat-code">i += 1 <span>← вот она</span></div>
            <div className="chat-message chat-message-student chat-message-small">
              О, заработало! Спасибо 🙌
              <span>18:46</span>
            </div>
          </div>
        </div>

      </section>

      <section className="pricing-section section" id="pricing">
        <div className="pricing-heading">
          <div className="section-heading">
            <p className="section-kicker">Форматы и стоимость</p>
            <h2>Подбери подготовку под себя</h2>
          </div>
          <p>
            Выберите цель и формат. Точную стоимость я назову после короткого
            знакомства — без скрытых доплат и сюрпризов.
          </p>
        </div>

        <div className="configurator">
          <div className="config-options">
            <div className="config-block">
              <span className="config-label">01 · цель</span>
              <div className="segmented-control">
                {programs.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={program === item.id ? "active" : ""}
                    onClick={() => setProgram(item.id)}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="config-block">
              <span className="config-label">02 · формат</span>
              <div className="format-choice">
                {(["Мини-группа", "Индивидуально"] as StudyFormat[]).map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={studyFormat === item ? "active" : ""}
                      onClick={() => setStudyFormat(item)}
                    >
                      <span className="fake-radio" />
                      <strong>{item}</strong>
                      <small>
                        {item === "Мини-группа"
                          ? "до 8 учеников"
                          : "личный темп"}
                      </small>
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="config-summary">
            <span className="summary-badge">ваш вариант</span>
            <div>
              <p>{program}</p>
              <h3>{studyFormat}</h3>
            </div>
            <ul>
              <li>занятия напрямую со мной</li>
              <li>мои материалы и практика</li>
              <li>личный разбор вопросов</li>
              <li>регулярная проверка прогресса мной</li>
            </ul>
            <div className="price-note">
              <span>стоимость</span>
              <strong>назову после знакомства</strong>
            </div>
            <a className="summary-button" href="#trial">
              Получить расчёт <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="trial-section section" id="trial">
        <div className="trial-heading">
          <p className="section-kicker">Первый шаг</p>
          <h2>Начнём с бесплатного занятия</h2>
          <p>
            За 60 минут познакомимся, попробуем решать задачи вместе и наметим
            маршрут к твоей цели. Можно прийти с родителем.
          </p>
        </div>
        <div className="trial-intro">
          <ol className="trial-agenda" aria-label="Как проходит пробное занятие">
            <li>
              <span className="trial-step-number" aria-hidden="true">01</span>
              <span className="trial-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" /><path d="M7 9h8M7 13h5" /></svg>
              </span>
              <div><h3>Познакомимся</h3><p>Определим стартовый уровень, обсудим цель и то, что пока вызывает трудности.</p></div>
            </li>
            <li>
              <span className="trial-step-number" aria-hidden="true">02</span>
              <span className="trial-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="15" rx="3" /><path d="m6 9 3 3-3 3M12 15h5M8 22h8M12 19v3" /></svg>
              </span>
              <div><h3>Попробуем вместе</h3><p>Разберём несколько задач — ты увидишь, как я объясняю, и оценишь мой подход.</p></div>
            </li>
            <li>
              <span className="trial-step-number" aria-hidden="true">03</span>
              <span className="trial-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 19h9a4 4 0 0 0 0-8H8a4 4 0 0 1 0-8h5M15 1l3 2-3 2" /></svg>
              </span>
              <div><h3>Соберём план подготовки</h3><p>Выберем первые темы, темп и формат занятий — с учётом твоего уровня и времени до экзамена.</p></div>
            </li>
          </ol>
          <div className="trial-outcome">
            <h3>После встречи будет понятнее</h3>
            <ul>
              <li><strong>Ученику</strong><span>С чего начать, над чем работать и комфортно ли заниматься со мной.</span></li>
              <li><strong>Родителю</strong><span>Какой план и формат подойдут, как будут устроены занятия и обратная связь.</span></li>
            </ul>
          </div>
        </div>

        <div className="trial-booking">
          <button className="trial-calendar-preview" type="button" onClick={() => setBookingOpen(true)} aria-haspopup="dialog">
            <span className="trial-preview-copy"><span className="section-kicker">Запись на занятие</span><strong>Выбери время для знакомства</strong><span>60 минут · бесплатно</span></span>
            <span className="trial-preview-calendar" aria-hidden="true"><span className="trial-preview-month">Выберите дату <span>‹ &nbsp; ›</span></span><span className="trial-preview-days">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => <span key={day}>{day}</span>)}{Array.from({ length: 21 }, (_, index) => <span key={index}>{index + 1}</span>)}</span></span>
            <span className="trial-preview-action">Открыть календарь <span aria-hidden="true">↗</span></span>
          </button>
          <div className="planerka-calendar-actions">
            <a className="planerka-open-separately" href="https://planerka.app/ilandroxy/first-lesson" target="_blank" rel="noopener noreferrer">
              Или открыть на сайте Планёрки <span aria-hidden="true">↗</span>
            </a>
          </div>
          <dialog className="trial-booking-dialog" ref={bookingDialogRef} onClose={() => setBookingOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} aria-label="Запись на пробное занятие">
            <div className="trial-booking-dialog-inner">
              <div className="trial-booking-dialog-header"><div><span className="section-kicker">Пробное занятие</span><h3>Выбери дату и запишись</h3></div><button className="trial-booking-close" type="button" onClick={() => bookingDialogRef.current?.close()} aria-label="Закрыть календарь">×</button></div>
              {bookingOpen && <div className="planerka-inline-calendar"><div className="app-planerka-embed" data-planerka-embed="default" data-planerka-url="https://planerka.app/meet" data-planerka-user="ilandroxy" data-planerka-event="first-lesson" data-planerka-bg="transparent" data-planerka-border-width="0" data-planerka-shadow="none" style={{ width: "100%", minHeight: 600 }} /></div>}
              <div className="planerka-calendar-actions"><a className="planerka-open-separately" href="https://planerka.app/ilandroxy/first-lesson" target="_blank" rel="noopener noreferrer">Открыть на сайте Планёрки <span aria-hidden="true">↗</span></a></div>
            </div>
          </dialog>
        </div>
      </section>
      <section className="faq-section section" id="faq">
        <div className="faq-heading">
          <div className="section-heading">
            <p className="section-kicker">FAQ</p>
            <h2>Часто спрашивают. Отвечаю по делу</h2>
          </div>
          <div className="faq-symbol">?</div>
        </div>

        <div className="faq-list">
          {faqs.map((item, index) => (
            <details key={item.q} open={index === 0}>
              <summary>
                <strong>{item.q}</strong>
                <i>+</i>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="faq-contact-card">
          <span>{"</>"}</span>
          <div>
            <strong>Не нашли свой вопрос?</strong>
            <p>Напишите ITPY — разберёмся вместе.</p>
          </div>
          <a href="#trial">Обсудить подготовку →</a>
        </div>
      </section>

      <footer className="site-footer" id="contacts">
        <LinkHub />
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ITPY</span>
          <a href="#top">Наверх ↑</a>
        </div>
      </footer>
    </main>
  );
}

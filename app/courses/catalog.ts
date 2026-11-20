// Stepik catalog. To add a course, append an entry; the page groups cards by category, in the
// order of `categories`. A new category is one more entry there (and in CategoryId).
// Spec 5: titles, covers, prices and links are confirmed by Ilia before publishing. A course
// without `stepikId` is not on Stepik yet: its card shows «Позже» instead of a link, and it is not
// listed as a course anywhere else (structured data, llms.txt) until the link is added.

export type CategoryId = "free" | "mini" | "part2" | "tasks" | "big";

export const categories: Array<{ id: CategoryId; title: string; lead: string }> = [
  { id: "free", title: "Бесплатно", lead: "Курсы на Stepik, которые можно пройти бесплатно в своём темпе." },
  { id: "mini", title: "Мини-курсы", lead: "Точечные курсы для самостоятельной подготовки на Stepik. Каждый курс закрывает отдельный блок ЕГЭ." },
  { id: "part2", title: "Вторая часть", lead: "Углублённые курсы по заданиям 23–27. Можно выбрать полный блок или отдельные номера." },
  { id: "tasks", title: "Отдельные номера", lead: "Точечные курсы по самым востребованным заданиям второй части. Каждый курс можно проходить отдельно." },
  { id: "big", title: "Большие курсы", lead: "Крупные программы для системной подготовки. Подходят тем, кто хочет закрыть большой блок тем сразу." },
];

// The chips in the catalog hero: each shows one or more categories.
export const filters: Array<{ id: string; label: string; categories: CategoryId[] }> = [
  { id: "free", label: "Бесплатные", categories: ["free"] },
  { id: "mini", label: "Мини-курсы", categories: ["mini", "part2", "tasks"] },
  { id: "full", label: "Полные программы", categories: ["big"] },
];

export type Course = {
  id: string;
  category: CategoryId;
  // Shown on the card's badge: what the course is about.
  subject: string;
  title: string;
  description: string;
  audience: string;
  outcomes: string[];
  format: string[];
  // null shows "цена — на странице курса" until the price is confirmed.
  price: string | null;
  // null until the course is published on Stepik.
  stepikId: number | null;
  cover: { src: string; width: number; height: number };
  showReviews?: boolean;
};

// Spec 5: every course needs its own cover; all of them share a placeholder for now.
const sharedCover = { src: "/course-cover-stepik.jpg", width: 230, height: 230 };

const draft = { stepikId: null, cover: sharedCover };

export const allCourses: Course[] = [
  {
    id: "python-basics",
    category: "free",
    subject: "Python",
    title: "Курс по Python",
    description: "Базовый курс для старта в программировании: короткая теория, практика и постепенное усложнение задач.",
    audience: "Для тех, кто начинает изучать Python и хочет уверенно освоить базу.",
    outcomes: ["Понимать основы Python", "Решать задачи от простых к более сложным"],
    format: ["Видеоуроки", "Текстовая теория", "Тесты и задачи"],
    price: "Бесплатно",
    stepikId: 203477,
    cover: sharedCover,
    showReviews: true,
  },
  {
    id: "ege-tasks",
    category: "free",
    subject: "Задания ЕГЭ",
    title: "Курс по ЕГЭ",
    description: "Подборка заданий ЕГЭ по информатике: сначала база ФИПИ, затем более сложная практика и разбор решений.",
    audience: "Для тех, кто готовится к ЕГЭ и хочет отрабатывать задания по темам.",
    outcomes: ["Решать задания ЕГЭ по темам", "Разбираться в подходах и решениях"],
    format: ["Задания по темам", "Домашняя работа", "Форум решений"],
    price: "Бесплатно",
    stepikId: 122969,
    cover: sharedCover,
  },
  {
    id: "ege-variants",
    category: "free",
    subject: "Сборник вариантов",
    title: "Сборники вариантов",
    description: "Официальные варианты ЕГЭ по информатике для самостоятельной проверки и тренировки в формате экзамена.",
    audience: "Для тех, кто хочет проверить готовность и привыкнуть к формату экзамена.",
    outcomes: ["Решать полные варианты ЕГЭ", "Оценивать свой текущий уровень"],
    format: ["Полные варианты", "Задания в формате экзамена", "Самопроверка"],
    price: "Бесплатно",
    stepikId: 282248,
    cover: sharedCover,
  },
  {
    ...draft,
    id: "written-tasks",
    category: "mini",
    subject: "Письменные",
    title: "Письменные номера ЕГЭ",
    description: "Номера, где важно аккуратно оформлять ход решения и понимать логику задачи.",
    audience: "Для тех, кто хочет уверенно решать текстовые и логические задания.",
    outcomes: ["Разбирать условия без ошибок", "Выстраивать решение по шагам"],
    format: ["Видеоуроки", "Текстовая теория", "Практика"],
    price: "899 ₽",
  },
  {
    ...draft,
    id: "spreadsheet-tasks",
    category: "mini",
    subject: "Таблицы",
    title: "Табличные номера ЕГЭ",
    description: "Задания с электронными таблицами: обработка данных, формулы, логика и анализ.",
    audience: "Для тех, кто хочет освоить Excel-формат задач ЕГЭ.",
    outcomes: ["Решать табличные номера быстро", "Проверять себя на типичных ошибках"],
    format: ["Видеоуроки", "Разборы", "Домашние задания"],
    price: "799 ₽",
  },
  {
    ...draft,
    id: "python-tasks",
    category: "mini",
    subject: "Python",
    title: "Базовые Python-номера ЕГЭ",
    description: "Стартовый курс по задачам, где нужен код: синтаксис, циклы, условия и функции.",
    audience: "Для тех, кто хочет начать решать программные номера с нуля.",
    outcomes: ["Писать рабочие решения на Python", "Понимать базовые алгоритмы ЕГЭ"],
    format: ["Видеоуроки", "Теория", "Практика"],
    price: "999 ₽",
  },
  {
    ...draft,
    id: "part-two",
    category: "part2",
    subject: "23–27",
    title: "Вторая часть ЕГЭ",
    description: "Большой курс по заданиям 23–27: разбор всех тем, типовых подходов и сложных задач.",
    audience: "Для тех, кто хочет закрыть всю вторую часть и целиться в высокий результат.",
    outcomes: ["Решать задания 23–27 по системному алгоритму", "Понимать сложные формулировки и нестандартные идеи"],
    format: ["Видеоуроки", "Текстовая теория", "Практика", "Разборы"],
    price: "2490 ₽",
  },
  {
    ...draft,
    id: "task-23",
    category: "part2",
    subject: "№23",
    title: "Курс по заданию 23",
    description: "Отдельный мини-курс по номеру 23 с пошаговым разбором всех основных типов задач.",
    audience: "Для тех, кто хочет точечно прокачать номер 23 без лишних тем.",
    outcomes: ["Разбирать типовые конструкции номера 23", "Быстро находить верный способ решения"],
    format: ["Видеоуроки", "Теория", "Практические задачи"],
    price: "499 ₽",
  },
  {
    ...draft,
    id: "task-24",
    category: "part2",
    subject: "№24",
    title: "Курс по заданию 24",
    description: "Курс по номеру 24: все базовые схемы, типичные ловушки и отработка на практике.",
    audience: "Для тех, кто хочет отдельно освоить номер 24 и уверенно решать его на экзамене.",
    outcomes: ["Понимать основные типы задач номера 24", "Избегать типичных ошибок в решении"],
    format: ["Видеоуроки", "Текстовая теория", "Тренировочные задания"],
    price: "499 ₽",
  },
  {
    ...draft,
    id: "task-25",
    category: "tasks",
    subject: "№25",
    title: "Курс по заданию 25",
    description: "Мини-курс по номеру 25: типовые схемы, логика решения и практика на реальных задачах.",
    audience: "Для тех, кто хочет отдельно разобраться с номером 25 и довести его до автоматизма.",
    outcomes: ["Решать основные типы задач номера 25", "Видеть логику решения без шаблонного заучивания"],
    format: ["Видеоуроки", "Теория", "Практика"],
    price: "599 ₽",
  },
  {
    ...draft,
    id: "task-26",
    category: "tasks",
    subject: "№26",
    title: "Курс по заданию 26",
    description: "Отдельный курс по номеру 26 с разбором сложных случаев, структуры решения и типичных ошибок.",
    audience: "Для тех, кто хочет уверенно решать номер 26 и не теряться в формулировках.",
    outcomes: ["Анализировать условия номера 26", "Выбирать эффективный способ решения"],
    format: ["Видеоуроки", "Текстовая теория", "Разборы"],
    price: "699 ₽",
  },
  {
    ...draft,
    id: "task-27",
    category: "tasks",
    subject: "№27",
    title: "Курс по заданию 27",
    description: "Большой мини-курс по самому сложному номеру: идеи, алгоритмы и подробная практика.",
    audience: "Для тех, кто хочет освоить номер 27 с нуля или усилить уже имеющуюся базу.",
    outcomes: ["Понимать ключевые идеи номера 27", "Разбирать сложные задачи шаг за шагом"],
    format: ["Видеоуроки", "Подробная теория", "Практика"],
    price: "799 ₽",
  },
  {
    ...draft,
    id: "full-ege",
    category: "big",
    subject: "Все номера",
    title: "Полный курс ЕГЭ",
    description: "Системный курс по всем номерам ЕГЭ: от базы до второй части, с полным охватом программы.",
    audience: "Для тех, кто хочет получить все материалы в одном месте и двигаться по полной траектории.",
    outcomes: ["Решать все основные номера экзамена", "Понимать структуру подготовки целиком"],
    format: ["Все темы", "Видеоуроки", "Теория", "Практика"],
    price: "2990 ₽",
  },
  {
    ...draft,
    id: "part-one",
    category: "big",
    subject: "1–22",
    title: "Первая часть ЕГЭ",
    description: "Большой курс по всем номерам, кроме 23–27: база ФИПИ, практика и удобная последовательность тем.",
    audience: "Для тех, кто хочет сначала уверенно закрыть первую часть экзамена.",
    outcomes: ["Решать все номера первой части", "Уверенно ориентироваться в базовых темах ЕГЭ"],
    format: ["Видеоуроки", "Текстовая теория", "Разборы", "Практика"],
    price: "1990 ₽",
  },
  {
    ...draft,
    id: "ege-start",
    category: "big",
    subject: "Старт",
    title: "Старт в ЕГЭ",
    description: "Python и база ФИПИ для тех, кто только начинает подготовку к экзамену.",
    audience: "Для новичков, которым нужен плавный вход в подготовку и понятный стартовый маршрут.",
    outcomes: ["Освоите Python и первые задания ЕГЭ", "Поймёте, как дальше строить подготовку"],
    format: ["Python", "База ФИПИ", "Практика", "Мини-разборы"],
    price: "1290 ₽",
  },
];

// The catalog page shows every course; the ones not on Stepik yet say «Позже».
export const courses = allCourses;
export const shownCategories = categories.filter((category) => courses.some((course) => course.category === category.id));
// Courses that can be opened or bought on Stepik right now.
export const publishedCourses = allCourses.filter((course): course is Course & { stepikId: number } => course.stepikId !== null);

export const isFree = (course: Course) => course.price === "Бесплатно";
export const isSoon = (course: Course) => course.stepikId === null;

export const stepikUrl = (course: Course & { stepikId: number }) => `https://stepik.org/course/${course.stepikId}/info`;

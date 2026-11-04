// Stepik catalog. To add a course, append an entry; the page groups cards by category, in the
// order of `categories`. A new category is one more entry there (and in CategoryId).
// Spec 5: titles, covers, prices and links are confirmed by Ilia before publishing.

export type CategoryId = "free";

export const categories: Array<{ id: CategoryId; title: string; lead: string }> = [
  { id: "free", title: "Бесплатно", lead: "Курсы на Stepik, которые можно пройти бесплатно в своём темпе." },
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
  stepikId: number;
  cover: { src: string; width: number; height: number };
  showReviews?: boolean;
};

// Spec 5: every course needs its own cover; all three share a placeholder for now.
const sharedCover = { src: "/course-cover-stepik.jpg", width: 230, height: 230 };

export const courses: Course[] = [
  {
    id: "python-basics",
    category: "free",
    subject: "Python",
    title: "Курс по Python",
    description: "Короткая теория и много практики. Задания постепенно усложняются, а к трудной теме можно вернуться в любой момент.",
    audience: "Тем, кто только начинает программировать.",
    outcomes: ["Основы Python через практику", "Решать задачи — от простых к сложным"],
    format: ["Видео и теория", "Тесты и задачи", "Обсуждения"],
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
    description: "Подборка заданий по информатике: сначала база ФИПИ, затем более сложная практика и разбор решений.",
    audience: "Тем, кто готовится к ЕГЭ по информатике.",
    outcomes: ["Решать задания ЕГЭ по темам", "Разбираться в решениях на форуме курса"],
    format: ["Задания по темам", "Домашняя и практическая части", "Форум решений"],
    price: "Бесплатно",
    stepikId: 122969,
    cover: sharedCover,
  },
  {
    id: "ege-variants",
    category: "free",
    subject: "Сборник вариантов",
    title: "Сборники вариантов",
    description: "Официальные варианты ЕГЭ по информатике — для пробников и самостоятельной проверки перед экзаменом.",
    audience: "Тем, кто хочет проверить готовность к экзамену.",
    outcomes: ["Проверять себя на полных вариантах", "Привыкнуть к формату экзамена"],
    format: ["Полные варианты", "Задания в формате экзамена"],
    price: "Бесплатно",
    stepikId: 282248,
    cover: sharedCover,
  },
];

export const stepikUrl = (course: Course) => `https://stepik.org/course/${course.stepikId}/info`;

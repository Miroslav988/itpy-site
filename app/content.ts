// Content of the home page. Facts marked "согласовать" in the spec (ТЗ v1.0)
// must be confirmed by Ilia before publishing; leave a value null to hide it.

export const links = {
  telegramPersonal: "https://t.me/ilandroxxy",
  telegramChannel: "https://t.me/informatika_kege_itpy",
  planerka: "https://planerka.app/ilandroxy/first-lesson",
  diploma: "/media/teacher-diploma.webp",
  officialDocs: "/media/teacher-official.webp",
};

export const planerkaEmbed = {
  url: "https://planerka.app/meet",
  user: "ilandroxy",
  event: "first-lesson",
  script: "https://planerka.app/meet/assets/external/embed.js",
};

export const teacher = {
  name: "Илья Андрианов",
  shortName: "Илья",
  role: "Подготовка к ЕГЭ по информатике",
  photo: { src: "/media/teacher-avatar.webp", width: 1254, height: 1254 },
  // Spec 4.5: a short story about why Ilia teaches ЕГЭ informatics. Hidden until provided.
  story: null as string | null,
  education: "Высшее: бакалавриат «Информатика и вычислительная техника»",
  // Spec 11: confirmed years of teaching. Hidden until provided.
  experienceYears: null as number | null,
  // Spec 4.5: legal wording to be approved before publishing.
  official: "ИП: оплата на расчётный счёт, чек после каждой оплаты",
  taxDeduction: "Документы для налогового вычета 13%",
};

// Spec 4.1: only confirmed figures. Add «учеников подготовлено» and «средний балл»
// here once Ilia confirms them.
export const metrics: Array<{ value: string; label: string }> = [
  { value: "Высшее", label: "IT-образование" },
  { value: "18", label: "отзывов учеников" },
  { value: "60 мин", label: "бесплатное пробное" },
];

export const seasonNote =
  "Набор в пары обычно идёт с середины августа до конца сентября, мест немного. Напишите — подскажу, есть ли место сейчас.";

export type Format = {
  id: string;
  badge: string;
  meta: string;
  title: string;
  rows: Array<{ label: string; value: string }>;
  price: string;
  priceNote?: string;
  note?: string;
  action: "booking" | "telegram";
  actionLabel: string;
  featured?: boolean;
};

export const formats: Format[] = [
  {
    id: "pairs",
    badge: "ПАРА",
    meta: "2 ученика · 60 минут",
    title: "Парные занятия",
    rows: [
      { label: "Кому подходит", value: "Тем, кому важны внимание преподавателя и персональный темп." },
      { label: "Как устроен урок", value: "Живое занятие в Zoom вдвоём: теория, задачи, ответы на вопросы прямо на уроке." },
      { label: "Обратная связь", value: "Сам проверяю домашние задания и разбираю ошибки каждого." },
      { label: "Материалы", value: "Конспекты и домашка в Telegram-боте, задания на Stepik." },
    ],
    price: "2 000 ₽",
    priceNote: "за занятие с ученика",
    note: seasonNote,
    action: "booking",
    actionLabel: "Записаться на пробный урок",
    featured: true,
  },
  {
    id: "webinars",
    badge: "ВЕБИНАРЫ",
    meta: "группа · онлайн",
    title: "Вебинары",
    // Spec 4.2: exact tariffs, schedule and included feedback are still to be confirmed.
    rows: [
      { label: "Кому подходит", value: "Тем, кто готов заниматься в группе. Подходит и тогда, когда места в парах заняты." },
      { label: "Как устроен урок", value: "Онлайн-занятие для группы по тому же маршруту подготовки к ЕГЭ." },
      { label: "Обратная связь", value: "Что входит в тариф — расскажу при знакомстве." },
      { label: "Материалы", value: "Конспекты в Telegram-боте, задания на Stepik." },
    ],
    price: "4 000–5 000 ₽",
    priceNote: "в месяц, ориентир — точные условия уточняются",
    action: "telegram",
    actionLabel: "Уточнить условия",
  },
];

export const steps = [
  { title: "Пробное занятие", text: "Знакомимся, определяем уровень и намечаем маршрут." },
  { title: "Осваиваем базу", text: "Теория и задания из банка ФИПИ." },
  { title: "Решаем сложнее", text: "Задачи повышенной сложности и разбор ошибок." },
  { title: "Пишем пробники", text: "Видим прогресс и закрываем пробелы." },
  { title: "Сдаём экзамен", text: "С отработанными заданиями и планом действий." },
];

// Spec 4.3: check each item against the real terms of both formats.
export const features = [
  { title: "Живые занятия в Zoom", text: "В паре или на вебинаре — с преподавателем, а не в записи." },
  { title: "Домашка с обратной связью", text: "Разбираю ошибки, а не просто ставлю «верно / неверно»." },
  { title: "Конспекты всегда под рукой", text: "Telegram-бот с конспектами и домашкой — можно вернуться к теме." },
];

export const environment = [
  { name: "Zoom", role: "Живые занятия", text: "Объясняю тему, показываю решение и отвечаю на вопросы прямо на уроке.", icon: "/brands/zoom.png" },
  { name: "Telegram", role: "Канал, бот и связь", text: "Конспекты, домашка и расписание в боте, полезное в канале, вопросы — мне в личные.", icon: "/brands/telegram.svg", link: { href: links.telegramChannel, label: "Открыть канал ↗", external: true } },
  { name: "Stepik", role: "Курсы и задания", text: "Задания для работы между уроками и курсы для самостоятельной подготовки.", icon: "/brands/stepik.webp", link: { href: "/courses", label: "Каталог курсов →", external: false } },
];

export const answerSheet = [
  { question: "Как будет на занятиях?", answer: "ПОНЯТНО" },
  { question: "Кто ведёт занятия?", answer: "ИЛЬЯ,САМ" },
];

export const reviews = Array.from({ length: 18 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const [width, height] = index < 2 ? [1536, 1024] : index === 17 ? [1280, 960] : [1448, 1086];
  return {
    src: `/reviews/review-${number}.webp`,
    thumb: `/reviews/thumbs/review-${number}.webp`,
    width,
    height,
  };
});

export const faqs = [
  {
    q: "Я не умею программировать. Мне вообще сюда можно?",
    a: "Можно. Начальный уровень не проблема: сначала разбираемся с базой, а потом постепенно переходим к экзаменационным задачам и коду.",
  },
  {
    q: "Я в 10 классе. Начинать сейчас или подождать?",
    a: "Начать заранее — хорошая идея: будет больше времени спокойно разобраться в темах и набрать практику без гонки перед экзаменом.",
  },
  {
    q: "Чем пара отличается от вебинара?",
    a: "В паре вас двое: больше времени на вопросы каждого и персональный темп. Вебинар — занятие для группы по тому же маршруту подготовки. На пробном уроке подскажу, что подойдёт именно тебе.",
  },
  {
    q: "Сколько стоит подготовка?",
    a: "Парное занятие — 2 000 ₽ с ученика за 60 минут. Вебинары — ориентировочно 4 000–5 000 ₽ в месяц, точные условия расскажу при знакомстве. Пробное занятие бесплатное.",
  },
  {
    q: "Есть ли сейчас места в паре?",
    a: "Набор в пары обычно идёт с середины августа до конца сентября, мест немного. Напишите в Telegram — скажу, есть ли место сейчас, или предложу вебинары.",
  },
  {
    q: "Как проходит пробное занятие?",
    a: "Это бесплатное знакомство онлайн, около 60 минут. Определим уровень, разберём несколько задач вместе и составим план подготовки. Можно прийти с родителем.",
  },
  {
    q: "Запоминаю шаблоны, но не понимаю код. Что делать?",
    a: "Не зубрить ещё больше. Я разбираю, что делает каждая часть программы и почему решение работает — тогда изменение условия уже не ломает всю задачу.",
    // The home page links a blog breakdown with line-by-line code comments here.
    showsCommentedExample: true,
  },
];

// Content of the home page. Facts marked "согласовать" in the spec (ТЗ v1.0)
// must be confirmed by Ilia before publishing; leave a value null to hide it.

import type { IconName } from "./ui";

export const links = {
  telegramPersonal: "https://t.me/ilandroxxy",
  telegramChannel: "https://t.me/informatika_kege_itpy",
  dzen: "https://dzen.ru/informatika_kege_itpy",
  planerka: "https://planerka.app/ilandroxy/first-lesson",
  // Where «Получить запись урока» leads. The channel until Ilia gives the post or bot link.
  freeLesson: "https://t.me/informatika_kege_itpy",
  // Not provided yet; the buttons that need these stay hidden while they are null.
  avito: null as string | null,
  license: null as string | null,
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
  // The same photo with the background removed, for the hero.
  cutout: { src: "/media/teacher-cutout.webp", width: 811, height: 1068 },
  // The polaroid in «О преподавателе».
  portrait: { src: "/media/teacher-desk.webp", width: 865, height: 960 },
};

export const aboutFacts: Array<{ label: string; value: string; link?: { href: string; label: string } }> = [
  { label: "Образование", value: "Бакалавриат: Информатика и вычислительная техника", link: { href: links.diploma, label: "Диплом" } },
  { label: "Дополнительное обучение", value: "Яндекс Практикум, профессиональная переподготовка и повышение квалификации" },
  { label: "Официальная деятельность", value: "ИП, образовательная лицензия", link: links.license ? { href: links.license, label: "Лицензия" } : undefined },
  { label: "Налоговый вычет", value: "Возможен при соблюдении установленных условий и наличии необходимых документов", link: { href: links.officialDocs, label: "Подробнее о вычете" } },
];

// Texts below follow the owner's change log (Notion, November 2026).
export const heroFacts: Array<{ title: string; text: string; icon: IconName }> = [
  { title: "Высшее образование", text: "Закончил IT-направление «Информатика и вычислительная техника»", icon: "cap" },
  { title: "Работаю официально", text: "Как ИП и имею лицензию на образовательную деятельность", icon: "briefcase" },
  { title: "150+ отзывов на Авито", text: "Реальные отзывы учеников и родителей", icon: "message" },
];

export const heroFormats: Array<{ title: string; text: string; icon: IconName }> = [
  { title: "Парные занятия", text: "Готовимся в мини-группе из 2 человек", icon: "users" },
  { title: "Вебинары", text: "Онлайн-занятия с теорией и практикой", icon: "radio" },
  { title: "Курсы в записи", text: "Готовые уроки, которые можно проходить в удобном темпе на платформе Stepik", icon: "play" },
];

export type Format = {
  id: string;
  title: string;
  subtitle?: string;
  meta: string;
  rows: Array<{ label: string; value: string }>;
  price: string;
  priceNote?: string;
  action: "booking" | "telegram" | "courses";
  actionLabel: string;
};

// Shown under the cards so that all three keep the same layout.
export const pairsNote = "Количество мест ограничено. Рекомендую записываться заранее. Уточняйте наличие мест.";

export const formats: Format[] = [
  {
    id: "pairs",
    title: "Парные занятия",
    meta: "2 ученика · 60 минут",
    rows: [
      { label: "Кому подходит", value: "Тем, кому важны внимание преподавателя и персональный темп." },
      { label: "Как устроен урок", value: "Живое занятие в Zoom вдвоём: теория, задачи, ответы на вопросы прямо на уроке." },
      { label: "Обратная связь", value: "Сам проверяю домашние задания и разбираю ошибки каждого." },
      { label: "Материалы", value: "Конспекты и домашка в Telegram-боте, задания на Stepik." },
    ],
    price: "2 000 ₽",
    priceNote: "за занятие с ученика",
    action: "booking",
    actionLabel: "Записаться на пробный урок",
  },
  {
    id: "webinars",
    title: "Вебинары",
    subtitle: "Занятия проходят в Zoom",
    meta: "2 раза в неделю",
    rows: [
      { label: "Кому подходит", value: "Всем, кто готовится к ЕГЭ и хочет системно пройти весь материал." },
      { label: "Как устроен урок", value: "Встречаемся 2 раза в неделю по 1,5 часа. На каждом занятии разбираем одну тему и одно задание ЕГЭ." },
      { label: "Обратная связь", value: "Вопросы в чате во время занятия и поддержка кураторов: разбор домашних заданий и ответы на вопросы." },
      { label: "Материалы", value: "Конспекты и видеоконспекты после каждого урока, домашние задания на Stepik (без письменных работ)." },
    ],
    price: "4 999 ₽",
    priceNote: "в месяц",
    action: "telegram",
    actionLabel: "Уточнить условия",
  },
  {
    id: "recorded",
    title: "Курсы в записи на платформе Stepik",
    meta: "в удобном темпе",
    rows: [
      { label: "Кому подходит", value: "Тем, кто хочет изучать материал самостоятельно и в своём темпе." },
      { label: "Как устроен курс", value: "Последовательные видеоуроки и текстовые уроки с теорией, практикой и разбором задач." },
      { label: "Обратная связь", value: "Проверка решений на платформе и разборы в комментариях." },
      { label: "Материалы", value: "Видеоуроки, текстовые конспекты, дополнительные материалы и задания на Stepik." },
    ],
    price: "от 0 ₽",
    priceNote: "за курс",
    action: "courses",
    actionLabel: "Посмотреть каталог курсов",
  },
];

export const steps: Array<{ title: string; text: string; icon: IconName }> = [
  { title: "Оценка знаний и старт", text: "Определяем текущий уровень, настраиваем все инструменты и включаемся в процесс.", icon: "laptop" },
  { title: "Осваиваем базу ФИПИ", text: "Последовательно разбираем задания из банка ФИПИ, формируем прочную базу и учимся решать основные прототипы.", icon: "book" },
  { title: "Решаем более сложные задачи", text: "Разбираем мои авторские задания, чтобы лучше ориентироваться в новых и изменённых формулировках.", icon: "code" },
  { title: "Регулярно пишем пробники", text: "Проверяем прогресс в течение подготовки и вовремя закрываем пробелы.", icon: "checklist" },
  { title: "Сдаём экзамен", text: "Разбираем с вами дальневосточные варианты и финально готовимся к ЕГЭ.", icon: "cap" },
];

// Spec 4.3: check each item against the real terms of both formats.
export const features: Array<{ title: string; text: string; icon: IconName }> = [
  { title: "Живые занятия в Zoom", text: "В паре или на вебинаре — в реальном времени, с возможностью задать любой вопрос.", icon: "video" },
  { title: "Поддержка кураторов", text: "Кураторы помогают с домашними заданиями, отвечают на вопросы и следят за твоим прогрессом.", icon: "users" },
  { title: "Удобные материалы", text: "Доступны видео-конспекты с уроков и текстовые конспекты для быстрого повторения.", icon: "layers" },
];

export const environment: Array<{
  name: string;
  role: string;
  icon: string;
  text?: string;
  points?: string[];
  link: { href: string; label: string; external: boolean };
}> = [
  {
    name: "Zoom",
    role: "Занятия и вебинары",
    icon: "/brands/zoom.png",
    text: "Все занятия проходят в Zoom с записью — можно присутствовать онлайн или смотреть в удобное время.",
    link: { href: "/#formats", label: "Посмотреть форматы →", external: false },
  },
  {
    name: "Telegram",
    role: "Канал и поддержка",
    icon: "/brands/telegram.svg",
    points: [
      "Канал с конспектами, полезными материалами и новостями",
      "Бот куратора — помощь с домашними заданиями и ответы на вопросы между занятиями",
    ],
    link: { href: links.telegramChannel, label: "Открыть канал →", external: true },
  },
  {
    name: "Stepik",
    role: "Практика и курсы",
    icon: "/brands/stepik.webp",
    points: [
      "Домашние задания с автоматической проверкой для учеников занятий",
      "Бесплатные и платные курсы: видеоуроки, текстовые объяснения и практика по темам ЕГЭ",
    ],
    link: { href: "/courses", label: "Перейти к курсам →", external: false },
  },
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
    a: "Парное занятие — 2 000 ₽ с ученика за 60 минут. Вебинары — 4 999 ₽ в месяц, два занятия в неделю. Пробное занятие бесплатное.",
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

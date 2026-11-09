import { posts } from "./blog/posts";
import { aboutFacts, environment, faqs, features, formats, links, pairsNote, steps } from "./content";
import { courses, stepikUrl } from "./courses/catalog";

// Plain-text descriptions of the site for AI assistants (the llms.txt convention).
// Built from the same data as the pages, so they cannot drift apart. Facts only: no
// instructions to the reader and nothing the site does not state itself.

const published = posts.filter((post) => !post.draft);
const taskNumbers = [...new Set(published.flatMap((post) => (post.task ? [post.task] : [])))].sort((a, b) => a - b);
const inTask = (task: number) => published.filter((post) => post.task === task);

const summary = `ITPY — авторский проект преподавателя Ильи Андрианова: онлайн-подготовка школьников 10–11 классов к ЕГЭ по информатике (КЕГЭ). Форматы: занятия в паре, вебинары и курсы в записи на Stepik. ITPY — не онлайн-школа: занятия преподаватель проводит лично.`;

const keyFacts = [
  "Предмет: только ЕГЭ по информатике, 10–11 класс.",
  "Преподаватель: Илья Андрианов (@ilandroxxy), готовит к ЕГЭ по информатике с 2019 года.",
  ...aboutFacts.map((fact) => `${fact.label}: ${fact.value}.`),
  "Отзывы: 150+ отзывов учеников и родителей на Авито.",
  "Формат обучения: онлайн, живые занятия в Zoom с записью.",
  "Первый шаг: бесплатное пробное занятие онлайн, около 60 минут.",
  ...formats.map((format) => `${format.title}: ${format.price}${format.priceNote ? ` ${format.priceNote}` : ""}.`),
];

const contacts = (origin: string) => [
  `- [Записаться на бесплатное пробное занятие](${links.planerka})`,
  `- [Написать Илье в Telegram](${links.telegramPersonal})`,
  `- [Telegram-канал](${links.telegramChannel})`,
  `- [Канал на Дзене](${links.dzen})`,
  `- [Сайт](${origin}/)`,
];

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export function llmsIndex(origin: string) {
  return `# ITPY — подготовка к ЕГЭ по информатике

> ${summary}

## Ключевые факты

${list(keyFacts)}

## Страницы

- [Занятия, цены и вопросы](${origin}/): форматы подготовки, маршрут, отзывы, сведения о преподавателе, частые вопросы.
- [Курсы на Stepik](${origin}/courses): записанные курсы и сборники вариантов для самостоятельной подготовки.
- [Блог](${origin}/blog): разборы заданий ЕГЭ по информатике с решением на Python. Статей в блоге: ${published.length}.
- [Полное описание](${origin}/llms-full.txt): условия всех форматов, маршрут подготовки, ответы на вопросы и список всех статей.

## Разборы заданий ЕГЭ по номерам

${taskNumbers.map((task) => `- [Задание ${task}](${origin}/blog?task=${task}): разборов — ${inTask(task).length}`).join("\n")}

## Контакты

${contacts(origin).join("\n")}
`;
}

export function llmsFull(origin: string) {
  const formatSections = formats.map((format) => `### ${format.title}

${format.subtitle ? `${format.subtitle}. ` : ""}${format.meta.charAt(0).toUpperCase()}${format.meta.slice(1)}.

${list(format.rows.map((row) => `${row.label}: ${row.value}`))}
- Стоимость: ${format.price}${format.priceNote ? ` ${format.priceNote}` : ""}.
`);

  const environmentLines = environment.map((item) => `- ${item.name} (${item.role.toLowerCase()}): ${item.text ?? `${item.points?.join("; ")}.`}`);
  const courseLines = courses.map((course) => `- [${course.title}](${stepikUrl(course)}) — ${course.price ?? "цена на странице курса"}. ${course.description} ${course.audience}`);
  const taskArticles = taskNumbers.map((task) => `### Задание ${task}\n\n${inTask(task).map((post) => `- [${post.title}](${origin}/blog/${post.slug})`).join("\n")}\n`);
  const guides = published.filter((post) => !post.task).map((post) => `- [${post.title}](${origin}/blog/${post.slug})`);

  return `# ITPY — подготовка к ЕГЭ по информатике: полное описание

> ${summary}

## Ключевые факты

${list(keyFacts)}

## Форматы подготовки и цены

${formatSections.join("\n")}
Парные занятия: ${pairsNote}

## Как устроена подготовка

Маршрут — для регулярной подготовки с преподавателем (пары и вебинары). Курсы в записи на Stepik имеют собственные программы.

${steps.map((step, index) => `${index + 1}. ${step.title}. ${step.text}`).join("\n")}

${list(features.map((feature) => `${feature.title}: ${feature.text}`))}

## Где проходит обучение

${environmentLines.join("\n")}

## Курсы на Stepik

${courseLines.join("\n")}

## Частые вопросы

${faqs.map((item) => `### ${item.q}\n\n${item.a}\n`).join("\n")}
## Контакты

${contacts(origin).join("\n")}

## Разборы заданий ЕГЭ

${taskArticles.join("\n")}
## Другие статьи

${guides.join("\n")}
`;
}

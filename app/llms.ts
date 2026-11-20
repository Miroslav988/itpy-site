import { getPosts, hasPage, rubrics, type Rubric } from "./blog/posts";
import { aboutFacts, environment, faqs, features, formats, links, pairsNote, steps } from "./content";
import { publishedCourses, stepikUrl } from "./courses/catalog";

// Plain-text descriptions of the site for AI assistants (the llms.txt convention).
// Built from the same data as the pages, so they cannot drift apart. Facts only: no
// instructions to the reader and nothing the site does not state itself.

// The blog changes while the site runs, so it is read on every request.
const published = () => getPosts().filter(hasPage);
const taskNumbers = () => [...new Set(published().flatMap((post) => (post.rubric === "breakdown" && post.task ? [post.task] : [])))].sort((a, b) => a - b);
const inTask = (task: number) => published().filter((post) => post.rubric === "breakdown" && post.task === task);
const inRubric = (rubric: Rubric) => published().filter((post) => post.rubric === rubric);

const summary = `ITPY — авторский проект преподавателя Ильи Андрианова: онлайн-подготовка школьников 10–11 классов к ЕГЭ по информатике (КЕГЭ). Форматы: занятия в паре, вебинары и курсы в записи на Stepik. ITPY — не онлайн-школа: занятия преподаватель проводит лично.`;

const keyFacts = [
  "Предмет: только ЕГЭ по информатике, 10–11 класс.",
  "Преподаватель: Илья Андрианов (@ilandroxxy), готовит к ЕГЭ по информатике с 2019 года.",
  ...aboutFacts.map((fact) => `${fact.label}: ${fact.value}.`),
  `Лицензия: № Л035-01199-54/05101221 от 21 мая 2026 года, Министерство образования Новосибирской области, дополнительное образование детей и взрослых. Запись в реестре: ${links.license}.`,
  `Отзывы: 150+ отзывов учеников и родителей на Авито: ${links.avito}.`,
  "Формат обучения: онлайн, живые занятия по видеосвязи с записью.",
  "Первый шаг: бесплатное пробное занятие онлайн, около 60 минут.",
  ...formats.map((format) => `${format.title}: ${format.price}${format.priceNote ? ` ${format.priceNote}` : ""}.`),
];

const contacts = (origin: string) => [
  `- [Записаться на бесплатное пробное занятие](${links.planerka})`,
  `- [Написать Илье](${links.telegramPersonal})`,
  `- [Канал](${links.telegramChannel})`,
  `- [Видеоблог](${links.youtube})`,
  `- [VK](${links.vk})`,
  `- [Отзывы на Авито](${links.avito})`,
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
- [Блог](${origin}/blog): разборы заданий ЕГЭ по информатике с решением на Python, Python-шпаргалки, официальные варианты и подборки. Статей в блоге: ${published().length}.
- [Python-шпаргалки](${origin}/blog?rubric=python): ${inRubric("python").length} заметок о функциях и библиотеках Python для ЕГЭ.
- [Полезное](${origin}/blog?rubric=useful): официальные варианты ЕГЭ с файлами, дайджесты и подборки.
- [Полное описание](${origin}/llms-full.txt): условия всех форматов, маршрут подготовки, ответы на вопросы и список всех статей.

## Разборы заданий ЕГЭ по номерам

${taskNumbers().map((task) => `- [Задание ${task}](${origin}/blog?task=${task}): разборов — ${inTask(task).length}`).join("\n")}

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

  const environmentLines = environment.map((item) => `- ${item.name} (${item.role.toLowerCase()}): ${item.text.map((line) => (/[.!?]$/.test(line) ? line : `${line}.`)).join(" ")}`);
  const courseLines = publishedCourses.map((course) => `- [${course.title}](${stepikUrl(course)}) — ${course.price ?? "цена на странице курса"}. ${course.description} ${course.audience}`);
  const taskArticles = taskNumbers().map((task) => `### Задание ${task}\n\n${inTask(task).map((post) => `- [${post.title}](${origin}/blog/${post.slug})`).join("\n")}\n`);
  const notes = (rubric: Rubric) => inRubric(rubric).map((post) => `- [${post.title}](${origin}/blog/${post.slug})`).join("\n");

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

${faqs.map((item) => `### ${item.q}\n\n${item.a.join("\n\n")}\n`).join("\n")}
## Контакты

${contacts(origin).join("\n")}

## Разборы заданий ЕГЭ

${taskArticles.join("\n")}
## ${rubrics.python.heading}

${notes("python")}

## ${rubrics.useful.heading}

${notes("useful")}
`;
}

# ITPY

Сайт Ильи Андрианова: подготовка к ЕГЭ по информатике (`/`), каталог курсов на Stepik (`/courses`) и блог (`/blog`).
Стек — Next.js 16 (App Router), Node.js `>=22.13.0`. В продакшене сайт запускается из Docker-образа.

## Команды

```bash
npm install
npm run dev     # локальная разработка
npm run build   # сборка
npm start       # запустить собранную версию
npm test        # сборка + проверки отрендеренных страниц через next start
npm run lint
```

## Docker

```bash
docker compose up -d --build   # собрать образ и запустить на :3000
docker compose logs -f         # логи
```

Образ многоэтапный: `next build` с `output: "standalone"`, в финальном слое только `server.js`, нужные
`node_modules`, статика, `public/` и статьи блога; процесс работает не от root. При сборке нужен интернет —
`next/font` скачивает шрифты Onest и Caveat. HTTPS и домен — на обратном прокси (nginx, Caddy, Traefik)
перед контейнером; прокси должен передавать `Host` или `X-Forwarded-Host` и `X-Forwarded-Proto`, по ним сайт
строит абсолютные адреса в sitemap и Open Graph.

## Где менять контент

| Что | Файл |
|---|---|
| Тексты главной: форматы и цены, маршрут, FAQ, факты о преподавателе, цифры, ссылки | `app/content.ts` |
| Каталог курсов Stepik | `app/courses/catalog.ts` |
| Статьи блога (импорт с Дзена) | `content/blog/*.json`, картинки в `public/blog/<slug>/` |
| Отзывы (скриншоты) | `public/reviews/review-NN.webp` + превью в `public/reviews/thumbs/` |
| Стили | `app/globals.css` |

Неподтверждённые факты не выводятся: `teacher.story` и `teacher.experienceYears` со значением `null` скрыты,
в `metrics` — только подтверждённые цифры (ТЗ, п. 4.1).

### Добавить курс

Добавьте объект в массив `courses` в `app/courses/catalog.ts`: `category`, `subject` (надпись на плашке),
`title`, `description`, `audience`, `outcomes`, `format`, `price` (`null` — «цена на странице курса»),
`stepikId` и `cover`. Карточка встанет в ряд своей категории. Сейчас категория одна — «Бесплатно»;
новая категория — ещё одна запись в `categories` (и её `id` в `CategoryId`), она сама появится на странице
и в меню. Чтобы показывать отзывы со Stepik, поставьте `showReviews: true` и добавьте `stepikId`
в `allowedCourses` в `app/api/course-reviews/route.ts`.

### Добавить отзыв

```bash
cwebp -q 80 -metadata none review-19.png -o public/reviews/review-19.webp
cwebp -q 78 -resize 720 0 -metadata none review-19.png -o public/reviews/thumbs/review-19.webp
```

Затем увеличьте `length` в `reviews` в `app/content.ts` (и размеры, если картинка не 1448×1086).
Публикуйте отзывы только с согласием ученика (для несовершеннолетних — родителя).

## Блог

Статьи импортируются с канала на Дзене и хранятся в репозитории, сайт рендерит их сам (`/blog`, `/blog/<slug>`):

```bash
npm run blog:import -- https://dzen.ru/<канал>            # только новые статьи
npm run blog:import -- https://dzen.ru/<канал> --force    # перезалить все
npm run blog:import -- --article https://dzen.ru/a/<id>   # одна статья
```

Скрипт открывает Дзен в локальном Chrome (путь можно задать через `CHROME_PATH`), сводит каждую статью
к одному набору блоков — абзац, заголовок, список, цитата, код, картинка — и выбрасывает оформление Дзена,
поэтому все статьи выглядят одинаково (стили — раздел «Blog» в `app/globals.css`). Картинки скачиваются
в `public/blog/<slug>/` и при наличии `cwebp` сжимаются в WebP. Адрес статьи — транслит заголовка.
После импорта проверьте статьи локально и закоммитьте `content/blog` и `public/blog`.

Разборы задач приводятся к одному виду по шаблону из [docs/dzen-article-template.md](docs/dzen-article-template.md):
номер задания берётся из `#ЕГЭ5` в заголовке, строка «Автор/Уровень» становится метками, промо-цитаты в конце
отрезаются, а текст кнопки записи берётся из строки «Пробное: …» или строится по номеру задания.
В `/blog` есть фильтр по номеру задания (`?task=5`) и страницы по 24 статьи.

После импорта автоматически запускается `npm run blog:reshape` (можно и вручную, без сети): он заново
применяет правила заголовков из `scripts/blog-shape.mjs` к сохранённым `originalTitle`, переименовывает адреса,
скрывает перепосты (оставляет самый свежий) и статьи без текста — одна картинка. Скрытые статьи остаются
в `content/blog` с `"hidden": true` и на сайте не показываются; чтобы вернуть статью, удалите этот флаг.

## Запись на пробное

Запись идёт через виджет Планёрки (`app/booking/Booking.tsx`), своей базы заявок у сайта нет.
Любая кнопка `BookingButton` открывает окно с календарём; без JavaScript это обычная ссылка на Планёрку.

## SEO

`app/robots.ts` и `app/sitemap.ts` строят абсолютные адреса по хосту запроса — после выбора домена
ничего менять не нужно. Картинка для соцсетей — `public/og.png` (1200×630).

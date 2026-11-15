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
| Статьи блога (из канала, обновляются сами) | `content/blog/posts/*.json`, картинки в `content/blog/media/` |
| Отзывы (скриншоты) | `public/reviews/review-NN.webp` + превью в `public/reviews/thumbs/` |
| Стили | `app/globals.css` |

Фото на первом экране — снимок без фона (`public/media/teacher-cutout.webp`, вырезан через macOS Vision); при замене
фото его нужно вырезать заново.

### Добавить курс

Добавьте объект в массив `allCourses` в `app/courses/catalog.ts`: `category`, `subject` (надпись на плашке),
`title`, `description`, `audience`, `outcomes`, `format`, `price` (`null` — «цена на странице курса»),
`stepikId` и `cover`. Карточка встанет в ряд своей категории. Категории — «Бесплатно», «Мини-курсы»,
«Вторая часть», «Отдельные номера», «Большие курсы»; новая — ещё одна запись в `categories` (и её `id`
в `CategoryId`), кнопки-фильтры в шапке каталога — `filters`.

Курс с `stepikId: null` — черновик: на сайте его нет, пустая категория и её фильтр тоже не показываются.
Так сейчас лежат девять платных курсов из макета — они появятся, когда у них будут страницы на Stepik.
Посмотреть каталог с черновиками: собрать с `NEXT_PUBLIC_CATALOG_DRAFTS=1`.

Чтобы показывать отзывы со Stepik, поставьте `showReviews: true` и добавьте `stepikId`
в `allowedCourses` в `app/api/course-reviews/route.ts`.

### Добавить отзыв

```bash
cwebp -q 80 -metadata none review-19.png -o public/reviews/review-19.webp
cwebp -q 78 -resize 720 0 -metadata none review-19.png -o public/reviews/thumbs/review-19.webp
```

Затем увеличьте `length` в `reviews` в `app/content.ts` (и размеры: сейчас первая карточка 1448×1086, остальные 1536×1024).
Публикуйте отзывы только с согласием ученика (для несовершеннолетних — родителя).

## Блог

Блог собирается из постов канала [informatika_kege_itpy](https://t.me/s/informatika_kege_itpy): рубрику
определяет хештег (`#ЕГЭ1–27` — разборы, `#tpy` — Python, `#useful` — полезное, `#news` — новости, `#view` — видео). Правила
для постов — [docs/telegram-posts.md](docs/telegram-posts.md).

- **Автоматически.** Запущенный сайт (`npm start` / `node server.js`) раз в 30 минут читает публичную ленту
  канала `t.me/s/…` и дописывает новые посты (`instrumentation.ts` → `scripts/telegram/sync.mjs`). Ключи и
  логин в Telegram не нужны. Интервал — `BLOG_SYNC_MINUTES`, выключить — `BLOG_SYNC=off`, другой канал —
  `BLOG_CHANNEL`, другая папка с данными — `BLOG_DIR`.
- **Вручную.** `npm run blog:sync` — новые посты, `npm run blog:sync -- --all` — весь канал заново.
- **Где лежит.** `content/blog/posts/<id поста>.json`, картинки — `content/blog/media/` (отдаёт маршрут
  `/blog-media/…`: `public/` Next.js раздаёт только в том виде, в каком она была при сборке),
  `content/blog/state.json` — последний прочитанный пост. Папка должна быть доступна серверу на запись.
- **Как устроено.** `scripts/telegram/parse.mjs` разбирает HTML ленты, `shape.mjs` превращает пост в статью
  (подзаголовки, нумерованные пояснения к коду, метки задачи, без ссылок на канал и чат), `sync.mjs`
  хранит статьи, прячет повторы и не меняет адрес уже опубликованной статьи. В репозитории лежит снимок
  канала на момент коммита; сайт дальше дополняет его сам.

## Запись на пробное

Запись идёт через виджет Планёрки (`app/booking/Booking.tsx`), своей базы заявок у сайта нет.
Любая кнопка `BookingButton` открывает окно с календарём; без JavaScript это обычная ссылка на Планёрку.

## SEO

Когда будет выбран домен, задайте переменную окружения `SITE_URL=https://домен`: канонические адреса, sitemap и Open Graph
перестанут зависеть от хоста запроса. Без неё адреса строятся по `Host` / `X-Forwarded-Host`.
Картинка для соцсетей — `public/og.png` (1200×630).

| Что | Где |
|---|---|
| Заголовки, описания, canonical, Open Graph | `pageMetadata` в `app/seo.tsx` |
| Разметка schema.org (JSON-LD): человек, услуги и цены, FAQ, курсы, статьи, хлебные крошки | `app/seo.tsx` |
| Правила для роботов, в том числе ИИ-краулеров | `app/robots.ts` |
| Карта сайта: страницы, разборы по номерам заданий, статьи | `app/sitemap.ts` |
| `/llms.txt` и `/llms-full.txt` — описание сайта для нейросетей | `app/llms.ts` |

Всё это строится из `app/content.ts`, `app/courses/catalog.ts` и `content/blog`: достаточно поменять данные.
В разметку и `llms.txt` идут только факты, которые есть на сайте.

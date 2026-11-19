import Link from "next/link";
import { Icon } from "../ui";
import { Drawing, Strokes, type Picture } from "../illustrations";
import { cardText, formatDate, hasPage, readingMinutes, rubrics, taskLabel, type Post } from "./posts";

// The handwritten word on a card's coloured band: the task number for breakdowns, the topic of a
// Python note (by its title) and a short word for the other rubrics.
const pythonTopics: Array<[RegExp, string]> = [
  [/turtle|черепах/, "turtle"],
  [/\bre\b|регуляр/, "re"],
  [/срез/, "[a:b]"],
  [/генератор/, "[x for x]"],
  [/списк[иаоу]|списков|\blist\b/, "[1, 2, 3]"],
  [/словар|\bdict\b/, "{k: v}"],
  [/множеств|\bset\b/, "set()"],
  [/счислен/, "base"],
  [/делител/, "n % d"],
  [/цикл|\bfor\b|\bwhile\b/, "for / while"],
  [/return/, "return"],
  [/range/, "range()"],
  [/index/, ".index()"],
  [/строк|\bstr\b/, "str"],
  [/единиц|байт|\bбит/, "бит / байт"],
  [/import|библиотек|itertools/, "import"],
  [/функци/, "def"],
];

const usefulTopics: Array<[RegExp, string]> = [
  [/дайджест/, "Дайджест"],
  [/вариант/, "Варианты"],
  [/шкал|балл/, "Баллы"],
  [/pycharm|установ|программ/, "Софт"],
  [/викторин|вопрос/, "Вопрос"],
  [/досрочн|как проходит/, "Экзамен"],
];

const topic = (title: string, topics: Array<[RegExp, string]>) => topics.find(([pattern]) => pattern.test(title.toLowerCase()))?.[1];

// Spreadsheet tasks get a table, algorithm tasks a flow chart, the rest a laptop with code.
const taskPicture = (task?: number): Picture =>
  task && [3, 9, 18, 22].includes(task) ? "sheet" : task && [5, 6, 12, 14, 16, 23].includes(task) ? "flow" : "laptop";

function band(post: Post): { word: string; picture: Picture } {
  switch (post.rubric) {
    case "breakdown":
      return { word: `№ ${taskLabel(post) ?? ""}`, picture: taskPicture(post.task) };
    case "python":
      return { word: topic(post.title, pythonTopics) ?? "Python", picture: "python" };
    case "useful":
      return { word: topic(post.title, usefulTopics) ?? "Подготовка", picture: "clipboard" };
    case "news":
      return { word: "Что нового?", picture: "megaphone" };
    default:
      return { word: "Видео", picture: "play" };
  }
}

const tag = (post: Post) =>
  post.rubric === "breakdown" && post.task ? `Задание № ${taskLabel(post)}` : post.rubric === "python" ? "Python" : rubrics[post.rubric].label;

export default function PostCard({ post }: { post: Post }) {
  // Videos have no page: the card opens the video.
  const external = !hasPage(post);
  const { word, picture } = band(post);
  const thumb = post.rubric === "video" ? post.video?.thumb : undefined;

  return (
    <article className={`post-card post-card-is-${post.rubric}`}>
      <div className={`post-band post-band-${post.rubric}`} aria-hidden="true">
        {thumb && <img className="post-band-thumb" src={thumb.src} alt="" width={thumb.width} height={thumb.height} loading="lazy" decoding="async" />}
        <span className="post-badge">{rubrics[post.rubric].badge}</span>
        {thumb ? <span className="post-band-play"><Icon name="play" /></span> : <span className="post-band-word">{word}</span>}
        {!thumb && <Drawing name={picture} className="post-band-pic" />}
        {!thumb && <Strokes className="post-band-strokes" />}
      </div>
      <div className="post-card-body">
        <h3>
          {external ? (
            <a href={post.video?.href ?? post.source} target="_blank" rel="noopener noreferrer">{post.title}</a>
          ) : (
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          )}
        </h3>
        {cardText(post) && <p className="post-card-text">{cardText(post)}</p>}
        <p className="post-card-foot">
          <span className="post-meta">
            <Icon name="calendar" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {!external && <> · {readingMinutes(post)} мин</>} · {tag(post)}
          </span>
          <span className="post-card-more" aria-hidden="true">{external ? "Смотреть ↗" : "Читать →"}</span>
        </p>
      </div>
    </article>
  );
}

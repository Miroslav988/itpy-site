"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { faqs } from "./content";
import { Icon } from "./ui";

// On wide screens the questions scroll inside the frame (arrows on the right); on phones the
// first ten are shown and the rest open with one button. All answers are in the HTML either way.
const FIRST = 10;

export default function FaqList() {
  const listRef = useRef<HTMLDivElement>(null);
  const [all, setAll] = useState(false);
  // The track on the right mirrors the list's scroll position (the native bar is hidden).
  const [thumb, setThumb] = useState({ top: 0, size: 1 });
  const update = useCallback(() => {
    const list = listRef.current;
    if (list) setThumb({ top: list.scrollTop / list.scrollHeight, size: list.clientHeight / list.scrollHeight });
  }, []);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const item of list.children) observer.observe(item);
    return () => observer.disconnect();
  }, [update]);
  const scroll = (direction: number) => listRef.current?.scrollBy({ top: direction * 260, behavior: "smooth" });

  return (
    <div className="faq-panel" data-all={all || undefined}>
      <div className="faq-list" ref={listRef} onScroll={update}>
        {faqs.map((item, index) => (
          <details key={item.q} open={index === 0} className={index >= FIRST ? "faq-extra" : undefined}>
            <summary>
              <span className="faq-question">{item.q}</span>
              <span className="faq-sign" aria-hidden="true" />
            </summary>
            {item.a.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
          </details>
        ))}
      </div>
      <div className="faq-scroll" aria-hidden="true" hidden={thumb.size >= 1}>
        <button type="button" tabIndex={-1} onClick={() => scroll(-1)}><Icon name="chevronUp" /></button>
        <span className="faq-track"><span className="faq-thumb" style={{ top: `${thumb.top * 100}%`, height: `${thumb.size * 100}%` }} /></span>
        <button type="button" tabIndex={-1} onClick={() => scroll(1)}><Icon name="chevronDown" /></button>
      </div>
      {!all && (
        <button className="btn btn-outline faq-all" type="button" onClick={() => setAll(true)}>
          Все вопросы ({faqs.length}) <span aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}

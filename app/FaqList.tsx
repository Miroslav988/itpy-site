"use client";

import { useState } from "react";
import { faqs } from "./content";

// A plain list with dividers: the first questions are shown, the rest open with one button.
// All answers are in the HTML either way, for search engines.
const FIRST = 8;

export default function FaqList() {
  const [all, setAll] = useState(false);

  return (
    <div className="faq-panel" data-all={all || undefined}>
      <div className="faq-list">
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
      {!all && (
        <button className="faq-all" type="button" onClick={() => setAll(true)}>
          Показать все вопросы ({faqs.length}) <span aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}

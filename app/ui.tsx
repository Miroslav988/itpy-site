import type { ReactNode } from "react";

export function SectionHead({ part, title, lead, id }: { part: string; title: ReactNode; lead?: ReactNode; id?: string }) {
  return (
    <div className="section-head">
      <div>
        <p className="part-label">{part}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}

// Block letters in exam answer cells; screen readers get the plain phrase.
export function AnswerCells({ text }: { text: string }) {
  const spoken = text.charAt(0) + text.slice(1).toLowerCase().replace(/,/g, ", ");
  return (
    <span className="cells">
      <span className="visually-hidden">{spoken}</span>
      {[...text].map((char, index) => (
        <span className="cell" aria-hidden="true" key={index}>{char}</span>
      ))}
    </span>
  );
}

export function PenUnderline() {
  return (
    <svg className="pen-underline" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 14 C 70 4, 150 3, 297 9" />
    </svg>
  );
}

export function Check() {
  return <span className="check" aria-hidden="true">✓</span>;
}

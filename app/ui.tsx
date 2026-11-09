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

// Thin line icons (Lucide shapes, ISC). Colour comes from `currentColor`.
const iconPaths = {
  laptop: ["M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  code: ["m18 16 4-4-4-4", "m6 8-4 4 4 4", "m14.5 4-5 16"],
  checklist: ["m3 17 2 2 4-4", "m3 7 2 2 4-4", "M13 6h8", "M13 12h8", "M13 18h8"],
  cap: [
    "M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z",
    "M22 10v6",
    "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
  ],
  video: ["m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5", "M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  layers: [
    "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
    "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",
    "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",
  ],
  briefcase: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"],
  message: ["M7.9 20A9 9 0 1 0 4 16.1L2 22z"],
  radio: ["M4.9 19.1C1 15.2 1 8.8 4.9 4.9", "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", "M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z", "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", "M19.1 4.9C23 8.8 23 15.1 19.1 19"],
  play: ["M6 3l14 9-14 9z"],
  info: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z", "M12 16v-4", "M12 8h.01"],
};

export type IconName = keyof typeof iconPaths;

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name].map((d) => <path d={d} key={d} />)}
    </svg>
  );
}

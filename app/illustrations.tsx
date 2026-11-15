// Small ink drawings for cards (blog covers, featured breakdowns, the catalog hero). Strokes and
// fills come from the .pic classes in globals.css, so they follow the palette.

export type Picture = "laptop" | "sheet" | "flow" | "python" | "clipboard" | "megaphone" | "chats" | "window" | "play";

function Laptop() {
  return (
    <>
      <rect className="f-lav" x="12" y="10" width="40" height="28" rx="3" />
      <rect className="f-white" x="17" y="15" width="30" height="18" rx="2" />
      <path className="ink-pen" d="M27 20.5 23.5 24l3.5 3.5M37 20.5l3.5 3.5-3.5 3.5M33.5 19l-3 10" />
      <path className="f-white" d="M5 42h54l-3.5 7h-47z" />
    </>
  );
}

function Sheet() {
  return (
    <>
      <path className="f-white" d="M12 5h25l11 11v41H12z" />
      <path d="M37 5v11h11" />
      <rect className="f-white" x="17" y="22" width="26" height="26" />
      <path className="f-lav" d="M17 35h26v6.5H17z" />
      <path d="M17 28.5h26M17 35h26M17 41.5h26M25.5 22v26M34 22v26" />
      <rect className="f-white" x="39" y="41" width="18" height="18" rx="3" />
      <path d="m44 46 8 8m0-8-8 8" />
    </>
  );
}

function Flow() {
  return (
    <>
      <rect className="f-white" x="22" y="3" width="20" height="13" rx="2" />
      <text x="32" y="13.5">N</text>
      <path d="M32 16v5m-2.5-2.5L32 21l2.5-2.5" />
      <rect className="f-lav" x="6" y="22" width="52" height="16" rx="2" />
      <text className="pic-small" x="32" y="33.5">Алгоритм</text>
      <path d="M32 38v5m-2.5-2.5L32 43l2.5-2.5" />
      <rect className="f-white" x="22" y="44" width="20" height="13" rx="2" />
      <text x="32" y="54.5">R</text>
    </>
  );
}

// Two interlocking halves in the language's colours; not the trademark drawing itself.
function Python() {
  const half = "M31 6c-8 0-13 2.2-13 7v6h13.5v2.5H13c-5 0-8.5 4-8.5 11s3.5 11 8.5 11h4.5v-6.2c0-4.6 3.8-8.3 8.5-8.3H38c3.8 0 7-3.1 7-7V13c0-4.6-5.5-7-14-7z";
  return (
    <>
      <path className="py-blue" d={half} />
      <path className="py-yellow" d={half} transform="rotate(180 32 32)" />
      <circle className="py-eye" cx="24" cy="12" r="2.2" />
      <circle className="py-eye" cx="40" cy="52" r="2.2" />
    </>
  );
}

function Clipboard() {
  return (
    <>
      <rect className="f-lav" x="11" y="9" width="40" height="50" rx="5" />
      <rect className="f-white" x="16" y="15" width="30" height="39" rx="2" />
      <rect className="f-lav" x="23" y="5" width="16" height="8" rx="3" />
      <path className="ink-pen" d="m20 24 3 3 5-5M20 34l3 3 5-5M20 44l3 3 5-5" />
      <path d="M32 25.5h9M32 35.5h9M32 45.5h9" />
    </>
  );
}

function Megaphone() {
  return (
    <>
      <path className="f-lav" d="M8 26h10l26-14v38L18 36H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" />
      <path className="f-white" d="M18 26v10" />
      <path d="m12 36 4 14h7l-3-13" />
      <ellipse className="f-white" cx="44" cy="31" rx="6" ry="19" />
      <path className="ink-pen" d="M54 22c3 2.5 4 5.5 4 9s-1 6.5-4 9" />
    </>
  );
}

function Chats() {
  return (
    <>
      <path className="f-white" d="M30 8c11.6 0 21 7.2 21 16s-9.4 16-21 16c-2.4 0-4.6-.3-6.8-.9L14 44l2.2-8.3C11.8 32.8 9 28.6 9 24 9 15.2 18.4 8 30 8z" />
      <path className="f-lav" d="M43 37.6c6.6-2.3 10.8-7 10.8-12.4 4.8 2.6 7.2 6.5 7.2 10.8 0 3.2-1.5 6.2-4.2 8.4L58 51l-7.2-3.3c-1.6.4-3.3.6-5 .6-5.4 0-10.1-2-12.9-5.1 3.8-.8 7.3-2.6 10.1-5.6z" />
    </>
  );
}

function Window() {
  return (
    <>
      <rect className="f-lav" x="5" y="9" width="54" height="46" rx="6" />
      <path d="M5 21h54" />
      <circle className="dot-red" cx="13" cy="15" r="2.2" />
      <circle className="dot-yellow" cx="20" cy="15" r="2.2" />
      <circle className="dot-green" cx="27" cy="15" r="2.2" />
      <path className="ink-white" d="m23 31-6 6 6 6m18-12 6 6-6 6m-6-15-6 18" />
    </>
  );
}

function Play() {
  return (
    <>
      <circle className="f-lav" cx="32" cy="32" r="24" />
      <path className="f-white" d="m27 21 16 11-16 11z" />
    </>
  );
}

const drawings: Record<Picture, () => React.JSX.Element> = {
  laptop: Laptop,
  sheet: Sheet,
  flow: Flow,
  python: Python,
  clipboard: Clipboard,
  megaphone: Megaphone,
  chats: Chats,
  window: Window,
  play: Play,
};

export function Drawing({ name, className = "" }: { name: Picture; className?: string }) {
  const Shape = drawings[name];
  return (
    <svg className={`pic ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <Shape />
    </svg>
  );
}

// Three pen strokes next to a drawing or a word.
export function Strokes({ className = "" }: { className?: string }) {
  return (
    <svg className={`strokes ${className}`} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M10 21 8 5" />
      <path d="M20 25 32 11" />
      <path d="M26 35 40 31" />
    </svg>
  );
}

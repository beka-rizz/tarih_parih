import Link from "next/link";

const links = [
  { href: "/", label: "Басты" },
  { href: "/quiz", label: "Тест" },
  { href: "/flashcards", label: "Карточкалар" },
  { href: "/results", label: "Нәтижелер" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-sky-900/10 bg-white/90 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-base font-bold text-white shadow-md sm:h-10 sm:w-10 sm:text-lg">
            Т
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Tarih Parih
            </p>
            <p className="truncate text-xs text-slate-500">Қазақстан тарихы</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="touch-target rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

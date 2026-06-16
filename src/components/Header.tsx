import Link from "next/link";

const links = [
  { href: "/", label: "Басты" },
  { href: "/quiz", label: "Тест" },
  { href: "/flashcards", label: "Карточкалар" },
  { href: "/results", label: "Нәтижелер" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-sky-900/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-lg font-bold text-white shadow-md">
            Т
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Tarih Parih
            </p>
            <p className="text-xs text-slate-500">Қазақстан тарихы</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

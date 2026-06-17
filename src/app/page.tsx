import Link from "next/link";
import { getMeta } from "@/lib/questions";

export default function Home() {
  const meta = getMeta();

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-24">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-200 sm:text-sm">
            Quizlet-тің стилінде
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:mt-4 sm:text-5xl">
            Қазақстан тарихын оқыңыз — тесттер мен карточкалар арқылы
          </h1>
          <p className="mt-4 max-w-2xl text-base text-sky-100 sm:mt-6 sm:text-lg">
            {meta.totalQuestions.toLocaleString()} сұрақ,{" "}
            {meta.topics} тақырып. Тесттен кейін әлсіз
            тақырыптарды көріп, қайта оқыңыз.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link
              href="/quiz"
              className="touch-target rounded-xl bg-white px-6 py-4 text-center text-base font-semibold text-sky-800 shadow-lg transition active:scale-[0.98] hover:bg-sky-50 sm:px-8"
            >
              Тестті бастау
            </Link>
            <Link
              href="/flashcards"
              className="touch-target rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-center text-base font-semibold text-white backdrop-blur transition active:scale-[0.98] hover:bg-white/20 sm:px-8"
            >
              Карточкалар
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-2xl font-bold text-sky-700 sm:text-3xl">
              {meta.totalQuestions.toLocaleString()}
            </p>
            <p className="mt-2 font-medium text-slate-900">Сұрақтар</p>
            <p className="mt-1 text-sm text-slate-500">
              PDF файлдан автоматты түрде жүктелген
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-2xl font-bold text-sky-700 sm:text-3xl">
              {meta.topics}
            </p>
            <p className="mt-2 font-medium text-slate-900">Тақырыптар</p>
            <p className="mt-1 text-sm text-slate-500">
              Сыныптар мен тарихи кезеңдер
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-2xl font-bold text-sky-700 sm:text-3xl">3</p>
            <p className="mt-2 font-medium text-slate-900">Режим</p>
            <p className="mt-1 text-sm text-slate-500">
              Тест, карточкалар, нәтижелер
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5 sm:mt-12 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Әлсіз жақтарды талдау
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Тест аяқталғаннан кейін қандай тақырыптарда қателескеніңізді
            көресіз. 60%-дан төмен нәтиже көрсеткен тақырыптар «әлсіз»
            деп белгіленеді. Нәтижелер браузерде сақталады — тіркелу
            қажет емес.
          </p>
          <Link
            href="/results"
            className="touch-target mt-5 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-900 sm:mt-6"
          >
            Нәтижелерді көру →
          </Link>
        </div>
      </section>
    </main>
  );
}

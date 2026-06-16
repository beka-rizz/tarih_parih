import Link from "next/link";
import Header from "@/components/Header";
import { getMeta } from "@/lib/questions";

export default function Home() {
  const meta = getMeta();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-widest text-sky-200">
              Quizlet-тің стилінде
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              Қазақстан тарихын оқыңыз — тесттер мен карточкалар арқылы
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-sky-100">
              {meta.totalQuestions.toLocaleString()} сұрақ,{" "}
              {meta.topics} тақырып. Тесттен кейін әлсіз
              тақырыптарды көріп, қайта оқыңыз.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/quiz"
                className="rounded-xl bg-white px-8 py-4 text-center font-semibold text-sky-800 shadow-lg transition hover:bg-sky-50"
              >
                Тестті бастау
              </Link>
              <Link
                href="/flashcards"
                className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-center font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Карточкалар
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-sky-700">
                {meta.totalQuestions.toLocaleString()}
              </p>
              <p className="mt-2 font-medium text-slate-900">Сұрақтар</p>
              <p className="mt-1 text-sm text-slate-500">
                PDF файлдан автоматты түрде жүктелген
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-sky-700">
                {meta.topics}
              </p>
              <p className="mt-2 font-medium text-slate-900">Тақырыптар</p>
              <p className="mt-1 text-sm text-slate-500">
                Сыныптар мен тарихи кезеңдер
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-sky-700">3</p>
              <p className="mt-2 font-medium text-slate-900">Режим</p>
              <p className="mt-1 text-sm text-slate-500">
                Тест, карточкалар, нәтижелер
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-sky-100 bg-sky-50 p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Әлсіз жақтарды талдау
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Тест аяқталғаннан кейін қандай тақырыптарда қателескеніңізді
              көресіз. 60%-дан төмен нәтиже көрсеткен тақырыптар «әлсіз»
              деп белгіленеді. Нәтижелер браузерде сақталады — тіркелу
              қажет емес.
            </p>
            <Link
              href="/results"
              className="mt-6 inline-block text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Нәтижелерді көру →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

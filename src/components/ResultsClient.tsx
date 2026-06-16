"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearQuizResults,
  dedupeQuizResults,
  formatResultDate,
  getLastQuizResult,
  getQuizResultById,
} from "@/lib/storage";
import type { QuizAnswer, QuizResult } from "@/types/question";

function ScoreRing({ percentage }: { percentage: number }) {
  const color =
    percentage >= 80
      ? "text-emerald-600"
      : percentage >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className={`text-center ${color}`}>
      <p className="text-5xl font-bold">{percentage}%</p>
      <p className="mt-1 text-sm font-medium">дұрыс жауап</p>
    </div>
  );
}

function WrongAnswerItem({ answer }: { answer: QuizAnswer }) {
  return (
    <li className="rounded-xl border border-red-100 bg-red-50/60 p-4">
      <p className="text-xs font-medium text-red-700">{answer.topic}</p>
      <p className="mt-1 font-medium text-slate-900">{answer.question}</p>
      <p className="mt-2 text-sm text-slate-600">
        Сіздің жауабыңыз:{" "}
        <span className="font-medium text-red-700">{answer.userAnswer}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Дұрыс жауап:{" "}
        <span className="font-medium text-emerald-700">
          {answer.correctAnswer}
        </span>
      </p>
    </li>
  );
}

function ResultDetails({ result }: { result: QuizResult }) {
  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">
          {formatResultDate(result.completedAt)}
        </p>
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <ScoreRing percentage={result.percentage} />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {result.totalQuestions}
              </p>
              <p className="text-xs text-slate-500">барлығы</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {result.correctCount}
              </p>
              <p className="text-xs text-slate-500">дұрыс</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {result.wrongCount}
              </p>
              <p className="text-xs text-slate-500">қате</p>
            </div>
          </div>
        </div>
      </div>

      {result.weakTopics.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Әлсіз тақырыптар</h2>
          <p className="mt-1 text-sm text-slate-600">
            60%-дан төмен нәтиже көрсеткен тақырыптар
          </p>

          <div className="mt-4 space-y-3">
            {result.weakTopics.map((topic, index) => (
              <div
                key={`${topic.topic}-${index}`}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-slate-900">{topic.topic}</p>
                  <p className="text-sm font-semibold text-amber-700">
                    {topic.percentage}% ({topic.correct}/{topic.total})
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/quiz"
            className="mt-6 inline-block rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Әлсіз тақырыптарды қайта тесттеу
          </Link>
        </section>
      )}

      {wrongAnswers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Қате жауаптар ({wrongAnswers.length})
          </h2>
          <ul className="space-y-3">
            {wrongAnswers.map((answer) => (
              <WrongAnswerItem key={answer.questionId} answer={answer} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [result, setResult] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const allResults = dedupeQuizResults();

    if (selectedId) {
      const selected =
        getQuizResultById(selectedId) ??
        allResults[0] ??
        getLastQuizResult();
      setResult(selected);
    } else {
      setResult(getLastQuizResult() ?? allResults[0] ?? null);
    }

    setHistory(allResults);
    setLoaded(true);
  }, [selectedId]);

  const selectResult = (id: string) => {
    router.push(`/results?id=${id}`);
  };

  const handleClearHistory = () => {
    if (
      !window.confirm(
        "Барлық сақталған нәтижелерді жою керек пе? Бұл әрекетті кері қайтару мүмкін емес.",
      )
    ) {
      return;
    }

    clearQuizResults();
    setResult(null);
    setHistory([]);
    router.push("/results");
  };

  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Нәтижелер жүктелуде...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
          Нәтижелер браузерде сақталады — тіркелу қажет емес. Соңғы
          тесттер осы құрылғыда сақталады.
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Нәтижелер жоқ</h1>
          <p className="mt-3 text-slate-600">
            Алдымен тестті аяқтаңыз, содан кейін әлсіз тақырыптарды көресіз.
          </p>
          <Link
            href="/quiz"
            className="mt-6 inline-block rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
          >
            Тестке өту
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Нәтижелер</h1>
        <p className="mt-2 text-slate-600">
          Тест аяқталды. Төменде әлсіз тақырыптар мен қате жауаптар
          көрсетілген.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
        <strong>Тіркелусіз.</strong> Нәтижелер сіздің браузеріңізде сақталады —
        осы құрылғыда қайта кіргенде де көре аласыз.
      </div>

      <ResultDetails result={result} />

      {history.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-slate-900">
              Менің тесттерім ({history.length})
            </h2>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-sm font-medium text-red-600 transition hover:text-red-800"
            >
              Тазалау
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {history.map((item) => {
              const isActive = item.id === result.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectResult(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-sky-100 text-sky-900 ring-1 ring-sky-200"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{formatResultDate(item.completedAt)}</span>
                    <span className="font-semibold">{item.percentage}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

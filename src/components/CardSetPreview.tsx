"use client";

import type { CardSet } from "@/types/card-set";

interface CardSetPreviewProps {
  cardSet: CardSet;
  onBack: () => void;
  onStart: () => void;
}

export default function CardSetPreview({
  cardSet,
  onBack,
  onStart,
}: CardSetPreviewProps) {
  const weakIds = new Set(cardSet.weakCards.map((w) => w.questionId));
  const knownCount = cardSet.questions.filter((q) => !weakIds.has(q.id)).length;
  const weakCount = cardSet.weakCards.length;

  return (
    <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sky-700">{cardSet.name}</p>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Сұрақтарды көру</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="touch-target shrink-0 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          Артқа
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-700">{knownCount}</p>
          <p className="text-sm text-emerald-600">Білемін</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-3xl font-bold text-amber-700">{weakCount}</p>
          <p className="text-sm text-amber-600">Қайта оқу керек</p>
        </div>
      </div>

      <ul className="space-y-3">
        {cardSet.questions.map((question, i) => {
          const isWeak = weakIds.has(question.id);

          return (
            <li
              key={question.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                isWeak
                  ? "border-amber-300 bg-amber-50 text-slate-700"
                  : "border-emerald-300 bg-emerald-50 text-slate-700"
              }`}
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {i + 1}. {question.topic}
                </span>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isWeak
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
                >
                  {isWeak ? "Білмеймін" : "Білемін"}
                </span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{question.question}</p>
              <p className="mt-1 text-slate-600">{question.answer}</p>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="touch-target w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 px-6 py-4 text-base font-semibold text-white shadow-md transition active:scale-[0.98] hover:from-sky-700 hover:to-sky-900"
      >
        Бастау
      </button>
    </div>
  );
}

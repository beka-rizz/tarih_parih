"use client";

import { useMemo, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import type { QuizQuestion } from "@/lib/quiz-logic";
import type { Question } from "@/types/question";

interface FlashcardsClientProps {
  topics: string[];
}

export default function FlashcardsClient({ topics }: FlashcardsClientProps) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);

  const currentCard = cards[index];

  const weakCards = useMemo(
    () => cards.filter((card) => unknown.includes(card.id)),
    [cards, unknown],
  );

  const startSession = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ count: "20" });

      if (selectedTopic) {
        params.set("topic", selectedTopic);
      }

      const response = await fetch(`/api/quiz?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Карточкаларды жүктеу сәтсіз аяқталды");
      }

      const payload = (await response.json()) as { questions: QuizQuestion[] };

      if (!payload.questions.length) {
        throw new Error("Таңдалған тақырып бойынша карточка табылмады");
      }

      setCards(payload.questions);
      setIndex(0);
      setFlipped(false);
      setKnown([]);
      setUnknown([]);
      setStarted(true);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Белгісіз қате орын алды",
      );
    } finally {
      setLoading(false);
    }
  };

  const markCard = (isKnown: boolean) => {
    if (!currentCard) return;

    if (isKnown) {
      setKnown((prev) => [...new Set([...prev, currentCard.id])]);
      setUnknown((prev) => prev.filter((id) => id !== currentCard.id));
    } else {
      setUnknown((prev) => [...new Set([...prev, currentCard.id])]);
      setKnown((prev) => prev.filter((id) => id !== currentCard.id));
    }

    setFlipped(false);
    if (index + 1 < cards.length) {
      setIndex((prev) => prev + 1);
    }
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Карточкалар</h1>
          <p className="mt-2 text-slate-600">
            Сұрақты оқып, жауапты көру үшін карточканы аударыңыз.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Тақырып
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Барлық тақырыптар</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={startSession}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:from-sky-700 hover:to-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Жүктелуде..." : "Карточкаларды бастау"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Карточкалар жүктелмеді.</p>
        <button
          type="button"
          onClick={() => setStarted(false)}
          className="mt-4 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white"
        >
          Артқа
        </button>
      </div>
    );
  }

  const sessionDone =
    index === cards.length - 1 &&
    (known.includes(currentCard.id) || unknown.includes(currentCard.id));

  if (sessionDone) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Сессия аяқталды</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{known.length}</p>
              <p className="text-sm text-emerald-600">Білемін</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{unknown.length}</p>
              <p className="text-sm text-amber-600">Қайта оқу керек</p>
            </div>
          </div>

          {weakCards.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-900">Әлсіз жағыңыз</h3>
              <ul className="mt-3 space-y-2">
                {weakCards.slice(0, 8).map((card) => (
                  <li
                    key={card.id}
                    className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <span className="font-medium">{card.question}</span>
                    <span className="mt-1 block text-slate-500">
                      {card.answer}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setStarted(false);
              setIndex(0);
            }}
            className="mt-8 w-full rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
          >
            Қайта бастау
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressBar current={index + 1} total={cards.length} />

      <button
        type="button"
        onClick={() => setFlipped((prev) => !prev)}
        className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-sky-300 sm:min-h-64"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
          {currentCard.topic}
        </p>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
          {flipped ? currentCard.answer : currentCard.question}
        </p>
        <p className="mt-6 text-sm text-slate-400">
          {flipped ? "Сұрақты көру" : "Жауапты көру"} — басу
        </p>
      </button>

      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => markCard(false)}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            Білмеймін
          </button>
          <button
            type="button"
            onClick={() => markCard(true)}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-4 font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Білемін
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CardSetItem from "@/components/CardSetItem";
import CardSetPreview from "@/components/CardSetPreview";
import CreateCardSetForm from "@/components/CreateCardSetForm";
import ProgressBar from "@/components/ProgressBar";
import {
  createCardSet,
  deleteCardSet,
  getCardSets,
  saveCardSetQuestions,
  saveSessionResult,
  updateCardSetName,
} from "@/lib/card-storage";
import type { QuizQuestion } from "@/lib/quiz-logic";
import type { CardSet } from "@/types/card-set";
import type { Question } from "@/types/question";

interface FlashcardsClientProps {
  topics: string[];
}

type View = "manage" | "session" | "preview";

export default function FlashcardsClient({ topics }: FlashcardsClientProps) {
  const [view, setView] = useState<View>("manage");
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [activeSet, setActiveSet] = useState<CardSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const savedSessionRef = useRef(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    setCardSets(getCardSets());
  }, []);

  const currentCard = cards[index];

  const weakCards = useMemo(
    () => cards.filter((card) => unknown.includes(card.id)),
    [cards, unknown],
  );

  const sessionDone =
    view === "session" &&
    currentCard &&
    index === cards.length - 1 &&
    (known.includes(currentCard.id) || unknown.includes(currentCard.id));

  useEffect(() => {
    if (!sessionDone || !activeSet || savedSessionRef.current) return;

    const unknownCards = cards.filter((card) => unknown.includes(card.id));
    saveSessionResult(activeSet.id, known, unknownCards);
    savedSessionRef.current = true;
    setCardSets(getCardSets());
  }, [sessionDone, activeSet, cards, known, unknown]);

  const refreshSets = () => setCardSets(getCardSets());

  const handleCreate = (options: { topic: string; questionCount: number }) => {
    createCardSet(options);
    setShowCreateForm(false);
    refreshSets();
  };

  const handleUpdateName = (id: string, name: string) => {
    updateCardSetName(id, name);
    refreshSets();
  };

  const handleDelete = (id: string) => {
    deleteCardSet(id);
    refreshSets();
  };

  const backToManage = () => {
    setView("manage");
    setIndex(0);
    setActiveSet(null);
    setCards([]);
    setKnown([]);
    setUnknown([]);
    setFlipped(false);
    savedSessionRef.current = false;
    refreshSets();
  };

  const openPreview = (cardSet: CardSet) => {
    setActiveSet(cardSet);
    setView("preview");
  };

  const startSessionFromPreview = () => {
    if (activeSet) {
      startSession(activeSet);
    }
  };

  const startSession = async (cardSet: CardSet) => {
    setLoading(true);
    setError("");
    setActiveSet(cardSet);
    savedSessionRef.current = false;

    try {
      let sessionCards: Question[];

      if (cardSet.questions.length > 0) {
        sessionCards = cardSet.questions;
      } else {
        const params = new URLSearchParams({
          count: String(cardSet.questionCount),
        });

        if (cardSet.topic) {
          params.set("topic", cardSet.topic);
        }

        const response = await fetch(`/api/quiz?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Карточкаларды жүктеу сәтсіз аяқталды");
        }

        const payload = (await response.json()) as { questions: QuizQuestion[] };

        if (!payload.questions.length) {
          throw new Error("Таңдалған тақырып бойынша карточка табылмады");
        }

        sessionCards = payload.questions;
        saveCardSetQuestions(cardSet.id, sessionCards);
        refreshSets();
      }

      setCards(sessionCards);
      setIndex(0);
      setFlipped(false);
      setKnown([]);
      setUnknown([]);
      setView("session");
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

  if (view === "manage") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Карточкалар</h1>
          <p className="mt-2 text-slate-600">
            Карточка жинақтарын жасаңыз, атауын өзгертіңіз және оқуды бастаңыз.
            Сұрақтар мен әлсіз жақтар сақталады.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {showCreateForm && (
          <CreateCardSetForm
            topics={topics}
            onCreate={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {cardSets.length === 0 && !showCreateForm ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-slate-600">
              Әлі карточка жинақтары жоқ. Жаңасын жасаңыз.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-6 rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
            >
              + Жаңа карточка
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cardSets.map((set) => (
              <CardSetItem
                key={set.id}
                cardSet={set}
                onUpdateName={handleUpdateName}
                onDelete={handleDelete}
                onView={openPreview}
                onStart={startSession}
              />
            ))}

            {!showCreateForm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
              >
                + Жаңа карточка қосу
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-8 py-6 shadow-xl">
              <p className="font-medium text-slate-700">Жүктелуде...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "preview" && activeSet) {
    const freshSet = getCardSets().find((set) => set.id === activeSet.id) ?? activeSet;

    return (
      <CardSetPreview
        cardSet={freshSet}
        onBack={backToManage}
        onStart={startSessionFromPreview}
      />
    );
  }

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Карточкалар жүктелмеді.</p>
        <button
          type="button"
          onClick={backToManage}
          className="mt-4 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white"
        >
          Артқа
        </button>
      </div>
    );
  }

  if (sessionDone) {
    const savedWeakCount =
      activeSet
        ? getCardSets().find((set) => set.id === activeSet.id)?.weakCards.length ?? 0
        : 0;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {activeSet && (
            <p className="text-sm font-medium text-sky-700">{activeSet.name}</p>
          )}
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Сессия аяқталды
          </h2>
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
              <h3 className="font-semibold text-slate-900">
                Бұл сессиядағы әлсіз жақтар
              </h3>
              <ul className="mt-3 space-y-2">
                {weakCards.map((card) => (
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

          {savedWeakCount > 0 && (
            <p className="mt-6 text-sm text-slate-500">
              Жинақта сақталған әлсіз сұрақтар: {savedWeakCount}
            </p>
          )}

          <button
            type="button"
            onClick={backToManage}
            className="mt-8 w-full rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
          >
            Карточкаларға оралу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {activeSet && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-sky-700">{activeSet.name}</p>
          <button
            type="button"
            onClick={backToManage}
            className="text-sm text-slate-500 transition hover:text-slate-700"
          >
            Тоқтату
          </button>
        </div>
      )}

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

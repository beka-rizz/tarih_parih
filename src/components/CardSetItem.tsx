"use client";

import { useEffect, useState } from "react";
import type { CardSet } from "@/types/card-set";

interface CardSetItemProps {
  cardSet: CardSet;
  onUpdateName: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onView: (cardSet: CardSet) => void;
  onStart: (cardSet: CardSet) => void;
}

export default function CardSetItem({
  cardSet,
  onUpdateName,
  onDelete,
  onView,
  onStart,
}: CardSetItemProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(cardSet.name);
  const [nameError, setNameError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!editingName) {
      setNameValue(cardSet.name);
      setNameError(false);
    }
  }, [cardSet.name, editingName]);

  const commitName = () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }

    setNameError(false);
    if (trimmed !== cardSet.name) {
      onUpdateName(cardSet.id, trimmed);
    }
    setEditingName(false);
  };

  const hasSavedQuestions = cardSet.questions.length > 0;
  const weakCount = cardSet.weakCards.length;
  const knownCount = hasSavedQuestions
    ? cardSet.questions.length - weakCount
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {editingName ? (
            <div>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  if (nameError && e.target.value.trim()) {
                    setNameError(false);
                  }
                }}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setNameValue(cardSet.name);
                    setNameError(false);
                    setEditingName(false);
                  }
                }}
                autoFocus
                className={`w-full rounded-lg border px-3 py-1.5 text-lg font-semibold text-slate-900 outline-none focus:ring-2 ${
                  nameError
                    ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                    : "border-sky-300 focus:border-sky-500 focus:ring-sky-200"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">
                  Атау бос болмауы керек
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 text-left"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-700">
                {cardSet.name}
              </h3>
              <svg
                className="h-4 w-4 text-slate-400 opacity-0 transition group-hover:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(cardSet.id)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Жою
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              Болдырмау
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Жою"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
        <span>
          Тақырып:{" "}
          <span className="font-medium text-slate-700">
            {cardSet.topic || "Барлық тақырыптар"}
          </span>
        </span>
        <span>
          Сұрақтар:{" "}
          <span className="font-medium text-slate-700">
            {hasSavedQuestions ? cardSet.questions.length : cardSet.questionCount}
          </span>
        </span>
      </div>

      {hasSavedQuestions && (
        <div className="mt-3 flex gap-3 text-xs font-semibold">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
            Білемін: {knownCount}
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
            Қайта оқу: {weakCount}
          </span>
        </div>
      )}

      <div className={`mt-5 grid gap-3 ${hasSavedQuestions ? "grid-cols-2" : ""}`}>
        {hasSavedQuestions && (
          <button
            type="button"
            onClick={() => onView(cardSet)}
            className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Көру
          </button>
        )}
        <button
          type="button"
          onClick={() => onStart(cardSet)}
          className="rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-700 hover:to-sky-900"
        >
          Бастау
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const QUESTION_COUNTS = [10, 20, 30, 50];

interface CreateCardSetFormProps {
  topics: string[];
  onCreate: (options: { topic: string; questionCount: number }) => void;
  onCancel: () => void;
}

export default function CreateCardSetForm({
  topics,
  onCreate,
  onCancel,
}: CreateCardSetFormProps) {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Жаңа карточка</h3>
      <p className="mt-1 text-sm text-slate-600">
        Тақырып пен сұрақтар саны кейін өзгертілмейді.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">
            Тақырып
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Барлық тақырыптар</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500">
            Сұрақтар саны
          </label>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                  questionCount === count
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onCreate({ topic, questionCount })}
          className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-700 hover:to-sky-900"
        >
          Жасау
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Болдырмау
        </button>
      </div>
    </div>
  );
}

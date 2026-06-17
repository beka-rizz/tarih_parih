"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import { useMobileNav } from "@/context/MobileNavContext";
import { buildQuizResult, type QuizQuestion } from "@/lib/quiz-logic";
import { saveQuizResult } from "@/lib/storage";
import type { QuizAnswer } from "@/types/question";

const QUESTION_COUNTS = [10, 20, 30, 50];

interface QuizClientProps {
  topics: string[];
}

export default function QuizClient({ topics }: QuizClientProps) {
  const router = useRouter();
  const { setHidden } = useMobileNav();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const isFinishingRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setHidden(started);
    return () => setHidden(false);
  }, [started, setHidden]);

  const startQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        count: String(questionCount),
      });

      if (selectedTopic) {
        params.set("topic", selectedTopic);
      }

      const response = await fetch(`/api/quiz?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Сұрақтарды жүктеу сәтсіз аяқталды");
      }

      const payload = (await response.json()) as { questions: QuizQuestion[] };

      if (!payload.questions.length) {
        throw new Error("Таңдалған тақырып бойынша сұрақ табылмады");
      }

      setQuestions(payload.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      isFinishingRef.current = false;
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

  const handleAnswer = (option: string) => {
    if (showFeedback || !currentQuestion) return;

    const isCorrect = option === currentQuestion.answer;
    setSelectedAnswer(option);
    setShowFeedback(true);

    const record: QuizAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: option,
      topic: currentQuestion.topic,
      isCorrect,
    };

    setAnswers((prev) => [...prev, record]);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (currentIndex + 1 >= questions.length) {
      if (isFinishingRef.current) return;
      isFinishingRef.current = true;

      const result = saveQuizResult(buildQuizResult(answers));
      router.push(`/results?id=${result.id}`);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Тест</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Сұрақтарға жауап беріңіз. Тест аяқталғаннан кейін әлсіз
            тақырыптарды көресіз.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label className="block text-sm font-medium text-slate-700">
            Тақырып
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="touch-target mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Барлық тақырыптар</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <label className="mt-6 block text-sm font-medium text-slate-700">
            Сұрақтар саны
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`touch-target rounded-xl border px-4 py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                  questionCount === count
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={startQuiz}
            disabled={loading}
            className="touch-target mt-6 w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-800 px-6 py-4 text-base font-semibold text-white shadow-lg transition active:scale-[0.98] hover:from-sky-700 hover:to-sky-900 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-8"
          >
            {loading ? "Жүктелуде..." : "Тестті бастау"}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Сұрақтар жүктелмеді.</p>
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

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide text-sky-700">
          {currentQuestion.topic}
        </p>
        <h2 className="mt-3 text-lg font-semibold leading-relaxed text-slate-900 sm:text-2xl">
          {currentQuestion.question}
        </h2>

        <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
          {currentQuestion.options.map((option, optionIndex) => {
            let style =
              "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50";

            if (showFeedback) {
              if (option === currentQuestion.answer) {
                style = "border-emerald-500 bg-emerald-50 text-emerald-900";
              } else if (option === selectedAnswer) {
                style = "border-red-400 bg-red-50 text-red-900";
              } else {
                style = "border-slate-200 bg-slate-50 text-slate-500";
              }
            } else if (option === selectedAnswer) {
              style = "border-sky-500 bg-sky-50 text-sky-900";
            }

            return (
              <button
                key={`${currentQuestion.id}-${optionIndex}`}
                type="button"
                disabled={showFeedback}
                onClick={() => handleAnswer(option)}
                className={`touch-target w-full rounded-xl border px-4 py-4 text-left text-sm font-medium transition active:scale-[0.99] sm:text-base ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="sticky-mobile-actions -mx-4 mt-5 space-y-3 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-sm sm:mx-0 sm:mt-6 sm:space-y-4 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                selectedAnswer === currentQuestion.answer
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedAnswer === currentQuestion.answer
                ? "Дұрыс!"
                : `Қате. Дұрыс жауап: ${currentQuestion.answer}`}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="touch-target w-full rounded-xl bg-sky-700 px-6 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-sky-800"
            >
              {currentIndex + 1 >= questions.length
                ? "Нәтижелерді көру"
                : "Келесі сұрақ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

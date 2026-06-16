import type { QuizResult } from "@/types/question";

const RESULTS_KEY = "tarih_parih_results";
const LAST_RESULT_KEY = "tarih_parih_last_result";
const MAX_RESULTS = 30;

function readResults(): QuizResult[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as QuizResult[]) : [];
  } catch {
    return [];
  }
}

function writeResults(results: QuizResult[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function saveQuizResult(result: QuizResult): QuizResult {
  if (typeof window === "undefined") return result;

  const existing = readResults();
  if (existing.some((item) => item.id === result.id)) {
    return result;
  }

  const updated = [result, ...existing].slice(0, MAX_RESULTS);
  writeResults(updated);
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));

  return result;
}

export function dedupeQuizResults(): QuizResult[] {
  if (typeof window === "undefined") return [];

  const seen = new Set<string>();
  const deduped = readResults().filter((result) => {
    const key = `${result.completedAt}|${result.totalQuestions}|${result.percentage}|${result.correctCount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  writeResults(deduped);

  if (deduped[0]) {
    localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(deduped[0]));
  } else {
    localStorage.removeItem(LAST_RESULT_KEY);
  }

  return deduped;
}

export function getQuizResults(): QuizResult[] {
  return readResults();
}

export function getLastQuizResult(): QuizResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LAST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as QuizResult) : null;
  } catch {
    return null;
  }
}

export function getQuizResultById(id: string): QuizResult | null {
  return readResults().find((result) => result.id === id) ?? null;
}

export function clearQuizResults(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(RESULTS_KEY);
  localStorage.removeItem(LAST_RESULT_KEY);
}

export function formatResultDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("kk-KZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

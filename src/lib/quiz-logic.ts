import type {
  Question,
  QuizAnswer,
  QuizResult,
  TopicStats,
} from "@/types/question";
import { getDistractorsForQuestion } from "@/lib/distractors";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickRandomQuestions(
  pool: Question[],
  count: number,
  topic?: string,
): Question[] {
  const filtered = topic
    ? pool.filter((question) => question.topic === topic)
    : pool;
  return shuffleArray(filtered).slice(0, Math.min(count, filtered.length));
}

function normalizeAnswer(answer: string): string {
  return answer.replace(/\s+/g, " ").trim();
}
export function generateOptions(
  question: Question,
  optionCount = 4,
): string[] {
  const correct = normalizeAnswer(question.answer);
  const distractorCount = Math.max(optionCount - 1, 0);
  const pool = getDistractorsForQuestion(question.id)
    .map(normalizeAnswer)
    .filter((answer) => answer.length > 0 && answer !== correct);
  const uniquePool = [...new Set(pool)];
  const pickedDistractors = shuffleArray(uniquePool).slice(0, distractorCount);
  return shuffleArray([correct, ...pickedDistractors]).slice(0, optionCount);
}

export function calculateTopicStats(answers: QuizAnswer[]): TopicStats[] {
  const map = new Map<string, { total: number; correct: number }>();

  for (const answer of answers) {
    const current = map.get(answer.topic) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    map.set(answer.topic, current);
  }

  return [...map.entries()]
    .map(([topic, stats]) => {
      const wrong = stats.total - stats.correct;
      const percentage = Math.round((stats.correct / stats.total) * 100);
      return {
        topic,
        total: stats.total,
        correct: stats.correct,
        wrong,
        percentage,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);
}

export function getWeakTopics(
  topicStats: TopicStats[],
  threshold = 60,
): TopicStats[] {
  return topicStats.filter((stat) => stat.percentage < threshold);
}

export function buildQuizResult(answers: QuizAnswer[]): QuizResult {
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.length - correctCount;
  const percentage = Math.round((correctCount / answers.length) * 100);
  const topicStats = calculateTopicStats(answers);
  const weakTopics = getWeakTopics(topicStats);

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    completedAt: new Date().toISOString(),
    totalQuestions: answers.length,
    correctCount,
    wrongCount,
    percentage,
    answers,
    weakTopics,
  };
}

export type QuizQuestion = Question & { options: string[] };

export function buildQuizSession(
  pool: Question[],
  count: number,
  topic?: string,
): QuizQuestion[] {
  const picked = pickRandomQuestions(pool, count, topic);

  return picked.map((question) => ({
    ...question,
    options: generateOptions(question),
  }));
}

import type { CardSet, WeakCard } from "@/types/card-set";
import type { Question } from "@/types/question";

const CARD_SETS_KEY = "tarih_parih_card_sets";

function readCardSets(): CardSet[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CARD_SETS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CardSet[];
    return parsed.map((set) => ({
      ...set,
      questions: set.questions ?? [],
      weakCards: set.weakCards ?? [],
    }));
  } catch {
    return [];
  }
}

function writeCardSets(sets: CardSet[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CARD_SETS_KEY, JSON.stringify(sets));
}

function nextNumericId(sets: CardSet[]): number {
  const ids = sets.map((set) => {
    const match = set.id.match(/^card-(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  return Math.max(0, ...ids) + 1;
}

export function getCardSets(): CardSet[] {
  return readCardSets();
}

export function getCardSetById(id: string): CardSet | null {
  return readCardSets().find((set) => set.id === id) ?? null;
}

export function createCardSet(options?: {
  topic?: string;
  questionCount?: number;
}): CardSet {
  const existing = readCardSets();
  const numericId = nextNumericId(existing);
  const newSet: CardSet = {
    id: `card-${numericId}`,
    name: `Карточка #${numericId}`,
    topic: options?.topic ?? "",
    questionCount: options?.questionCount ?? 20,
    createdAt: new Date().toISOString(),
    questions: [],
    weakCards: [],
  };

  writeCardSets([...existing, newSet]);
  return newSet;
}

export function updateCardSetName(id: string, name: string): CardSet | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = readCardSets();
  const index = existing.findIndex((set) => set.id === id);
  if (index === -1) return null;

  existing[index] = { ...existing[index], name: trimmed };
  writeCardSets(existing);
  return existing[index];
}

export function saveCardSetQuestions(id: string, questions: Question[]): CardSet | null {
  const existing = readCardSets();
  const index = existing.findIndex((set) => set.id === id);
  if (index === -1) return null;

  existing[index] = { ...existing[index], questions };
  writeCardSets(existing);
  return existing[index];
}

export function saveSessionResult(
  id: string,
  knownIds: string[],
  unknownCards: Question[],
): CardSet | null {
  const existing = readCardSets();
  const index = existing.findIndex((set) => set.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const currentWeak = existing[index].weakCards;

  const weakMap = new Map<string, WeakCard>(
    currentWeak.map((card) => [card.questionId, card]),
  );

  for (const card of unknownCards) {
    weakMap.set(card.id, {
      questionId: card.id,
      question: card.question,
      answer: card.answer,
      topic: card.topic,
      markedAt: now,
    });
  }

  for (const knownId of knownIds) {
    weakMap.delete(knownId);
  }

  existing[index] = {
    ...existing[index],
    weakCards: Array.from(weakMap.values()).sort(
      (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
    ),
  };

  writeCardSets(existing);
  return existing[index];
}

export function deleteCardSet(id: string): void {
  writeCardSets(readCardSets().filter((set) => set.id !== id));
}

export function formatCardDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("kk-KZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import distractorsData from "@/data/distractors.json";

export interface DistractorsData {
  meta: {
    distractorsPerQuestion: number;
    totalQuestions: number;
    generatedAt: string;
  };
  distractors: Record<string, string[]>;
}

const database = distractorsData as DistractorsData;

export function getDistractorsForQuestion(questionId: string): string[] {
  return database.distractors[questionId] ?? [];
}

export function getDistractorsMeta() {
  return database.meta;
}

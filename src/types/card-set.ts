import type { Question } from "@/types/question";

export interface WeakCard {
  questionId: string;
  question: string;
  answer: string;
  topic: string;
  markedAt: string;
}

export interface CardSet {
  id: string;
  name: string;
  topic: string;
  questionCount: number;
  createdAt: string;
  questions: Question[];
  weakCards: WeakCard[];
}

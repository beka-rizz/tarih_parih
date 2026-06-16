import questionsData from "@/data/questions.json";
import type { QuestionsData } from "@/types/question";

export const questionsDatabase = questionsData as QuestionsData;

export function getQuestionPool() {
  return questionsDatabase.questions;
}

export function getTopics() {
  return questionsDatabase.topics;
}

export function getMeta() {
  return questionsDatabase.meta;
}

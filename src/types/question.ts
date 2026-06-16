export interface Question {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export interface QuestionsData {
  meta: {
    totalQuestions: number;
    topics: number;
    generatedAt: string;
  };
  topics: string[];
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  topic: string;
  isCorrect: boolean;
}

export interface TopicStats {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
}

export interface QuizResult {
  id: string;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  answers: QuizAnswer[];
  weakTopics: TopicStats[];
}

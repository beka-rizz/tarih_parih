import fs from "fs";
import path from "path";
import questionsData from "../src/data/questions.json";
import {
  DISTRACTORS_PER_QUESTION,
  generateDistractorsMap,
} from "../src/lib/distractor-generator";
import type { QuestionsData } from "../src/types/question";

const data = questionsData as QuestionsData;
const distractors = generateDistractorsMap(data.questions);

const output = {
  meta: {
    distractorsPerQuestion: DISTRACTORS_PER_QUESTION,
    totalQuestions: data.questions.length,
    generatedAt: new Date().toISOString(),
    strategy: "answer-only-generation",
  },
  distractors,
};

const targetPath = path.join(process.cwd(), "src/data/distractors.json");
fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), "utf8");

console.log(
  `Generated ${DISTRACTORS_PER_QUESTION} distractors for ${data.questions.length} questions`,
);
console.log(`Saved file: ${targetPath}`);

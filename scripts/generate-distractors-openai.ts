import fs from "fs";
import path from "path";
import questionsData from "../src/data/questions.json";
import {
  DISTRACTORS_PER_QUESTION,
  generateDistractorsForQuestion,
} from "../src/lib/distractor-generator";
import type { Question, QuestionsData } from "../src/types/question";

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface DistractorsJson {
  meta: {
    distractorsPerQuestion: number;
    totalQuestions: number;
    generatedAt: string;
    strategy: string;
    model?: string;
  };
  distractors: Record<string, string[]>;
}

const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");
const OUTPUT_PATH = path.join(process.cwd(), "src/data/distractors.json");

function loadEnvLocal(): void {
  if (!fs.existsSync(ENV_LOCAL_PATH)) return;
  const lines = fs.readFileSync(ENV_LOCAL_PATH, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) continue;

    const key = line.slice(0, eqIdx).trim();
    if (!key || process.env[key]) continue;

    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractText(response: OpenAIResponse): string {
  if (response.output_text && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const fromContent =
    response.output
      ?.flatMap((entry) => entry.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n")
      .trim() ?? "";

  return fromContent;
}

function parseDistractors(rawText: string, correctAnswer: string): string[] {
  const trimmed = rawText.trim();
  let parsed: unknown = null;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  const normalizedCorrect = normalize(correctAnswer).toLowerCase();
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of parsed) {
    if (typeof item !== "string") continue;
    const value = normalize(item);
    if (!value) continue;
    const key = value.toLowerCase();
    if (key === normalizedCorrect) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result.slice(0, DISTRACTORS_PER_QUESTION);
}

function createPrompt(question: Question): string {
  return [
    "You generate plausible wrong multiple-choice distractors for Kazakh history quizzes.",
    "Return ONLY a JSON array of 10 strings, no markdown, no explanations.",
    "Rules:",
    "- Language must match the question/answer style (Kazakh/Cyrillic when appropriate).",
    "- Distractors must be plausible and close to the same semantic type as the correct answer.",
    "- Never include the correct answer or near-duplicate spelling variants of it.",
    "- Avoid absurd mismatches (e.g. person name as answer for epoch question).",
    "- Keep each option concise (2-8 words usually).",
    "",
    `Topic: ${question.topic}`,
    `Question: ${question.question}`,
    `Correct answer: ${question.answer}`,
  ].join("\n");
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenAI(
  apiKey: string,
  model: string,
  question: Question,
): Promise<string[]> {
  const body = {
    model,
    input: createPrompt(question),
    temperature: 0.7,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${message.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = extractText(data);
  return parseDistractors(text, question.answer);
}

function readExisting(): Record<string, string[]> {
  if (!fs.existsSync(OUTPUT_PATH)) return {};
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DistractorsJson>;
    return parsed.distractors ?? {};
  } catch {
    return {};
  }
}

function ensureTen(
  question: Question,
  llmDistractors: string[],
): string[] {
  const normalizedCorrect = normalize(question.answer).toLowerCase();
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of llmDistractors) {
    const value = normalize(item);
    if (!value) continue;
    const key = value.toLowerCase();
    if (key === normalizedCorrect || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  if (result.length >= DISTRACTORS_PER_QUESTION) {
    return result.slice(0, DISTRACTORS_PER_QUESTION);
  }

  const fallback = generateDistractorsForQuestion(question);
  for (const item of fallback) {
    const value = normalize(item);
    const key = value.toLowerCase();
    if (!value || key === normalizedCorrect || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
    if (result.length >= DISTRACTORS_PER_QUESTION) break;
  }

  return result.slice(0, DISTRACTORS_PER_QUESTION);
}

async function main(): Promise<void> {
  loadEnvLocal();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Put it into .env.local and rerun.",
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const retryLimit = Number(process.env.OPENAI_RETRY_LIMIT ?? "3");
  const delayMs = Number(process.env.OPENAI_DELAY_MS ?? "120");
  const limit = Number(process.env.OPENAI_LIMIT ?? "0");
  const force = process.env.OPENAI_FORCE === "1";

  const database = questionsData as QuestionsData;
  const existing = readExisting();
  const output: Record<string, string[]> = { ...existing };

  const queue = database.questions.filter((question) => {
    if (force) return true;
    const current = output[question.id] ?? [];
    return current.length !== DISTRACTORS_PER_QUESTION;
  });

  const scopedQueue = limit > 0 ? queue.slice(0, limit) : queue;
  let completed = 0;
  let fallbackCount = 0;

  console.log(
    `Generating with OpenAI model=${model}. Questions in queue: ${scopedQueue.length}`,
  );

  for (const question of scopedQueue) {
    let llmDistractors: string[] = [];
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryLimit; attempt++) {
      try {
        llmDistractors = await callOpenAI(apiKey, model, question);
        if (llmDistractors.length > 0) break;
        throw new Error("Model returned empty or invalid distractors");
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retryLimit) await sleep(delayMs * attempt);
      }
    }

    if (lastError && llmDistractors.length === 0) {
      console.warn(`Fallback for ${question.id}: ${lastError.message}`);
      fallbackCount += 1;
    }

    const finalDistractors = ensureTen(question, llmDistractors);
    if (finalDistractors.length < DISTRACTORS_PER_QUESTION) {
      throw new Error(
        `Failed to build ${DISTRACTORS_PER_QUESTION} distractors for ${question.id}`,
      );
    }

    output[question.id] = finalDistractors;
    completed += 1;

    if (completed % 25 === 0 || completed === scopedQueue.length) {
      const snapshot: DistractorsJson = {
        meta: {
          distractorsPerQuestion: DISTRACTORS_PER_QUESTION,
          totalQuestions: database.questions.length,
          generatedAt: new Date().toISOString(),
          strategy: "openai+fallback-answer-only",
          model,
        },
        distractors: output,
      };
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
      console.log(`Progress: ${completed}/${scopedQueue.length}`);
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  const finalData: DistractorsJson = {
    meta: {
      distractorsPerQuestion: DISTRACTORS_PER_QUESTION,
      totalQuestions: database.questions.length,
      generatedAt: new Date().toISOString(),
      strategy: "openai+fallback-answer-only",
      model,
    },
    distractors: output,
  };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2), "utf8");

  console.log(
    `Done. Generated/updated ${completed} questions. Fallback used: ${fallbackCount}.`,
  );
  console.log(`Saved file: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});

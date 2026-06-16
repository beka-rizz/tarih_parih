import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

export interface ParsedQuestion {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

const PAGE_MARKER = /^--\s*\d+\s+of\s+\d+\s*--$/;
const SECTION_MARKER = /^(\d+)-(тапсырма|сынып)$/;
const NUMBERED_START = /^(\d+)\.\s+/;

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isSectionHeader(line: string): boolean {
  if (!line || line.length > 150) return false;
  if (line.includes(":")) return false;
  if (NUMBERED_START.test(line)) return false;
  if (PAGE_MARKER.test(line)) return false;
  if (SECTION_MARKER.test(line)) return true;

  const eraPattern =
    /(палеолит|мезолит|неолит|энеолит|мыстытас|қола\s*дәуір|темір\s*дәуір)/i;
  const hasDate = /б\.?\s*з\.?\s*[бд]?\.?/i.test(line) || /\d+\s*мың\s*жыл/i.test(line);

  if (eraPattern.test(line) && (hasDate || line.length < 90)) return true;
  if (/дәуірі\s*$/i.test(line.trim()) && line.length < 80) return true;
  if (/ғасыры/i.test(line) && hasDate) return true;

  const knownSections = [
    "Ежелгі адамдар",
    "Ежелгі адамдардың өмірі мен еңбек құралдары",
    "Ежелгі адамдардың қоғамдық құрылысы",
    "Ежелгі адамдардың діни нанымдары",
    "Мыстытас ғасыры(энеолит) дәуірі",
    "Оғыз мемлекеті",
    "Қазақстан түбегейлі бетбұрыстар кезінде",
    "Тоқырау жылдарындағы Қазақстан",
    "ХХ ғасырдың басындағы Қазақстан",
    "Азамат соғысы жылдарындағы Қазақстан",
    "Екологиялық дағдарыс және оның салдары",
    "Ауыл шаруашылығының дамуы",
    "Өнеркәсіпте қалыптасқан жағдай",
    "Сақтар туралы деректер",
    "Сақтардың қоғамдық құрылысы",
    "Сақтардың сыртқы саясаты",
    "Сақтардың шаруашылығы мен мәдениеті",
  ];

  return knownSections.some(
    (section) => line === section || line.startsWith(section),
  );
}

function buildTopic(grade: string, task: string, section: string): string {
  return [grade, task, section].filter(Boolean).join(" · ") || "Жалпы";
}

function stripNumberPrefix(text: string): string {
  return text.replace(NUMBERED_START, "");
}

function tryParseColonLine(line: string): { question: string; answer: string } | null {
  const idx = line.indexOf(":");
  if (idx <= 0) return null;

  const question = cleanText(line.slice(0, idx));
  const answer = cleanText(line.slice(idx + 1));

  if (question.length < 8 || answer.length < 1) return null;
  if (/^\d+$/.test(answer) && answer.length < 4) return null;

  return { question, answer };
}

function tryParseParenAnswer(text: string): { question: string; answer: string } | null {
  const match = text.match(/^([\s\S]+?\?)\s*\(([\s\S]+)\)\s*$/);
  if (!match) return null;

  const question = cleanText(stripNumberPrefix(match[1]));
  const answer = cleanText(match[2]);

  if (question.length < 10 || answer.length < 2) return null;
  return { question, answer };
}

function tryParsePeriodParenAnswer(
  text: string,
): { question: string; answer: string } | null {
  const match = text.match(/^([\s\S]+?\.)\s*\(([\s\S]+)\)\s*$/);
  if (!match) return null;

  const question = cleanText(stripNumberPrefix(match[1]));
  const answer = cleanText(match[2]);

  if (question.length < 10 || answer.length < 2) return null;
  return { question, answer };
}

function tryParseQuestionMarkTrailingAnswer(
  text: string,
): { question: string; answer: string } | null {
  const match = text.match(/^([\s\S]+?\?)\s+([\s\S]+?)\)\s*$/);
  if (!match) return null;
  if (match[2].includes("(")) return null;

  const question = cleanText(stripNumberPrefix(match[1]));
  const answer = cleanText(match[2]);

  if (question.length < 10 || answer.length < 5) return null;
  return { question, answer };
}

function tryParseNumberedBuffer(text: string): { question: string; answer: string } | null {
  const colon = tryParseColonLine(text);
  if (colon) return colon;

  return (
    tryParseParenAnswer(text) ??
    tryParsePeriodParenAnswer(text) ??
    tryParseQuestionMarkTrailingAnswer(text)
  );
}

function isShortAnswer(answer: string): boolean {
  const trimmed = answer.trim();
  if (trimmed.length <= 15) return true;
  if (!trimmed.includes(",") && trimmed.split(/\s+/).length <= 2) return true;
  return false;
}

function isAnswerContinuationLine(line: string): boolean {
  if (!line || PAGE_MARKER.test(line)) return false;
  if (SECTION_MARKER.test(line)) return false;
  if (NUMBERED_START.test(line)) return false;
  if (isSectionHeader(line)) return false;
  if (line.startsWith("(")) return false;
  if (/^\d{3,4}\s*ж\./.test(line)) return false;
  if (line.length > 55) return false;
  if (line.includes("?")) return false;

  const colon = tryParseColonLine(line);
  if (colon && colon.question.length >= 15) return false;

  return true;
}

function parseQuestions(text: string): ParsedQuestion[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !PAGE_MARKER.test(line));

  const questions: ParsedQuestion[] = [];
  let currentGrade = "";
  let currentTask = "";
  let currentSection = "";
  let numberedBuffer = "";
  let questionPrefix = "";
  let pendingShortAnswerIndex: number | null = null;

  const currentTopic = () => buildTopic(currentGrade, currentTask, currentSection);

  const pushQuestion = (question: string, answer: string) => {
    questions.push({
      id: `q-${questions.length + 1}`,
      question: cleanText(question),
      answer: cleanText(answer),
      topic: currentTopic(),
    });
  };

  const pushColonLine = (line: string): boolean => {
    const colon = tryParseColonLine(line);
    if (!colon) return false;

    pushQuestion(colon.question, colon.answer);
    pendingShortAnswerIndex = isShortAnswer(colon.answer)
      ? questions.length - 1
      : null;
    return true;
  };

  const commitNumberedBuffer = (): boolean => {
    if (!numberedBuffer) return false;

    const parsed = tryParseNumberedBuffer(numberedBuffer);
    if (!parsed) return false;

    pushQuestion(parsed.question, parsed.answer);
    numberedBuffer = "";
    pendingShortAnswerIndex = isShortAnswer(parsed.answer)
      ? questions.length - 1
      : null;
    return true;
  };

  const flushNumberedBuffer = () => {
    commitNumberedBuffer();
    numberedBuffer = "";
  };

  const resetLineBuffers = () => {
    flushNumberedBuffer();
    questionPrefix = "";
    pendingShortAnswerIndex = null;
  };

  for (let rawLine of lines) {
    if (questionPrefix) {
      rawLine = cleanText(`${questionPrefix} ${rawLine}`);
      questionPrefix = "";
    }

    const line = rawLine;

    const sectionMatch = line.match(SECTION_MARKER);
    if (sectionMatch) {
      resetLineBuffers();
      if (sectionMatch[2] === "сынып") {
        currentGrade = line;
        currentTask = "";
      } else {
        currentTask = line;
      }
      continue;
    }

    if (isSectionHeader(line)) {
      resetLineBuffers();
      currentSection = line;
      continue;
    }

    if (
      pendingShortAnswerIndex !== null &&
      isAnswerContinuationLine(line) &&
      !numberedBuffer
    ) {
      const pending = questions[pendingShortAnswerIndex];
      pending.answer = cleanText(`${pending.answer} ${line}`);
      if (!isShortAnswer(pending.answer)) {
        pendingShortAnswerIndex = null;
      }
      continue;
    }

    const numberedMatch = line.match(NUMBERED_START);
    if (numberedMatch) {
      flushNumberedBuffer();
      numberedBuffer = line.replace(NUMBERED_START, "");
      commitNumberedBuffer();
      continue;
    }

    if (numberedBuffer) {
      numberedBuffer = `${numberedBuffer} ${line}`;
      commitNumberedBuffer();
      continue;
    }

    if (pushColonLine(line)) {
      continue;
    }

    if (!line.includes(":") && !line.startsWith("(")) {
      questionPrefix = line;
    }
  }

  resetLineBuffers();

  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = `${q.question}|||${q.answer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const pdfPath = path.join(process.cwd(), "тарих_вопросы.pdf");
  const outputPath = path.join(process.cwd(), "src/data/questions.json");

  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const questions = parseQuestions(result.text);

  const topics = [...new Set(questions.map((q) => q.topic))];

  const output = {
    meta: {
      totalQuestions: questions.length,
      topics: topics.length,
      generatedAt: new Date().toISOString(),
    },
    topics,
    questions,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`Parsed ${questions.length} questions across ${topics.length} topics`);
  console.log(`Saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

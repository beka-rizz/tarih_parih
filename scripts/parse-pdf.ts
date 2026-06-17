import fs from "fs";
import path from "path";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export interface ParsedQuestion {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

interface TextLine {
  text: string;
  minX: number;
  maxX: number;
  pageNum: number;
  y: number;
}

const PAGE_MARKER = /^--\s*\d+\s+of\s+\d+\s*--$/;
const GRADE_MARKER = /^(\d+)\s*-\s*сынып$/i;
const TASK_MARKER = /^(\d+)-тапсырма$/i;
const NUMBERED_START = /^(\d+)\.\s+/;

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeGrade(text: string): string {
  const match = text.match(GRADE_MARKER);
  return match ? `${match[1]}-сынып` : cleanText(text);
}

function buildTopic(grade: string, task: string, section: string): string {
  return [grade, task, section].filter(Boolean).join(" · ") || "Жалпы";
}

function stripNumberPrefix(text: string): string {
  return text.replace(NUMBERED_START, "");
}

function isGradeLine(text: string): boolean {
  return GRADE_MARKER.test(cleanText(text));
}

function isTaskLine(text: string): boolean {
  return TASK_MARKER.test(cleanText(text).replace(/\s+/g, ""));
}

function isCenteredSectionHeader(
  text: string,
  minX: number,
  maxX: number,
  pageWidth: number,
): boolean {
  if (!text || text.length > 90) return false;
  if (text.includes(":")) return false;
  if (NUMBERED_START.test(text)) return false;
  if (PAGE_MARKER.test(text)) return false;
  if (text.endsWith(".)") || text.endsWith(")")) return false;
  if (/^\(/.test(text)) return false;

  const lineWidth = maxX - minX;
  const lineCenter = (minX + maxX) / 2;
  const pageCenter = pageWidth / 2;
  const centerOffset = Math.abs(lineCenter - pageCenter);

  return centerOffset < 70 && minX > 90 && lineWidth < 240;
}

function isShortTitleSection(text: string, minX: number, maxX: number): boolean {
  if (!text || text.length > 50) return false;
  if (text.includes(":")) return false;
  if (NUMBERED_START.test(text)) return false;
  if (PAGE_MARKER.test(text)) return false;
  if (text.endsWith(".)") || text.endsWith(")")) return false;
  if (/^\(/.test(text)) return false;
  if (text.includes(",") && text.length > 40) return false;

  const lineWidth = maxX - minX;
  const words = wordCount(text);

  return lineWidth < 95 && minX > 175 && words <= 6;
}

function isEraSectionHeader(text: string, minX: number): boolean {
  if (!text || text.length > 100) return false;
  if (text.includes(":")) return false;
  if (NUMBERED_START.test(text)) return false;
  if (PAGE_MARKER.test(text)) return false;
  if (isGradeLine(text) || isTaskLine(text)) return false;
  if (text.endsWith(".)") || text.endsWith(")")) return false;
  if (text.includes("?")) return false;
  if (text.includes(",") && text.length > 45) return false;
  if (/деп жазған|бойынша|туралы/i.test(text) && text.length > 50) return false;

  const eraPattern =
    /(палеолит|мезолит|неолит|энеолит|мыстытас|қола\s*дәуір|темір\s*дәуір|ғасыры|дәуірі)/i;
  const hasDate =
    /б\.?\s*з\.?\s*[бд]?\.?/i.test(text) ||
    /\d+\s*мың/i.test(text) ||
    /\d+\s*ғ/i.test(text) ||
    /\d+-\d+\s*ж/i.test(text) ||
    /\d{3,4}\s*жыл/i.test(text);

  if (eraPattern.test(text) && (hasDate || text.length < 95)) return true;
  if (/дәуірі\s*$/i.test(text.trim()) && text.length < 90) return true;
  if (hasDate && text.length < 70 && wordCount(text) <= 8 && minX > 120) return true;

  return false;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function isSectionHeader(
  text: string,
  minX: number,
  maxX: number,
  pageWidth: number,
): boolean {
  if (isGradeLine(text) || isTaskLine(text)) return false;
  return (
    isCenteredSectionHeader(text, minX, maxX, pageWidth) ||
    isShortTitleSection(text, minX, maxX) ||
    isEraSectionHeader(text, minX)
  );
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
  if (TASK_MARKER.test(line.replace(/\s+/g, ""))) return false;
  if (GRADE_MARKER.test(line)) return false;
  if (NUMBERED_START.test(line)) return false;
  if (line.startsWith("(")) return false;
  if (/^\d{3,4}\s*ж\./.test(line)) return false;
  if (line.length > 55) return false;
  if (line.includes("?")) return false;

  const colon = tryParseColonLine(line);
  if (colon && colon.question.length >= 15) return false;

  return true;
}

async function extractLines(buffer: Buffer): Promise<TextLine[]> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const lines: TextLine[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lineMap = new Map<number, { str: string; x: number; w: number }[]>();

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;

      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      const w = item.width ?? 0;

      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ str: item.str.trim(), x, w });
    }

    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);

    for (const y of sortedYs) {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const text = items.map((i) => i.str).join(" ").trim();
      if (!text) continue;

      const minX = items[0].x;
      const maxX = items[items.length - 1].x + items[items.length - 1].w;

      lines.push({ text, minX, maxX, pageNum, y });
    }
  }

  return lines;
}

function parseQuestionsFromLines(lines: TextLine[], pageWidths: Map<number, number>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  let currentGrade = "";
  let currentTask = "";
  let currentSection = "";
  let pendingSectionParts: string[] = [];
  let numberedBuffer = "";
  let questionPrefix = "";
  let pendingShortAnswerIndex: number | null = null;

  const currentTopic = () => buildTopic(currentGrade, currentTask, currentSection);

  const flushSection = () => {
    if (pendingSectionParts.length > 0) {
      currentSection = pendingSectionParts.join(" ");
      pendingSectionParts = [];
    }
  };

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

  for (const { text: rawLine, minX, maxX, pageNum } of lines) {
    const pageWidth = pageWidths.get(pageNum) ?? 595;

    if (PAGE_MARKER.test(rawLine)) continue;

    if (isGradeLine(rawLine)) {
      resetLineBuffers();
      flushSection();
      currentGrade = normalizeGrade(rawLine);
      currentTask = "";
      currentSection = "";
      continue;
    }

    if (isTaskLine(rawLine)) {
      resetLineBuffers();
      flushSection();
      currentTask = cleanText(rawLine);
      currentSection = "";
      continue;
    }

    if (isSectionHeader(rawLine, minX, maxX, pageWidth)) {
      resetLineBuffers();
      pendingSectionParts.push(cleanText(rawLine));
      continue;
    }

    flushSection();

    let line = rawLine;
    if (questionPrefix) {
      line = cleanText(`${questionPrefix} ${line}`);
      questionPrefix = "";
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

  flushSection();
  resetLineBuffers();

  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = `${q.question}|||${q.answer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getPageWidths(buffer: Buffer): Promise<Map<number, number>> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const widths = new Map<number, number>();

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    widths.set(pageNum, page.getViewport({ scale: 1 }).width);
  }

  return widths;
}

async function main() {
  const pdfPath = path.join(process.cwd(), "тарих_вопросы.pdf");
  const outputPath = path.join(process.cwd(), "src/data/questions.json");

  const buffer = fs.readFileSync(pdfPath);
  const pageWidths = await getPageWidths(buffer);
  const lines = await extractLines(buffer);
  const questions = parseQuestionsFromLines(lines, pageWidths);

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

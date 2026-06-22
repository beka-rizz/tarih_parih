import type { Question } from "@/types/question";

const DISTRACTORS_PER_QUESTION = 10;

type AnswerKind = "numeric" | "era" | "person" | "place" | "general";

const ERA_TERMS = [
  "Палеолит",
  "Мезолит",
  "Неолит",
  "Энеолит",
  "Тас дәуірі",
  "Қола дәуірі",
  "Темір дәуірі",
  "Ерте темір дәуірі",
  "Орта ғасыр",
  "Ежелгі дәуір",
  "Қайта өрлеу дәуірі",
  "Жаңа заман",
];

const PERSON_NAMES = [
  "Ә. Марғұлан",
  "Ш. Уәлиханов",
  "Ә. Бөкейханов",
  "А. Байтұрсынұлы",
  "М. Дулатов",
  "Ы. Алтынсарин",
  "Абай Құнанбайұлы",
  "Ж. Баласағұни",
  "М. Қашқари",
  "Қ. Сәтбаев",
  "С. Асфендияров",
  "Төле би",
  "Қазыбек би",
  "Әйтеке би",
  "Абылай хан",
  "Керей хан",
  "Жәнібек хан",
  "Қасым хан",
  "Есім хан",
  "Тәуке хан",
];

const PLACES = [
  "Отырар",
  "Түркістан",
  "Тараз",
  "Сайрам",
  "Сығанақ",
  "Сарайшық",
  "Баласағұн",
  "Қойлық",
  "Жетісу",
  "Сырдария бойы",
  "Ертіс бойы",
  "Іле аңғары",
  "Арал маңы",
  "Маңғыстау",
  "Ұлытау",
  "Алтай",
  "Шу аңғары",
  "Талас өңірі",
  "Орталық Қазақстан",
  "Оңтүстік Қазақстан",
];

const GENERAL_TERMS = [
  "Көшпелі мал шаруашылығы",
  "Отырықшы егіншілік",
  "Жартылай көшпелі шаруашылық",
  "Темір өңдеу",
  "Қолөнер",
  "Сауда-саттық",
  "Жібек жолы",
  "Тәңірге табыну",
  "Зороастризм",
  "Буддизм",
  "Ислам діні",
  "Қағанат",
  "Хандық",
  "Ұлыс",
  "Ру-тайпалық бірлестік",
  "Мемлекеттік басқару",
  "Әскери демократия",
  "Дәстүрлі құқық",
  "Мәдени ықпалдастық",
  "Қалалық мәдениет",
];

const PLACE_MARKERS =
  /қала|облыс|астана|өңір|аймақ|аңғар|бойы|маңы|Алтай|Ұлытау|Жетісу|Түркістан|Отырар|Тараз|Сайрам|Сырдария|Ертіс|Іле|Шу|Талас|Қазақстан/i;

const PERSON_MARKERS =
  /хан|би|батыр|ғалым|ақын|жазушы|саяхатшы|қолбасшы|тарихшы|кім|қайраткер/i;

const ERA_MARKERS =
  /палеолит|мезолит|неолит|энеолит|дәуір|ғасыр|тас дәуір|қола дәуір|темір дәуір/i;

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

function isLikelyPerson(answer: string, questionText: string): boolean {
  if (PERSON_MARKERS.test(questionText)) return true;
  if (/[A-ZА-ЯӘІҢҒҚҰҮҺӨ]\.\s?[A-ZА-ЯӘІҢҒҚҰҮҺӨ]/.test(answer)) return true;
  if (/(ұлы|қызы|хан|би|батыр)$/.test(answer)) return true;
  const words = answer.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 4) {
    return words.every((word) => /^[A-ZА-ЯӘІҢҒҚҰҮҺӨ]/.test(word));
  }
  return false;
}

function isLikelyPlace(answer: string, questionText: string): boolean {
  if (PLACE_MARKERS.test(answer)) return true;
  return /қайда|қай жерде|орналасты|орналасқан/.test(questionText);
}

function isLikelyEra(answer: string, questionText: string): boolean {
  return ERA_MARKERS.test(answer) || ERA_MARKERS.test(questionText);
}

function isLikelyNumeric(answer: string): boolean {
  return /\d/.test(answer);
}

function inferKind(question: Question): AnswerKind {
  const answer = normalize(question.answer);
  const questionText = question.question.toLowerCase();

  if (isLikelyNumeric(answer)) return "numeric";
  if (isLikelyEra(answer, questionText)) return "era";
  if (isLikelyPerson(answer, questionText)) return "person";
  if (isLikelyPlace(answer, questionText)) return "place";
  return "general";
}

function mutateNumber(value: number, variants: number[]): number[] {
  return variants.map((step) => Math.max(1, value + step));
}

function buildNumericDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  const matches = normalized.match(/\d+/g);
  if (!matches) return [];

  const nums = matches.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return [];

  const offsets = [-300, -200, -100, -50, -20, -10, -5, 5, 10, 20, 50, 100, 200, 300];
  const generated = new Set<string>();

  if (nums.length >= 2) {
    const [a, b] = nums;
    const aMut = mutateNumber(a, [-8, -6, -4, -2, 2, 4, 6, 8]);
    const bMut = mutateNumber(b, [-8, -6, -4, -2, 2, 4, 6, 8]);
    for (const left of aMut) {
      for (const right of bMut) {
        const variant = normalized.replace(String(a), String(left)).replace(String(b), String(right));
        generated.add(variant);
      }
    }
  }

  for (const num of nums) {
    for (const offset of offsets) {
      const changed = Math.max(1, num + offset);
      generated.add(normalized.replace(String(num), String(changed)));
    }
  }

  if (/ғасыр/i.test(normalized)) {
    generated.add(normalized.replace(/XIX/gi, "XVIII"));
    generated.add(normalized.replace(/XIX/gi, "XX"));
    generated.add(normalized.replace(/XVIII/gi, "XVII"));
    generated.add(normalized.replace(/XX/gi, "XIX"));
  }

  return [...generated].filter((item) => normalize(item) !== normalized);
}

function buildEraDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  return ERA_TERMS.filter((item) => normalize(item).toLowerCase() !== normalized.toLowerCase());
}

function buildPersonDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  const clean = normalized.toLowerCase();

  const generated = PERSON_NAMES.filter((item) => item.toLowerCase() !== clean);
  if (/[A-ZА-ЯӘІҢҒҚҰҮҺӨ]\.\s?[A-ZА-ЯӘІҢҒҚҰҮҺӨ]/.test(normalized)) {
    generated.push("С. Сейфуллин");
    generated.push("I. Жансүгіров");
    generated.push("Б. Момышұлы");
  }
  return generated;
}

function buildPlaceDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  return PLACES.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
}

function buildGeneralDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  const generated = new Set<string>();

  for (const term of GENERAL_TERMS) {
    if (term.toLowerCase() !== normalized.toLowerCase()) generated.add(term);
  }

  if (normalized.split(/\s+/).length <= 3) {
    generated.add(`${capitalizeFirst(normalized)} кезеңі`);
    generated.add(`Ерте ${normalized.toLowerCase()}`);
    generated.add(`Кейінгі ${normalized.toLowerCase()}`);
  }

  generated.add(normalized.replace("ерте", "кейінгі"));
  generated.add(normalized.replace("кейінгі", "ерте"));
  generated.add(normalized.replace("көшпелі", "отырықшы"));
  generated.add(normalized.replace("отырықшы", "көшпелі"));

  return [...generated].filter((item) => normalize(item) !== normalized);
}

function uniquePlausible(
  baseAnswer: string,
  raw: string[],
  needed: number,
): string[] {
  const normalizedBase = normalize(baseAnswer).toLowerCase();
  const picked: string[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const value = normalize(item);
    if (!value) continue;
    const key = value.toLowerCase();
    if (key === normalizedBase) continue;
    if (seen.has(key)) continue;
    if (value.length < 2 || value.length > 120) continue;
    seen.add(key);
    picked.push(value);
    if (picked.length >= needed) break;
  }

  return picked;
}

function fallbackDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  return [
    `${normalized} емес`,
    `Ерте ${normalized.toLowerCase()}`,
    `Кейінгі ${normalized.toLowerCase()}`,
    `${normalized} нұсқасы`,
    `${normalized} кезеңі`,
    `${normalized} үлгісі`,
    `${normalized} бағыты`,
    `${normalized} мектебі`,
    `${normalized} жүйесі`,
    `${normalized} түрі`,
    `Жаңа ${normalized.toLowerCase()}`,
    `Ескі ${normalized.toLowerCase()}`,
  ];
}

export function generateDistractorsForQuestion(question: Question): string[] {
  const answer = normalize(question.answer);
  const kind = inferKind(question);

  let raw: string[] = [];
  if (kind === "numeric") raw = buildNumericDistractors(answer);
  else if (kind === "era") raw = buildEraDistractors(answer);
  else if (kind === "person") raw = buildPersonDistractors(answer);
  else if (kind === "place") raw = buildPlaceDistractors(answer);
  else raw = buildGeneralDistractors(answer);

  let distractors = uniquePlausible(answer, raw, DISTRACTORS_PER_QUESTION);
  if (distractors.length < DISTRACTORS_PER_QUESTION) {
    const fill = uniquePlausible(
      answer,
      [...raw, ...fallbackDistractors(answer)],
      DISTRACTORS_PER_QUESTION,
    );
    distractors = fill;
  }

  return distractors.slice(0, DISTRACTORS_PER_QUESTION);
}

export function generateDistractorsMap(
  questions: Question[],
): Record<string, string[]> {
  const output: Record<string, string[]> = {};
  for (const question of questions) {
    output[question.id] = generateDistractorsForQuestion(question);
  }
  return output;
}

export { DISTRACTORS_PER_QUESTION };

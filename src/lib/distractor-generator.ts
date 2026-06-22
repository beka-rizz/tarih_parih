import type { Question } from "@/types/question";

export const DISTRACTORS_PER_QUESTION = 10;

// ─── Curated answer banks ─────────────────────────────────────────────────────

const ERA_TERMS = [
  "Палеолит", "Мезолит", "Неолит", "Энеолит",
  "Тас дәуірі", "Қола дәуірі", "Темір дәуірі",
  "Ерте темір дәуірі", "Орта ғасыр", "Ежелгі дәуір",
  "Ерте палеолит", "Кейінгі палеолит", "Жаңа тас ғасыры",
  "Ерте неолит", "Мыстытас дәуірі",
];

const PERSON_NAMES = [
  "Ә. Марғұлан", "Ш. Уәлиханов", "Ә. Бөкейханов",
  "А. Байтұрсынұлы", "М. Дулатов", "Ы. Алтынсарин",
  "Абай Құнанбайұлы", "Ж. Баласағұни", "М. Қашқари",
  "Қ. Сәтбаев", "С. Асфендияров", "Төле би",
  "Қазыбек би", "Әйтеке би", "Абылай хан",
  "Керей хан", "Жәнібек хан", "Қасым хан",
  "Есім хан", "Тәуке хан", "С. Сейфуллин",
  "І. Жансүгіров", "Б. Момышұлы", "Р. Қошқарбаев",
  "А. Молдағұлова", "М. Мәметова", "Ж. Досмұхамедов",
  "М. Тынышбаев", "Ж. Ақбаев", "Х. Досмұхамедов",
];

const KZ_REGIONS = [
  "Шығыс Қазақстан", "Батыс Қазақстан", "Солтүстік Қазақстан",
  "Оңтүстік Қазақстан", "Орталық Қазақстан", "Жамбыл облысы",
  "Алматы облысы", "Қарағанды облысы", "Павлодар облысы",
  "Ақтөбе облысы", "Атырау облысы", "Маңғыстау облысы",
  "Қостанай облысы", "Шығыс Қазақстан облысы", "Батыс Қазақстан облысы",
];

const KZ_CITIES = [
  "Отырар", "Түркістан", "Тараз", "Сайрам", "Сығанақ",
  "Сарайшық", "Баласағұн", "Қойлық", "Алматы", "Шымкент",
  "Семей", "Өскемен", "Ташкент", "Самарқанд", "Бұхара",
  "Қызылорда", "Жезқазған", "Зыряновск", "Ақтөбе", "Атырау",
  "Ырғыз", "Теміртау", "Петропавл", "Орал", "Қарағанды",
];

const KZ_GEO = [
  "Жетісу", "Сырдария бойы", "Ертіс бойы", "Іле аңғары",
  "Арал маңы", "Маңғыстау", "Ұлытау", "Алтай", "Шу аңғары",
  "Талас өңірі", "Есіл бойы", "Тобыл бойы", "Мұғалжар",
  "Балқаш маңы", "Қаратау", "Сарыарқа", "Жайық бойы",
  "Ырғыз бойы", "Зайсан маңы", "Шығыс Арал маңы",
];

const SITES = [
  "Батпақ", "Семізбұғы", "Усть-Нарым", "Пеньки",
  "Зеленая Балка", "Шақпақата", "Арыстанды", "Бөріқазған",
  "Шабақты", "Берел", "Қарғалы", "Тасмола", "Жаман Айбат",
  "Алтын Үңгір", "Ботай", "Атасу", "Ақсу-Аюлы",
  "Тоқалы", "Тектұрмас", "Қараүңгір", "Есік",
  "Тілеген", "Шірік-Рабат", "Жамантас", "Алтынтөбе",
];

// Archaeological cultures
const CULTURES = [
  "Андронов", "Беғазы-Дәндібай", "Срубная", "Қарасу",
  "Тасмола", "Қаратом", "Алексеев", "Петровка",
  "Синташта", "Замараев", "Срубно-андронов", "Сейминско-турбинская",
  "Федоров", "Алакул", "Черкаскуль",
];

// Ancient human / animal species
const SPECIES = [
  "Питекантроп", "Синантроп", "Неандерталь", "Кроманьон",
  "Австралопитек", "Гейдельберг адамы", "Homo erectus",
  "Homo habilis", "Homo sapiens sapiens", "Ертедегі адам",
  "Ақылды адам", "Тік жүретін адам", "Алғашқы адам",
];

const TOOLS = [
  "Тас орақ", "Тесе", "Соқа", "Сүйек ине", "Тас балта",
  "Сүйек сүргі", "Тас пышақ", "Қыш ыдыс", "Жебе ұшы",
  "Найза ұшы", "Қола қылыш", "Темір найза", "Садақ пен жебе",
  "Микролит", "Шоқпар", "Диск тас", "Тас скребок",
  "Сүйек шанышқы", "Тас кескіш", "Тас қырғыш",
  "Қола балта", "Темір балта", "Тас шанышқы", "Сүйек балта",
  "Келі мен балта", "Қайла", "Күрек", "Шоқпар мен найза",
];

const ACTIVITIES = [
  "аңшылық", "балықшылық", "терімшілік", "егіншілік",
  "мал шаруашылығы", "қолөнер", "сауда-саттық", "жер жырту",
  "мата тоқу", "ыдыс жасау", "тас балқыту", "қола өңдеу",
  "темір балқыту", "садақ ату", "аттылы соғыс", "жер суару",
  "ірі мал бағу", "ұсақ мал бағу", "аң аулау", "мергендік",
  "жылқы өсіру", "сиыр өсіру", "қой өсіру", "бортпен балық аулау",
];

const EVENTS = [
  "от пайда болды", "жазу ойлап табылды", "егіншілік пайда болды",
  "мал шаруашылығы дамыды", "металл балқыту өнері пайда болды",
  "алып мұздықтардың еруі", "рулық қоғам ыдырады",
  "жеке меншік пайда болды", "еңбек бөлінісі қалыптасты",
  "мемлекет пайда болды", "қала мәдениеті дамыды",
  "сауда жолдары ашылды", "қыш өндірісі дамыды",
  "тоқымашылық дамыды", "металл өңдеу дамыды",
  "жер суару жүйесі дамыды", "отырықшылық қалыптасты",
  "тайпалық бірлестіктер пайда болды", "рулық меншік дамыды",
  "анық сөйлеуді меңгерді",
  // Activity phrases in accusative (ды/ді forms)
  "аңшылықты меңгерді", "от жағуды үйренді", "тас өңдеуді игерді",
  "мата тоқуды меңгерді", "ыдыс жасауды үйренді",
  "жылқыны қолға үйретті", "ірі мал бағуды дамытты",
];

const GENERAL_TERMS = [
  "Көшпелі мал шаруашылығы", "Отырықшы егіншілік",
  "Жартылай көшпелі шаруашылық", "Ру-тайпалық бірлестік",
  "Мемлекеттік басқару", "Дәстүрлі құқық", "Жібек жолы",
  "Тәңірге табыну", "Зороастризм", "Буддизм", "Ислам діні",
  "Қағанат", "Хандық", "Ұлыс", "Әскери демократия",
  "Мәдени ықпалдастық", "Қалалық мәдениет", "Матриархат",
  "Патриархат", "Рулық меншік",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const ERA_SET = new Set(ERA_TERMS.map((x) => x.toLowerCase()));

// ─── Question-context signals ─────────────────────────────────────────────────

const Q_PERSON =
  /\bкім(нің|дің|ге)?\b|жазған|тарихшы|басшы|\bхан\b|әкім|ақын|ғалым|саяхатшы|көрнекті|қолбасшы|патша|елші|зерттеген|билеуші|генерал|қаһарман/i;

const Q_SITE =
  /тұрағы|тұрақтар|ескерткіш|табылған жер|табылды|алғаш табылған|орналасқан/i;

const Q_REGION =
  /аймақ|өңір|аймағы|өңірі|орналасқан облыс/i;

const Q_TOOL =
  /еңбек құрал|аспап|жарақ|қару|ойлап тапқан еңбек/i;

const Q_ACTIVITY =
  /негізгі кәсіп|шаруашылық түрі|кәсібі|айналысты/i;

const Q_CULTURE =
  /мәдениеті|мәдениет|рулық мәдениет/i;

const Q_SPECIES =
  /адам түрі|адам өкілі|адамның түрі|homo|питекантроп|синантроп/i;

// ─── Answer-type detection ────────────────────────────────────────────────────

function isEraAnswer(answer: string): boolean {
  const a = normalize(answer).toLowerCase();
  if (ERA_SET.has(a)) return true;
  return /^(палеолит|мезолит|неолит|энеолит|тас дәуір|қола дәуір|темір дәуір|ерте темір|орта ғасыр|ежелгі дәуір|мыстытас)/i.test(a);
}

function isNumericAnswer(answer: string): boolean {
  return /\d/.test(answer);
}

// Geo abbreviation prefixes — NOT person initials
const GEO_PREFIX = /^(Солт|Оңт|Шығ|Бат|Орт|Сев|Юж|Вост|Зап)\./i;

const TOOL_WORDS =
  /балта|орақ|тесе|соқа|ине|пышақ|ыдыс|жебе|найза|қылыш|шоқпар|кескіш|қырғыш|скребок|микролит|келі|қайла|шанышқы|мешел|садақ/i;

function isToolAnswer(answer: string): boolean {
  if (TOOL_WORDS.test(answer)) return true;
  return /^(Тас |Сүйек |Қола |Темір |Қыш |Ағаш )/i.test(answer);
}

function isSpeciesAnswer(answer: string): boolean {
  return /питекантроп|синантроп|неандерталь|кроманьон|австралопитек|homo\s/i.test(
    answer,
  );
}

function isPersonAnswer(answer: string): boolean {
  const a = normalize(answer);
  // Geographic abbreviation is not a person
  if (GEO_PREFIX.test(a)) return false;
  // Tool words are not person
  if (TOOL_WORDS.test(a)) return false;
  // Species are not persons
  if (isSpeciesAnswer(a)) return false;
  // Contains place markers
  if (/(облысы|аймағы|өңірі|бойы|аңғары|маңы|жағалауы|Қытай|Ресей|Украина|Монголия)/i.test(a)) return false;

  // Comma-separated items → not a person
  if (a.includes(",")) return false;

  // Abbreviated name like Ш.Уалиханов or Ш. Уалиханов
  if (/^[А-ЯӘІҢҒҚҰҮҺЁA-Z]{1,2}\.\s?[А-ЯӘІҢҒҚҰҮҺЁA-Z]/u.test(a)) return true;

  // Ends with Kazakh person suffix
  if (/(ұлы|қызы|хан|би|батыр|бек)$/i.test(a)) return true;

  // Ends with Russian name suffix but has Kazakh first-word (e.g. Абай, Жамбыл)
  // Require first word to be ≥4 chars and both words capitalize
  const words = a.split(/\s+/);
  if (
    words.length === 2 &&
    words.every((w) => /^[А-ЯӘІҢҒҚҰҮҺЁA-Z]/u.test(w)) &&
    words[0].length >= 4 &&
    words[1].length >= 4 &&
    /(ов|ев|ин|ова|ева|ұлы|қызы|хан|би|баев|бай)$/i.test(words[1])
  ) {
    return true;
  }

  return false;
}

function isSiteAnswer(answer: string): boolean {
  const norm = normalize(answer).toLowerCase();
  return SITES.some((s) => s.toLowerCase() === norm);
}

function isCultureAnswer(answer: string): boolean {
  const norm = normalize(answer).toLowerCase();
  return CULTURES.some((c) => c.toLowerCase() === norm);
}

function isPlaceAnswer(answer: string): boolean {
  const a = normalize(answer);
  if (GEO_PREFIX.test(a)) return true;
  if (/(облысы|аймағы|өңірі|бойы|аңғары|маңы|жағалауы)/i.test(a)) return true;
  if (
    /(Қазақстан|Жетісу|Маңғыстау|Ұлытау|Алтай|Жамбыл|Арал|Балқаш|Сырдария|Ертіс|Іле|Есіл|Шу|Талас|Тобыл|Сарыарқа|Жайық)/i.test(
      a,
    )
  ) {
    return true;
  }
  return false;
}

function isActivityAnswer(answer: string): boolean {
  return /(аңшылық|балықшылық|терімшілік|егіншілік|мал шаруашылығы|тоқымашылық|балқыту|жер жырту|мата тоқу|аң аулау|мергендік)/i.test(
    answer,
  );
}

function isEventAnswer(answer: string): boolean {
  return /(пайда болды|дамыды|қалыптасты|ашылды|ыдырады|еруі|меңгерді|өнері пайда|жүйесі дамыды)/i.test(
    answer,
  );
}

// ─── Kind type ────────────────────────────────────────────────────────────────

type AnswerKind =
  | "era"
  | "numeric"
  | "person"
  | "region"
  | "site"
  | "culture"
  | "place"
  | "tool"
  | "species"
  | "activity"
  | "event"
  | "general";

// Strip decorative Kazakh quotes «» from answer for classification
function stripQuotes(text: string): string {
  return text.replace(/^«|»$/g, "").trim();
}

// Comma-joined site names like "Петровка,Боголюбов" or "Шақпақата,Арыстанды"
function isCommaSites(answer: string): boolean {
  if (!answer.includes(",")) return false;
  const parts = answer.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 5) return false;
  // Each part starts with uppercase
  return parts.every((p) => /^[А-ЯӘІҢҒҚҰҮҺЁA-Z]/u.test(p) && p.length >= 3);
}

function isRegionAnswer(answer: string): boolean {
  return /(облысы|аймағы|өңірі|Қазақстан|Жетісу|Маңғыстау|Ұлытау|Алтай|Жамбыл|Арал|Сарыарқа|Жайық|Ертіс)/i.test(answer);
}

// Activity-like answers including accusative forms (-ды/-ді/-ны/-ні)
function isActivityLike(answer: string): boolean {
  if (isActivityAnswer(answer)) return true;
  const stripped = answer.replace(/(ды|ді|ны|ні|ту|ті|ды|дi)$/i, "");
  return isActivityAnswer(stripped) ||
    /(сөйлеу|еңбек|жасау|тоқу|аулау|өсіру|егу|суару|балқыту)/i.test(stripped);
}

function inferKind(answer: string, questionText: string): AnswerKind {
  const raw = normalize(answer);
  const a = stripQuotes(raw);
  const q = questionText;

  // Hard answer rules first
  if (isEraAnswer(a)) return "era";
  if (isNumericAnswer(a)) return "numeric";
  if (isSpeciesAnswer(a)) return "species";
  if (isToolAnswer(a)) return "tool";
  if (isCultureAnswer(a)) return "culture";
  if (isSiteAnswer(a)) return "site";

  // Comma-separated site names (Петровка,Боголюбов / Шақпақата,Арыстанды)
  if (isCommaSites(a)) return "site";

  // Answer is a region — always wins over question-based site detection
  if (isRegionAnswer(a)) return "region";

  // Answer is any other place
  if (isPlaceAnswer(a)) return "place";

  // Person detection via question context
  if (Q_PERSON.test(q) && isPersonAnswer(a)) return "person";
  if (isPersonAnswer(a)) return "person";

  // Question context for remaining ambiguous types
  if (Q_SITE.test(q)) return "site";
  if (Q_REGION.test(q)) return "region";
  if (Q_TOOL.test(q)) return "tool";
  if (Q_CULTURE.test(q)) return "culture";
  if (Q_SPECIES.test(q)) return "species";
  if (Q_ACTIVITY.test(q)) return "activity";

  // Activity including accusative forms
  if (isActivityLike(a)) return "activity";
  if (isEventAnswer(a)) return "event";

  return "general";
}

// ─── Distractor builders ──────────────────────────────────────────────────────

function except(list: string[], answer: string): string[] {
  const a = normalize(answer).toLowerCase();
  return list.filter((item) => normalize(item).toLowerCase() !== a);
}

function buildForKind(answer: string, kind: AnswerKind): string[] {
  switch (kind) {
    case "numeric":
      return buildNumericDistractors(answer);
    case "era":
      return except(ERA_TERMS, answer);
    case "person":
      return except(PERSON_NAMES, answer);
    case "region":
      return except([...KZ_REGIONS, ...KZ_GEO], answer);
    case "site":
      return except([...SITES, ...KZ_CITIES.slice(0, 10)], answer);
    case "culture":
      return except([...CULTURES, ...SITES.slice(0, 8)], answer);
    case "place":
      return except([...KZ_GEO, ...KZ_CITIES, ...KZ_REGIONS.slice(0, 8)], answer);
    case "tool":
      return except(TOOLS, answer);
    case "species":
      return except(SPECIES, answer);
    case "activity":
      return except(ACTIVITIES, answer);
    case "event":
      return except(EVENTS, answer);
    case "general":
    default:
      return except(GENERAL_TERMS, answer);
  }
}

function buildNumericDistractors(answer: string): string[] {
  const normalized = normalize(answer);
  const matches = normalized.match(/\d+/g);
  if (!matches) return [];

  const nums = matches.map(Number).filter(Number.isFinite);
  if (nums.length === 0) return [];

  const offsets = [-300, -200, -100, -50, -20, -10, -5, 5, 10, 20, 50, 100, 200, 300];
  const generated = new Set<string>();

  if (nums.length >= 2) {
    const [a, b] = nums;
    for (const da of [-8, -6, -4, -2, 2, 4, 6, 8]) {
      for (const db of [-8, -6, -4, -2, 2, 4, 6, 8]) {
        const na = Math.max(1, a + da);
        const nb = Math.max(1, b + db);
        generated.add(
          normalized.replace(String(a), String(na)).replace(String(b), String(nb)),
        );
      }
    }
  }

  for (const num of nums) {
    for (const offset of offsets) {
      const changed = Math.max(1, num + offset);
      generated.add(normalized.replace(String(num), String(changed)));
    }
  }

  return [...generated].filter((item) => normalize(item) !== normalized);
}

// ─── Final assembly ───────────────────────────────────────────────────────────

function uniquePick(baseAnswer: string, raw: string[], needed: number): string[] {
  const normalizedBase = normalize(baseAnswer).toLowerCase();
  const picked: string[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const value = normalize(item);
    if (!value || value.length < 2 || value.length > 120) continue;
    const key = value.toLowerCase();
    if (key === normalizedBase || seen.has(key)) continue;
    seen.add(key);
    picked.push(value);
    if (picked.length >= needed) break;
  }

  return picked;
}

function fallback(answer: string): string[] {
  const a = normalize(answer);
  return [
    `Ерте ${a.toLowerCase()}`,
    `Кейінгі ${a.toLowerCase()}`,
    `Жаңа ${a.toLowerCase()}`,
    `Ескі ${a.toLowerCase()}`,
    `${a} кезеңі`,
    `${a} дәуірі`,
    `${a} мектебі`,
    `${a} жүйесі`,
    `${a} бағыты`,
    `${a} үлгісі`,
  ];
}

export function generateDistractorsForQuestion(question: Question): string[] {
  const answer = normalize(question.answer);
  const kind = inferKind(answer, question.question);
  const raw = buildForKind(answer, kind);
  let distractors = uniquePick(answer, raw, DISTRACTORS_PER_QUESTION);

  if (distractors.length < DISTRACTORS_PER_QUESTION) {
    const broader: string[] = [...raw];
    if (kind === "site") broader.push(...except([...SITES, ...KZ_GEO, ...KZ_CITIES], answer));
    else if (kind === "region") broader.push(...except([...KZ_REGIONS, ...KZ_GEO, ...KZ_CITIES], answer));
    else if (kind === "activity") broader.push(...except([...ACTIVITIES, ...EVENTS], answer));
    else if (kind === "event") broader.push(...except([...EVENTS, ...ACTIVITIES], answer));
    else if (kind === "tool") broader.push(...except([...TOOLS, ...ACTIVITIES], answer));
    else if (kind === "culture") broader.push(...except([...CULTURES, ...SITES, ...ERA_TERMS], answer));
    else if (kind === "species") broader.push(...except([...SPECIES, ...PERSON_NAMES.slice(0, 8)], answer));
    broader.push(...fallback(answer));
    distractors = uniquePick(answer, broader, DISTRACTORS_PER_QUESTION);
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

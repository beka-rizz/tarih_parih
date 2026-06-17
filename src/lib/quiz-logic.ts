import type {
  Question,
  QuizAnswer,
  QuizResult,
  TopicStats,
} from "@/types/question";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickRandomQuestions(
  pool: Question[],
  count: number,
  topic?: string,
): Question[] {
  const filtered = topic
    ? pool.filter((question) => question.topic === topic)
    : pool;
  return shuffleArray(filtered).slice(0, Math.min(count, filtered.length));
}

type AnswerKind = "numeric-date" | "place" | "person" | "general";

const NUMERIC_DATE_QUESTION =
  /мерзімі|саны|жылы|қашан|неше|жылдар|хронология|аралығы|мөлшері|жас мөлшері|шамамен|кезең|созылды|шықты|жас мөлшері|жылдықтар|мыңжылдық/i;

const PLACE_QUESTION =
  /қай жерде|орналасқан|табылған жері|аймағы|өңірі|қаласы|мекендеген|бойында|жағалауы|табылады/i;

const PERSON_QUESTION =
  /кім(нің|дің|ге)?|жазған|тарихшы|басшы|хан|әкім|ақын|ғалымы|ғалымның|ғалым\s+[А-ӘA-ZӘІҢҒҚҰҮҺӨ]|көрнекті|қолбасшы|қолбасшылығымен|император|патша|елші|зерттеген|зерттеуді\s+баста|пікірі|дерек берген|деп жазған|әулетінің|билеушісі|генерал|фельдмаршал|қаһарманы|атауы берілген/i;

const PERSON_NAME_SUFFIX =
  /ев$|ов$|ин$|ский$|хан$|баев$|ұлы$|ова$|ый$|ий$|батыр$|бек$|ұн$|қызы$|онт$|от$|бон$|мен$/i;

const NON_PERSON_SHORT =
  /^(палеолит|мезолит|неолит|сақтар|үйсіндер|ғұндар|қанлылар|сарматтар|темір|қола|мыстытас)$/i;

const NON_PERSON_WORD =
  /сүйектен|бастары|аңдар|құмыралар|берел|қыстауы|табыну|сөйлеуді|мейрамы|бояумен|ыдыстар|үйлер|хандар|авторлары/i;

function isPersonQuestion(questionText: string): boolean {
  const q = questionText.toLowerCase();

  if (/ғалымдар|ғалымдардың/i.test(q)) {
    if (!/ғалымы|ғалымның|ғалым\s+[а-әa-z]/i.test(questionText)) {
      return false;
    }
  }

  return PERSON_QUESTION.test(q);
}

function getGrade(topic: string): string {
  return topic.split(" · ")[0]?.trim() ?? "";
}

function normalizeAnswer(answer: string): string {
  return answer.replace(/\s+/g, " ").trim();
}

function startsWithUppercase(text: string): boolean {
  const char = text.trim()[0];
  if (!char) return false;
  const upper = char.toLocaleUpperCase("kk-KZ");
  const lower = char.toLocaleLowerCase("kk-KZ");
  return char === upper && char !== lower;
}

function isCapitalizedToken(word: string): boolean {
  if (!word) return false;
  return startsWithUppercase(word) || /^[A-Z]/.test(word);
}

function isAbbreviatedName(answer: string): boolean {
  const compact = answer.replace(/\s+/g, "");
  if (!compact.includes(".")) return false;

  const parts = compact.split(".");
  if (parts.length < 2) return false;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!isCapitalizedToken(parts[i])) return false;
  }

  const last = parts[parts.length - 1];
  if (/Қытай|Орда|Қазақстан|Ертіс|Түркістан/i.test(last)) return false;
  return last.length >= 3 && isCapitalizedToken(last);
}

function hasDatePattern(text: string): boolean {
  return (
    /\d{3,4}\s*ж/i.test(text) ||
    /б\.?\s*з/i.test(text) ||
    /\d+\s*мың/i.test(text)
  );
}

function isNumericDateAnswer(answer: string): boolean {
  if (!/\d/.test(answer)) return false;

  return (
    hasDatePattern(answer) ||
    /\d+\s*мың\s*жыл/i.test(answer) ||
    /\d+\s*жыл/i.test(answer) ||
    /\d+\s*[-–—]\s*\d+/.test(answer) ||
    /\d+\s*дан/i.test(answer) ||
    /б\.?\s*з/i.test(answer) ||
    /^\d+[%км]/.test(answer.trim()) ||
    /^\d+\s*[%км]/i.test(answer)
  );
}

function isPlaceAnswer(answer: string): boolean {
  if (answer.length > 55) return false;
  if (answer.includes("?")) return false;
  if (isNumericDateAnswer(answer)) return false;
  if (
    /ның|нің|деп|бойынша|жасалды|басталды|бейнесі|дамуы|көму|палеолит|тұрақтар/i.test(
      answer,
    )
  ) {
    return false;
  }

  const geoMarker =
    /облысы|қаласы|өңір|аймағы|мекені|жағалауы|бойында|Қазақстан|жерінен|Арал|Есіл|Ертіс|Балқаш|Түркістан|Сырдария|Оңтүстік|Жамбыл|Қарқаралы|Ташкент|Жезқазған|төңірегі/i;

  if (geoMarker.test(answer)) return true;

  const quoted = answer.match(/^«([^»]+)»$/);
  if (quoted && geoMarker.test(quoted[1])) return true;

  return answer.length <= 30 && geoMarker.test(answer);
}

function isPersonAnswer(answer: string): boolean {
  if (answer.length > 55) return false;
  if (answer.includes("?")) return false;
  if (isNumericDateAnswer(answer)) return false;
  if (isPlaceAnswer(answer)) return false;
  if (NON_PERSON_SHORT.test(answer.trim())) return false;
  if (NON_PERSON_WORD.test(answer)) return false;
  if (/мезолит|палеолит|неолит|олдувай/i.test(answer)) return false;
  if (/тер$|изм$|ізм$|лит$/i.test(answer)) return false;

  const words = answer.split(/[\s,]+/).filter(Boolean);
  if (words.length > 4) return false;
  if (answer.split(",").length > 2) return false;

  if (
    /тарға|ларға|дікі|тық|дық|шылық|дәуір|стилі|терісін|обасы|көсемі|деп|бойынша|жасалды|басталды|бейнесі|дамуы/i.test(
      answer,
    )
  ) {
    return false;
  }

  if (/\s+адам$/i.test(answer) && !/^[A-Z]/.test(answer)) return false;

  if (isAbbreviatedName(answer)) return true;

  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(answer)) return true;

  if (
    words.length === 2 &&
    isCapitalizedToken(words[0]) &&
    isCapitalizedToken(words[1]) &&
    words[0].length >= 3 &&
    words[1].length >= 3
  ) {
    if (/^(киіз|Ағаш|Шыны|Отқа|Зеленая|грек)$/i.test(words[0])) return false;
    if (/^(хандар|ыдыстар|үйлер|авторлары|маңы|кезеңі|бояумен|Балка|Ордада)$/i.test(
      words[1],
    )) {
      return false;
    }
    if (PERSON_NAME_SUFFIX.test(answer)) return true;
    if (words[0].length >= 4 && words[1].length >= 3) return true;
  }

  if (words.length <= 2 && answer.length <= 40 && startsWithUppercase(answer)) {
    if (/\d/.test(answer)) return false;
    if (/^(Қазақстан|Ертіс|Шебі|байы|облысы|қаласы)$/i.test(answer)) {
      return false;
    }
    if (/Шебі|байы|облысы|қаласы/i.test(answer) && !isAbbreviatedName(answer)) {
      return false;
    }
    if (words.length >= 2) {
      if (PERSON_NAME_SUFFIX.test(answer)) return true;
      return false;
    }
    if (/тар$|лар$|дер$|тық$|дық$|шылық$/i.test(answer)) return false;
    if (PERSON_NAME_SUFFIX.test(answer)) return true;
    if (/^[A-Z][a-z]{3,}$/.test(answer)) return true;
    return false;
  }

  return false;
}

function inferAnswerKind(questionText: string, correctAnswer: string): AnswerKind {
  const q = questionText.toLowerCase();

  if (NUMERIC_DATE_QUESTION.test(q)) return "numeric-date";

  if (isPersonQuestion(questionText) && isPersonAnswer(correctAnswer)) return "person";

  if (PLACE_QUESTION.test(q)) return "place";

  if (isNumericDateAnswer(correctAnswer)) return "numeric-date";
  if (isPlaceAnswer(correctAnswer)) return "place";
  if (isPersonAnswer(correctAnswer)) return "person";

  return "general";
}

function matchesAnswerKind(answer: string, kind: AnswerKind): boolean {
  if (kind === "numeric-date") return isNumericDateAnswer(answer);
  if (kind === "place") return isPlaceAnswer(answer);
  if (kind === "person") return isPersonAnswer(answer);
  return true;
}

function isPlausibleDistractor(correct: string, candidate: string): boolean {
  const correctLen = correct.length;
  const candidateLen = candidate.length;

  if (
    correctLen <= 35 &&
    candidateLen > Math.max(correctLen * 2.5, correctLen + 30)
  ) {
    return false;
  }

  if (correctLen > 35 && candidateLen > correctLen * 2) {
    return false;
  }

  if (correctLen > 50 && candidateLen < correctLen * 0.4) {
    return false;
  }

  return true;
}

function listItemCount(text: string): number {
  if (!text.includes(",")) return 1;
  return text.split(",").filter((part) => part.trim().length > 0).length;
}

function answerSimilarity(correct: string, candidate: string): number {
  if (candidate === correct) return -1;

  const correctLen = correct.length;
  const candidateLen = candidate.length;
  const maxLen = Math.max(correctLen, candidateLen, 1);

  let score = 0;

  const lenRatio = Math.min(correctLen, candidateLen) / maxLen;
  score += lenRatio * 40;

  const correctWords = correct.split(/[\s,]+/).filter(Boolean).length;
  const candidateWords = candidate.split(/[\s,]+/).filter(Boolean).length;
  const maxWords = Math.max(correctWords, candidateWords, 1);
  score += (Math.min(correctWords, candidateWords) / maxWords) * 20;

  if (isNumericDateAnswer(correct) === isNumericDateAnswer(candidate)) score += 15;
  if (isPersonAnswer(correct) === isPersonAnswer(candidate)) score += 14;
  if (hasDatePattern(correct) === hasDatePattern(candidate)) score += 10;
  if (correct.includes(",") === candidate.includes(",")) score += 6;

  const correctListItems = listItemCount(correct);
  const candidateListItems = listItemCount(candidate);
  if (correctListItems === candidateListItems) score += 8;

  const correctShort = correctLen <= 30;
  const candidateShort = candidateLen <= 30;
  if (correctShort === candidateShort) score += 8;

  if (
    (correctLen < 25 && candidateLen > 55) ||
    (correctLen > 55 && candidateLen < 25)
  ) {
    score -= 50;
  }

  return score;
}

function collectUniqueAnswers(questions: Question[], excludeId: string): string[] {
  const seen = new Set<string>();
  const answers: string[] = [];

  for (const item of questions) {
    if (item.id === excludeId) continue;
    const answer = normalizeAnswer(item.answer);
    if (!answer || seen.has(answer)) continue;
    seen.add(answer);
    answers.push(answer);
  }

  return answers;
}

function buildAnswerIndex(allQuestions: Question[]): Map<string, Question> {
  const index = new Map<string, Question>();

  for (const item of allQuestions) {
    const answer = normalizeAnswer(item.answer);
    if (!index.has(answer)) {
      index.set(answer, item);
    }
  }

  return index;
}

function filterCandidatesByKind(
  candidates: string[],
  kind: AnswerKind,
  minCount: number,
): string[] {
  const strict = candidates.filter((answer) => matchesAnswerKind(answer, kind));

  if (strict.length >= minCount) return strict;

  if (kind === "numeric-date") {
    const eraLike = candidates.filter(
      (answer) =>
        /\d/.test(answer) &&
        (/\d+\s*ғ/i.test(answer) || /\d+\s*ж\.?\s*ж/i.test(answer)),
    );
    if (eraLike.length >= minCount) return eraLike;
  }

  return strict.length > 0 ? strict : candidates;
}

function pickScoredDistractors(
  correct: string,
  candidates: string[],
  count: number,
  alreadyUsed: Set<string>,
  answerIndex: Map<string, Question>,
  question: Question,
  kind: AnswerKind,
): string[] {
  const grade = getGrade(question.topic);

  const plausible = candidates.filter(
    (answer) =>
      answer !== correct &&
      !alreadyUsed.has(answer) &&
      isPlausibleDistractor(correct, answer) &&
      (kind !== "person" || isPersonAnswer(answer)),
  );

  const scored = plausible
    .map((answer) => {
      const source = answerIndex.get(answer);
      const sameTopic = source?.topic === question.topic;
      const sameGrade = source && getGrade(source.topic) === grade;

      let score = answerSimilarity(correct, answer);

      if (sameTopic) score += 22;
      else if (sameGrade) score += 12;

      if (matchesAnswerKind(answer, kind)) score += 18;
      else if (kind === "person") score -= 40;

      return { answer, score };
    })
    .sort((a, b) => b.score - a.score);

  const topPool = scored.slice(0, Math.min(24, scored.length));
  const picked: string[] = [];

  for (const { answer } of shuffleArray(topPool)) {
    if (picked.length >= count) break;
    picked.push(answer);
    alreadyUsed.add(answer);
  }

  return picked;
}

export function generateOptions(
  question: Question,
  allQuestions: Question[],
  optionCount = 4,
): string[] {
  const correct = normalizeAnswer(question.answer);
  const kind = inferAnswerKind(question.question, correct);
  const distractorCount = optionCount - 1;
  const used = new Set<string>([correct]);
  const answerIndex = buildAnswerIndex(allQuestions);

  const allAnswers = collectUniqueAnswers(allQuestions, question.id);
  const typedCandidates = filterCandidatesByKind(
    allAnswers,
    kind,
    distractorCount,
  );

  const distractors = pickScoredDistractors(
    correct,
    typedCandidates,
    distractorCount,
    used,
    answerIndex,
    question,
    kind,
  );

  if (distractors.length < distractorCount) {
    const fallbackPool =
      kind === "person"
        ? allAnswers.filter((answer) => isPersonAnswer(answer))
        : allAnswers;

    const fallback = pickScoredDistractors(
      correct,
      fallbackPool,
      distractorCount - distractors.length,
      used,
      answerIndex,
      question,
      kind,
    );
    distractors.push(...fallback);
  }

  return shuffleArray([correct, ...distractors]).slice(0, optionCount);
}

export function calculateTopicStats(answers: QuizAnswer[]): TopicStats[] {
  const map = new Map<string, { total: number; correct: number }>();

  for (const answer of answers) {
    const current = map.get(answer.topic) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    map.set(answer.topic, current);
  }

  return [...map.entries()]
    .map(([topic, stats]) => {
      const wrong = stats.total - stats.correct;
      const percentage = Math.round((stats.correct / stats.total) * 100);
      return {
        topic,
        total: stats.total,
        correct: stats.correct,
        wrong,
        percentage,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);
}

export function getWeakTopics(
  topicStats: TopicStats[],
  threshold = 60,
): TopicStats[] {
  return topicStats.filter((stat) => stat.percentage < threshold);
}

export function buildQuizResult(answers: QuizAnswer[]): QuizResult {
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = answers.length - correctCount;
  const percentage = Math.round((correctCount / answers.length) * 100);
  const topicStats = calculateTopicStats(answers);
  const weakTopics = getWeakTopics(topicStats);

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    completedAt: new Date().toISOString(),
    totalQuestions: answers.length,
    correctCount,
    wrongCount,
    percentage,
    answers,
    weakTopics,
  };
}

export type QuizQuestion = Question & { options: string[] };

export function buildQuizSession(
  pool: Question[],
  count: number,
  topic?: string,
): QuizQuestion[] {
  const picked = pickRandomQuestions(pool, count, topic);

  return picked.map((question) => ({
    ...question,
    options: generateOptions(question, pool),
  }));
}

import { NextRequest, NextResponse } from "next/server";
import { buildQuizSession } from "@/lib/quiz-logic";
import { getQuestionPool } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = Number(searchParams.get("count") ?? "20");
  const topic = searchParams.get("topic") ?? undefined;

  const safeCount = Number.isFinite(count)
    ? Math.min(Math.max(count, 1), 50)
    : 20;

  const pool = getQuestionPool();
  const session = buildQuizSession(
    pool,
    safeCount,
    topic && topic.length > 0 ? topic : undefined,
  );

  return NextResponse.json({ questions: session });
}

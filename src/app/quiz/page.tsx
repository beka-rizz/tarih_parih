import QuizClient from "@/components/QuizClient";
import { getTopics } from "@/lib/questions";

export default function QuizPage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <QuizClient topics={getTopics()} />
    </main>
  );
}

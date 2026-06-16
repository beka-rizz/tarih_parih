import Header from "@/components/Header";
import QuizClient from "@/components/QuizClient";
import { getTopics } from "@/lib/questions";

export default function QuizPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10 sm:px-6">
        <QuizClient topics={getTopics()} />
      </main>
    </>
  );
}

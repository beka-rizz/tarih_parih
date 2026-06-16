import Header from "@/components/Header";
import FlashcardsClient from "@/components/FlashcardsClient";
import { getTopics } from "@/lib/questions";

export default function FlashcardsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10 sm:px-6">
        <FlashcardsClient topics={getTopics()} />
      </main>
    </>
  );
}

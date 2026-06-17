import FlashcardsClient from "@/components/FlashcardsClient";
import { getTopics } from "@/lib/questions";

export default function FlashcardsPage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <FlashcardsClient topics={getTopics()} />
    </main>
  );
}

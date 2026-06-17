import { Suspense } from "react";
import ResultsClient from "@/components/ResultsClient";

export default function ResultsPage() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">Нәтижелер жүктелуде...</p>
          </div>
        }
      >
        <ResultsClient />
      </Suspense>
    </main>
  );
}

import { Suspense } from "react";
import Header from "@/components/Header";
import ResultsClient from "@/components/ResultsClient";

export default function ResultsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-10 sm:px-6">
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
    </>
  );
}

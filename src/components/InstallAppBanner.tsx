"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tarih-parih-update-banner-v1";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";

  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

const updateHighlights = [
  "Төменгі навигация — ыңғайлы ауысу",
  "Карточкаларда swipe жесттері",
  "Тесттер мен нәтижелер мобильге бейімделген",
];

const iosSteps = [
  {
    title: "Safari браузерінде ашыңыз",
    detail: "Chrome немесе басқа браузерде «Басты экранға қосу» әрқашан көрінбеуі мумкін.",
  },
  {
    title: "«Бөлісу» батырмасын басыңыз",
    detail: "Экранның төменгі ортасында квадрат + ok белгісі.",
  },
  {
    title: "«Басты экранға қосу» таңдаңыз",
    detail: "Тізімді төмен сырғытсаңыз, опция табылады.",
  },
  {
    title: "«Қосу» батырмасын растаңыз",
    detail: "Белгіше басты экранға қосылады — қосымша сияқты ашылады.",
  },
];

const androidSteps = [
  {
    title: "Chrome браузерінде ашыңыз",
    detail: "Сайтты tarih-parih (немесе сіздің доменіңіз) арқылы ашыңыз.",
  },
  {
    title: "Үш нүкте (⋮) мәзірін ашыңыз",
    detail: "Экранның оң жоғарғы бұрышындағы браузер мәзірі.",
  },
  {
    title: "«Басты экранға қосу» немесе «Орнату» таңдаңыз",
    detail: "Chrome нұсқасына байланысты мәтін сәл өзгеруі мумкін.",
  },
  {
    title: "Орнатуды растаңыз",
    detail: "Қосымша басты экранға қосылады — тез кіру үшін.",
  },
];

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [activeTab, setActiveTab] = useState<Platform>("ios");

  useEffect(() => {
    const detected = detectPlatform();

    if (
      isStandalone() ||
      !isMobileViewport() ||
      localStorage.getItem(STORAGE_KEY) === "dismissed"
    ) {
      return;
    }

    setPlatform(detected);
    setActiveTab(detected === "android" ? "android" : "ios");
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  const steps = activeTab === "android" ? androidSteps : iosSteps;

  return (
    <div className="border-b border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 md:hidden">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-lg text-white shadow-sm"
          >
            ✨
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-sky-700">
                  Жаңа жаңарту
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                  Мобильді нұсқа жақсартылды
                </p>
              </div>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Жабу"
                className="touch-target -mr-1 shrink-0 rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <ul className="mt-2 space-y-1">
              {updateHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-xs text-slate-600"
                >
                  <span className="mt-0.5 text-sky-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="touch-target mt-2.5 text-xs font-semibold text-sky-700 underline-offset-2 hover:underline"
            >
              {expanded
                ? "Орнату нұсқаулығын жасыру"
                : "Телефонға қосымша ретінде орнату →"}
            </button>

            {expanded && (
              <div className="mt-3 rounded-xl border border-sky-200/80 bg-white/90 p-3 shadow-sm">
                <p className="text-xs font-medium text-slate-700">
                  Tarih Parih-ті басты экранға қосып, қосымша сияқты
                  пайдаланыңыз. Интернет қажет — деректер браузерде сақталады.
                </p>

                <div className="mt-3 flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ios")}
                    className={`touch-target flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${
                      activeTab === "ios"
                        ? "bg-white text-sky-800 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    iPhone / iPad
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("android")}
                    className={`touch-target flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${
                      activeTab === "android"
                        ? "bg-white text-sky-800 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Android
                  </button>
                </div>

                {platform !== "other" && platform === activeTab && (
                  <p className="mt-2 text-[0.65rem] font-medium text-emerald-700">
                    Сіздің құрылғыңыз үшін ұсынылған нұсқаулық
                  </p>
                )}

                <ol className="mt-2 space-y-2.5">
                  {steps.map((step, index) => (
                    <li key={step.title} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[0.65rem] font-bold text-sky-800">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-[0.65rem] leading-relaxed text-slate-500">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <button
                  type="button"
                  onClick={dismiss}
                  className="touch-target mt-3 w-full rounded-lg bg-sky-700 px-3 py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] hover:bg-sky-800"
                >
                  Түсінікті, жабу
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

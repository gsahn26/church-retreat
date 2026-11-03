"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore, type QtTopic } from "@/lib/store";
import { t, type TranslationKey } from "@/lib/i18n";

const PAUSE_SECONDS = 5;
const TOTAL_STEPS = 3;

const TOPICS: {
  id: QtTopic;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  { id: "thanks", titleKey: "qtTopicThanks", descKey: "qtTopicThanksDesc" },
  { id: "repent", titleKey: "qtTopicRepent", descKey: "qtTopicRepentDesc" },
  { id: "intercede", titleKey: "qtTopicIntercede", descKey: "qtTopicIntercedeDesc" },
  { id: "heal", titleKey: "qtTopicHeal", descKey: "qtTopicHealDesc" },
];

const STEP_KEYS: Record<QtTopic, { titleKey: TranslationKey; bodyKey: TranslationKey }[]> = {
  thanks: [
    { titleKey: "qtThanks1Title", bodyKey: "qtThanks1Body" },
    { titleKey: "qtThanks2Title", bodyKey: "qtThanks2Body" },
    { titleKey: "qtThanks3Title", bodyKey: "qtThanks3Body" },
  ],
  repent: [
    { titleKey: "qtRepent1Title", bodyKey: "qtRepent1Body" },
    { titleKey: "qtRepent2Title", bodyKey: "qtRepent2Body" },
    { titleKey: "qtRepent3Title", bodyKey: "qtRepent3Body" },
  ],
  intercede: [
    { titleKey: "qtIntercede1Title", bodyKey: "qtIntercede1Body" },
    { titleKey: "qtIntercede2Title", bodyKey: "qtIntercede2Body" },
    { titleKey: "qtIntercede3Title", bodyKey: "qtIntercede3Body" },
  ],
  heal: [
    { titleKey: "qtHeal1Title", bodyKey: "qtHeal1Body" },
    { titleKey: "qtHeal2Title", bodyKey: "qtHeal2Body" },
    { titleKey: "qtHeal3Title", bodyKey: "qtHeal3Body" },
  ],
};

export default function QTModal() {
  const locale = useAppStore((s) => s.locale);
  const qtOpen = useAppStore((s) => s.qtOpen);
  const qtTopic = useAppStore((s) => s.qtTopic);
  const qtStep = useAppStore((s) => s.qtStep);
  const qtPauseEnabled = useAppStore((s) => s.qtPauseEnabled);
  const pickQtTopic = useAppStore((s) => s.pickQtTopic);
  const setQtPauseEnabled = useAppStore((s) => s.setQtPauseEnabled);
  const qtNext = useAppStore((s) => s.qtNext);
  const qtPrev = useAppStore((s) => s.qtPrev);
  const resetQt = useAppStore((s) => s.resetQt);
  const closeQt = useAppStore((s) => s.closeQt);

  const [selected, setSelected] = useState<QtTopic>("thanks");
  const [pauseLeft, setPauseLeft] = useState(0);
  const lastActionRef = useRef(0);

  function guarded(fn: () => void) {
    const now = Date.now();
    if (now - lastActionRef.current < 400) return;
    lastActionRef.current = now;
    fn();
  }

  useEffect(() => {
    if (!qtTopic || qtStep >= TOTAL_STEPS || !qtPauseEnabled) {
      setPauseLeft(0);
      return;
    }
    setPauseLeft(PAUSE_SECONDS);
    const id = setInterval(() => {
      setPauseLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [qtTopic, qtStep, qtPauseEnabled]);

  if (!qtOpen) return null;

  // --- topic picker ---
  if (!qtTopic) {
    return (
      <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 p-4">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-amber-200/20 bg-stone-900/95 p-6 text-amber-50">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t(locale, "qtPickTitle")}</h2>
            <button
              onClick={closeQt}
              aria-label={t(locale, "close")}
              className="rounded-full px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mb-5 flex flex-col gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelected(topic.id)}
                className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition ${
                  selected === topic.id
                    ? "border-amber-300 bg-amber-400/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <span className="font-medium">{t(locale, topic.titleKey)}</span>
                <span className="mt-0.5 text-xs text-amber-100/60">
                  {t(locale, topic.descKey)}
                </span>
              </button>
            ))}
          </div>

          <label className="mb-5 flex items-center gap-2 text-sm text-amber-100/70">
            <input
              type="checkbox"
              checked={qtPauseEnabled}
              onChange={(e) => setQtPauseEnabled(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            {t(locale, "qtPauseOption")}
          </label>

          <button
            onClick={() => pickQtTopic(selected)}
            className="w-full rounded-lg bg-amber-400 py-3 font-semibold text-stone-900 transition hover:bg-amber-300"
          >
            {t(locale, "qtStart")}
          </button>
        </div>
      </div>
    );
  }

  // --- amen / finish screen ---
  if (qtStep >= TOTAL_STEPS) {
    return (
      <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-amber-200/20 bg-stone-900/95 p-8 text-center text-amber-50">
          <div className="text-4xl">🕊️</div>
          <h2 className="text-xl font-semibold">{t(locale, "qtAmenTitle")}</h2>
          <p className="text-sm leading-relaxed text-amber-100/70">
            {t(locale, "qtAmenBody")}
          </p>
          <button
            onClick={() => {
              resetQt();
              closeQt();
            }}
            className="mt-2 w-full rounded-lg bg-amber-400 py-3 font-semibold text-stone-900 transition hover:bg-amber-300"
          >
            {t(locale, "qtFinish")}
          </button>
        </div>
      </div>
    );
  }

  // --- guided step ---
  const steps = STEP_KEYS[qtTopic];
  const step = steps[qtStep];
  const waiting = qtPauseEnabled && pauseLeft > 0;

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-amber-200/20 bg-stone-900/95 p-8 text-center text-amber-50">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition ${
                i <= qtStep ? "bg-amber-400" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <span className="text-xs uppercase tracking-wide text-amber-100/50">
          {t(locale, "qtStepOf")} {qtStep + 1} / {steps.length}
        </span>

        <h2 className="text-xl font-semibold">{t(locale, step.titleKey)}</h2>
        <p className="text-sm leading-relaxed text-amber-100/80">
          {t(locale, step.bodyKey)}
        </p>

        {waiting && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div
              className="h-14 w-14 rounded-full border-2 border-amber-300/70"
              style={{
                animation: "qt-breathe 4s ease-in-out infinite",
              }}
            />
            <p className="text-xs text-amber-100/50">
              {t(locale, "qtPauseHint")} ({pauseLeft})
            </p>
          </div>
        )}

        <div className="mt-1 flex w-full gap-3">
          {qtStep > 0 && (
            <button
              onClick={() => guarded(qtPrev)}
              className="flex-1 rounded-lg border border-white/15 py-3 text-sm text-white/70 transition hover:bg-white/5"
            >
              {t(locale, "qtPrev")}
            </button>
          )}
          <button
            onClick={() => guarded(() => qtNext(TOTAL_STEPS))}
            disabled={waiting}
            className="flex-1 rounded-lg bg-amber-400 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {qtStep === steps.length - 1 ? t(locale, "qtAmenTitle") : t(locale, "qtNext")}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes qt-breathe {
          0%,
          100% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

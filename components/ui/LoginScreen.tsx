"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { LOCALES, t } from "@/lib/i18n";

export default function LoginScreen() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const setNickname = useAppStore((s) => s.setNickname);
  const enter = useAppStore((s) => s.enter);
  const enterAndOpenQt = useAppStore((s) => s.enterAndOpenQt);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const validate = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(true);
      return null;
    }
    return trimmed;
  };

  const handleEnter = () => {
    const trimmed = validate();
    if (!trimmed) return;
    setNickname(trimmed);
    enter();
  };

  const handleEnterAndPray = () => {
    const trimmed = validate();
    if (!trimmed) return;
    setNickname(trimmed);
    enterAndOpenQt();
  };

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden bg-gradient-to-b from-[#1c2a3a] via-[#283b4f] to-[#101823]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_50%_0%,rgba(255,210,150,0.4),transparent_60%)]" />

      <div className="absolute top-6 right-6 flex gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              locale === l.code
                ? "bg-amber-400 text-stone-900 font-semibold"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative z-10 flex w-[90%] max-w-sm flex-col items-center gap-6 rounded-2xl border border-amber-200/20 bg-black/30 p-8 backdrop-blur-sm">
        <div className="text-5xl">🕊️</div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-amber-100">
            {t(locale, "title")}
          </h1>
          <p className="mt-2 text-sm text-amber-100/60">
            {t(locale, "subtitle")}
          </p>
        </div>

        <div className="w-full">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            placeholder={t(locale, "nicknamePlaceholder")}
            maxLength={12}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-center text-amber-50 placeholder:text-white/30 outline-none focus:border-amber-300"
          />
          {error && (
            <p className="mt-2 text-center text-xs text-red-300">
              {t(locale, "nicknameRequired")}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <button
            onClick={handleEnter}
            className="w-full rounded-lg bg-amber-400 py-3 font-semibold text-stone-900 transition hover:bg-amber-300"
          >
            {t(locale, "enter")}
          </button>
          <button
            onClick={handleEnterAndPray}
            className="w-full rounded-lg border border-amber-200/30 py-3 font-semibold text-amber-100 transition hover:bg-white/10"
          >
            {t(locale, "enterAndPray")}
          </button>
        </div>

        <p className="text-center text-xs text-amber-100/40">
          {t(locale, "moveHint")}
        </p>
        <p className="text-center text-[11px] leading-relaxed text-amber-100/30">
          {t(locale, "disclaimer")}
        </p>
      </div>
    </div>
  );
}

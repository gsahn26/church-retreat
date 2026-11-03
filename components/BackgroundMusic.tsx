"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { createHymnPlayer, type HymnPlayer } from "@/lib/music";
import { t } from "@/lib/i18n";

export default function BackgroundMusic() {
  const musicOn = useAppStore((s) => s.musicOn);
  const toggleMusic = useAppStore((s) => s.toggleMusic);
  const locale = useAppStore((s) => s.locale);
  const playerRef = useRef<HymnPlayer | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = createHymnPlayer();
    }
    if (musicOn) {
      playerRef.current.start();
    } else {
      playerRef.current.stop();
    }
  }, [musicOn]);

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-pressed={musicOn}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/50 px-4 py-2.5 text-xs font-medium text-amber-50 backdrop-blur-sm transition hover:bg-black/65"
    >
      <span aria-hidden="true">{musicOn ? "🔊" : "🔈"}</span>
      {t(locale, "musicToggle")}
    </button>
  );
}

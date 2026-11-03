"use client";

import { useAppStore, type OutfitColor, type HairStyle } from "@/lib/store";
import { t } from "@/lib/i18n";

const OUTFITS: { id: OutfitColor; swatch: string }[] = [
  { id: "charcoal", swatch: "#3a3a3f" },
  { id: "navy", swatch: "#273a5c" },
  { id: "burgundy", swatch: "#6b2e3a" },
  { id: "cream", swatch: "#e8e0cc" },
];

const HAIRS: { id: HairStyle; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "bald", label: "Bald" },
  { id: "long", label: "Long" },
];

export default function CustomizePanel() {
  const locale = useAppStore((s) => s.locale);
  const outfit = useAppStore((s) => s.outfit);
  const hair = useAppStore((s) => s.hair);
  const setOutfit = useAppStore((s) => s.setOutfit);
  const setHair = useAppStore((s) => s.setHair);
  const setCustomizeOpen = useAppStore((s) => s.setCustomizeOpen);

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-2xl border border-white/10 bg-stone-900/95 p-6 text-amber-50">
        <h2 className="mb-4 text-lg font-semibold">{t(locale, "customize")}</h2>

        <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
          {t(locale, "outfit")}
        </p>
        <div className="mb-5 flex gap-3">
          {OUTFITS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOutfit(o.id)}
              className={`h-9 w-9 rounded-full border-2 transition ${
                outfit === o.id ? "border-amber-300 scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: o.swatch }}
            />
          ))}
        </div>

        <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
          {t(locale, "hair")}
        </p>
        <div className="mb-6 flex gap-2">
          {HAIRS.map((h) => (
            <button
              key={h.id}
              onClick={() => setHair(h.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                hair === h.id
                  ? "bg-amber-400 text-stone-900 font-semibold"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCustomizeOpen(false)}
          className="w-full rounded-lg bg-amber-400 py-2 font-semibold text-stone-900 hover:bg-amber-300"
        >
          {t(locale, "close")}
        </button>
      </div>
    </div>
  );
}

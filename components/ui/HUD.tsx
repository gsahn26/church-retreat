"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { LOCALES, t } from "@/lib/i18n";
import CustomizePanel from "./CustomizePanel";
import QTModal from "./QTModal";
import VisitorsPanel from "./VisitorsPanel";
import LiveWorshipPanel from "./LiveWorshipPanel";

const ZONE_KEY = {
  courtyard: "zoneCourtyard",
  hall: "zoneHall",
  room: "zoneRoom",
  home: "zoneHome",
} as const;

const ACTIVITY_MESSAGE = {
  praying: "praying",
  resting: "resting",
  gardening: "gardening",
  sitting: "sitting",
} as const;

const INTERACT_HINT = {
  praying: "interactPray",
  resting: "interactRest",
  gardening: "interactGarden",
  sitting: "interactSit",
} as const;

export default function HUD() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const nickname = useAppStore((s) => s.nickname);
  const currentZone = useAppStore((s) => s.currentZone);
  const activity = useAppStore((s) => s.activity);
  const nearbyActivity = useAppStore((s) => s.nearbyActivity);
  const customizeOpen = useAppStore((s) => s.customizeOpen);
  const setCustomizeOpen = useAppStore((s) => s.setCustomizeOpen);
  const qtOpen = useAppStore((s) => s.qtOpen);
  const openQt = useAppStore((s) => s.openQt);
  const visitorsOpen = useAppStore((s) => s.visitorsOpen);
  const setVisitorsOpen = useAppStore((s) => s.setVisitorsOpen);
  const liveWorshipOpen = useAppStore((s) => s.liveWorshipOpen);
  const setLiveWorshipOpen = useAppStore((s) => s.setLiveWorshipOpen);

  const anyModalOpen = customizeOpen || qtOpen || visitorsOpen || liveWorshipOpen;

  // 선택창(모달)이 뜨면 마우스 포인터 잠금을 풀어서 커서가 바로 보이고 클릭할 수 있게 한다.
  useEffect(() => {
    if (anyModalOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [anyModalOpen]);

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* top bar */}
      <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-3 rounded-full bg-black/40 px-4 py-2 text-sm text-amber-50 backdrop-blur-sm">
        <span className="font-medium">
          {nickname}
          {t(locale, "welcome")}
        </span>
        <span className="h-4 w-px bg-white/20" />
        <span>{t(locale, ZONE_KEY[currentZone])}</span>
      </div>

      <div className="pointer-events-auto absolute top-4 right-4 flex flex-wrap justify-end gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              locale === l.code
                ? "bg-amber-400 text-stone-900 font-semibold"
                : "bg-black/30 text-white/70 hover:bg-black/50"
            }`}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={openQt}
          className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-stone-900 hover:bg-amber-300"
        >
          {t(locale, "qtButton")}
        </button>
        <button
          onClick={() => setLiveWorshipOpen(true)}
          className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80 hover:bg-black/50"
        >
          {t(locale, "liveWorshipButton")}
        </button>
        <button
          onClick={() => setCustomizeOpen(true)}
          className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80 hover:bg-black/50"
        >
          {t(locale, "customize")}
        </button>
        <button
          onClick={() => setVisitorsOpen(true)}
          className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/80 hover:bg-black/50"
        >
          {t(locale, "visitorsButton")}
        </button>
      </div>

      {/* bottom hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-white/70">
        {activity === "praying"
          ? t(locale, "praying")
          : activity
          ? `${t(locale, ACTIVITY_MESSAGE[activity])} · ${t(locale, "interactStandUp")}`
          : nearbyActivity
          ? t(locale, INTERACT_HINT[nearbyActivity])
          : t(locale, "exitPointerLock")}
      </div>

      {/* crosshair-ish center marker */}
      {!activity && (
        <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50" />
      )}

      {customizeOpen && <CustomizePanel />}
      {qtOpen && <QTModal />}
      {visitorsOpen && <VisitorsPanel />}
      {liveWorshipOpen && <LiveWorshipPanel />}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getOnlineVisitors, getVisitHistory } from "@/lib/visits";
import { describeError } from "@/lib/errors";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function VisitorsPanel() {
  const locale = useAppStore((s) => s.locale);
  const nickname = useAppStore((s) => s.nickname);
  const setVisitorsOpen = useAppStore((s) => s.setVisitorsOpen);
  const onlineVisitors = useAppStore((s) => s.onlineVisitors);

  interface OnlineRow {
    session_id: string;
    nickname: string;
    last_seen: string;
  }
  interface HistoryRow {
    id: number;
    visited_at: string;
  }

  const [online, setOnline] = useState<OnlineRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // Live roster from the Realtime channel is authoritative; the Postgres rows
  // (90s heartbeat window) are only a fallback for the first moment before the
  // channel reports in. Relying on the table alone left closed tabs listed as
  // online for well over a minute.
  const liveRoster = onlineVisitors.length > 0;
  const rows = liveRoster
    ? [...onlineVisitors]
        .sort((a, b) => a.nickname.localeCompare(b.nickname, "ko"))
        .map((v) => ({ id: v.sessionId, nickname: v.nickname, lastSeen: null as string | null }))
    : online.map((row) => ({
        id: row.session_id,
        nickname: row.nickname,
        lastSeen: row.last_seen as string | null,
      }));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [onlineRows, historyRows] = await Promise.all([
          getOnlineVisitors(),
          getVisitHistory(nickname),
        ]);
        if (!cancelled) {
          setOnline(onlineRows);
          setHistory(historyRows);
          setLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(describeError(err));
          setLoaded(true);
        }
      }
    }

    load();
    const id = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [nickname]);

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-amber-200/20 bg-stone-900/95 p-6 text-amber-50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t(locale, "visitorsTitle")}</h2>
          <button
            onClick={() => setVisitorsOpen(false)}
            aria-label={t(locale, "close")}
            className="rounded-full px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-950/60 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        {!loaded && !error && !liveRoster && (
          <p className="text-sm text-amber-100/50">{t(locale, "loading")}</p>
        )}

        {(loaded || liveRoster) && (
          <>
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-200/60">
                {t(locale, "onlineNow")} ({rows.length})
              </h3>
              {rows.length === 0 ? (
                <p className="text-sm text-amber-100/40">{t(locale, "noOneOnline")}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        {row.nickname}
                        {row.nickname === nickname && (
                          <span className="text-xs text-amber-200/50">
                            ({t(locale, "meLabel")})
                          </span>
                        )}
                      </span>
                      {row.lastSeen && (
                        <span className="text-xs text-amber-100/40">
                          {formatTime(row.lastSeen)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {loaded && (
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-200/60">
                  {t(locale, "myHistory")} ({nickname})
                </h3>
                {history.length === 0 ? (
                  <p className="text-sm text-amber-100/40">{t(locale, "noHistory")}</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {history.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-lg bg-white/5 px-3 py-2 text-sm text-amber-100/80"
                      >
                        {formatTime(row.visited_at)}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

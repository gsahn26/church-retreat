"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { sendChatMessage, getRecentChatMessages, subscribeToChat } from "@/lib/chat";
import { describeError } from "@/lib/errors";

interface ChatRow {
  id: number;
  nickname: string;
  message: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveWorshipPanel() {
  const locale = useAppStore((s) => s.locale);
  const nickname = useAppStore((s) => s.nickname);
  const setLiveWorshipOpen = useAppStore((s) => s.setLiveWorshipOpen);

  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    getRecentChatMessages()
      .then((rows) => {
        if (!cancelled) setMessages(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(describeError(err));
        }
      });

    const unsubscribe = subscribeToChat((row: ChatRow) => {
      setMessages((prev) => [...prev, row]);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await sendChatMessage(nickname, text);
    } catch (err) {
      setError(describeError(err));
    }
  }

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-200/20 bg-stone-900/95 text-amber-50">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold">{t(locale, "liveWorshipTitle")}</h2>
          <button
            onClick={() => setLiveWorshipOpen(false)}
            aria-label={t(locale, "close")}
            className="rounded-full px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-4">
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-black/40 p-4 text-center">
            <span className="text-3xl">📺</span>
            <p className="text-sm text-amber-100/70">{t(locale, "liveWorshipBody")}</p>
            <a
              href="https://www.mokyang4.org"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 no-underline hover:bg-amber-300"
            >
              {t(locale, "liveWorshipOpenSite")}
            </a>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-6 py-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-200/60">
            {t(locale, "liveChatTitle")}
          </h3>

          {error && (
            <p className="mb-2 rounded-lg bg-red-950/60 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div
            ref={listRef}
            className="mb-3 flex max-h-56 min-h-[6rem] flex-1 flex-col gap-1.5 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-amber-100/40">{t(locale, "liveChatEmpty")}</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span className="font-semibold">{m.nickname}</span>{" "}
                  <span className="text-amber-100/80">{m.message}</span>{" "}
                  <span className="text-[10px] text-amber-100/30">
                    {formatTime(m.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              {t(locale, "liveChatPlaceholder")}
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(locale, "liveChatPlaceholder")}
              maxLength={200}
              className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-amber-50 placeholder:text-white/30 outline-none focus:border-amber-300"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-stone-900 hover:bg-amber-300"
            >
              {t(locale, "liveChatSend")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

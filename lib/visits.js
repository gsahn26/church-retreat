import { supabase } from "./supabaseClient";

// A visitor is identified by a random id kept in this browser's sessionStorage
// (there is no login in this app yet — see PRD.md "의도적으로 뺀 것").
export function getSessionId() {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.sessionStorage.getItem("church_session_id");
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem("church_session_id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

// Create: log one visit event.
export async function logVisit(nickname) {
  const { error } = await supabase
    .from("church_visits")
    .insert({ nickname, session_id: getSessionId() });
  if (error) throw error;
}

// Create/Update: mark this session as currently present.
export async function heartbeatPresence(nickname) {
  const { error } = await supabase.from("church_presence").upsert(
    {
      session_id: getSessionId(),
      nickname,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );
  if (error) throw error;
}

// Read: who is currently online (seen in the last 90 seconds).
export async function getOnlineVisitors() {
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  const { data, error } = await supabase
    .from("church_presence")
    .select("session_id, nickname, last_seen")
    .gte("last_seen", cutoff)
    .order("last_seen", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Read: this nickname's own visit history, most recent first.
export async function getVisitHistory(nickname, limit = 20) {
  const { data, error } = await supabase
    .from("church_visits")
    .select("id, visited_at")
    .eq("nickname", nickname)
    .order("visited_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

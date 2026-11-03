import { supabase } from "./supabaseClient";

const MAX_MESSAGE_LENGTH = 200;

export async function sendChatMessage(nickname, message) {
  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return;
  const { error } = await supabase
    .from("church_chat")
    .insert({ nickname, message: trimmed });
  if (error) throw error;
}

export async function getRecentChatMessages(limit = 50) {
  const { data, error } = await supabase
    .from("church_chat")
    .select("id, nickname, message, created_at")
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// Subscribes to new chat rows in real time. Returns an unsubscribe function.
export function subscribeToChat(onInsert) {
  const channel = supabase
    .channel("church_chat_live")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "church_chat" },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

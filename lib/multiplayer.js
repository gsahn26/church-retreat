import { supabase } from "./supabaseClient";

// Ephemeral "who is in the world right now" channel.
//
// Presence carries only the roster (nickname, outfit, hair and a starting
// position) and is written once per join. Positions are streamed as broadcast
// messages instead: Supabase's free plan allows ~20 presence messages/second
// for the whole project but ~100 broadcast messages/second, and presence
// updates would burn that budget after a handful of moving visitors.
//
// Nothing is stored in Postgres - when a tab closes, its presence entry
// disappears automatically.
const CHANNEL_NAME = "church_world";

/**
 * @param {{
 *   sessionId: string,
 *   getSnapshot: () => { nickname: string, outfit: string, hair: string, activity: string | null, x: number, z: number, yaw: number },
 *   onRoster: (players: Array<{ sessionId: string, nickname: string, outfit: string, hair: string, x: number, z: number, yaw: number }>) => void,
 *   onMove: (state: { sessionId: string, x: number, z: number, yaw: number, activity: string | null }) => void,
 * }} options
 */
export function joinWorld({ sessionId, getSnapshot, onRoster, onMove }) {
  const channel = supabase.channel(CHANNEL_NAME, {
    config: {
      presence: { key: sessionId },
      broadcast: { self: false },
    },
  });

  let closed = false;

  const publishRoster = () => {
    if (closed) return;
    const state = channel.presenceState();
    const players = [];
    for (const [key, metas] of Object.entries(state)) {
      const meta = metas && metas[0];
      if (!meta) continue;
      players.push({
        sessionId: key,
        nickname: meta.nickname,
        outfit: meta.outfit,
        hair: meta.hair,
        x: meta.x ?? 0,
        z: meta.z ?? 8,
        yaw: meta.yaw ?? 0,
      });
    }
    onRoster(players);
  };

  channel
    .on("presence", { event: "sync" }, publishRoster)
    .on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload?.sessionId) onMove(payload);
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED" && !closed) {
        // Track once: the roster + the position at join time. Later positions
        // arrive through broadcast, so presence stays well under its limit.
        channel.track(getSnapshot()).catch(() => {});
      }
    });

  return {
    sendState() {
      if (closed) return;
      channel
        .send({
          type: "broadcast",
          event: "state",
          payload: { sessionId, ...getSnapshot() },
        })
        .catch(() => {});
    },
    leave() {
      closed = true;
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
    },
  };
}

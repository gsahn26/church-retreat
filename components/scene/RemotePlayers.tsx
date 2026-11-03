"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import Character from "./Character";
import type { ActivityId, HairStyle, OutfitColor } from "@/lib/store";

export interface RemotePlayer {
  sessionId: string;
  nickname: string;
  outfit?: OutfitColor;
  hair?: HairStyle;
  x: number;
  z: number;
  yaw: number;
}

export interface RemoteTarget {
  x: number;
  z: number;
  yaw: number;
  activity: ActivityId;
  at: number;
}

interface RemotePlayersProps {
  players: RemotePlayer[];
  targets: React.RefObject<Map<string, RemoteTarget>>;
}

// Positions arrive ~4 times per second; easing towards the latest target keeps
// other visitors looking like they walk instead of teleporting.
const SNAP_DISTANCE = 6;
const SMOOTHING = 0.001; // fraction of the gap left after one second

function RemoteAvatar({
  player,
  targets,
}: {
  player: RemotePlayer;
  targets: React.RefObject<Map<string, RemoteTarget>>;
}) {
  const group = useRef<THREE.Group>(null);
  const placed = useRef(false);
  const [activity, setActivity] = useState<ActivityId>(null);

  useFrame((_, delta) => {
    const target = targets.current?.get(player.sessionId);
    const g = group.current;
    if (!target || !g) return;

    if (!placed.current) {
      g.position.set(target.x, 0, target.z);
      g.rotation.y = target.yaw + Math.PI;
      placed.current = true;
    } else if (Math.hypot(target.x - g.position.x, target.z - g.position.z) > SNAP_DISTANCE) {
      g.position.set(target.x, 0, target.z);
    } else {
      const t = 1 - Math.pow(SMOOTHING, delta);
      g.position.x += (target.x - g.position.x) * t;
      g.position.z += (target.z - g.position.z) * t;
    }

    // Shortest-path yaw easing, so a 179° -> -179° turn does not spin around.
    const wanted = target.yaw + Math.PI;
    let diff = wanted - g.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.rotation.y += diff * Math.min(1, delta * 12);

    if (target.activity !== activity) setActivity(target.activity);
  });

  return (
    <group ref={group}>
      <Character
        outfit={player.outfit ?? "charcoal"}
        hair={player.hair ?? "short"}
        lying={activity === "resting"}
        sitting={activity === "sitting"}
      />
      <Html
        position={[0, 2.05, 0]}
        center
        distanceFactor={12}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="whitespace-nowrap rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-amber-50 backdrop-blur-sm">
          {player.nickname}
        </div>
      </Html>
    </group>
  );
}

export default function RemotePlayers({ players, targets }: RemotePlayersProps) {
  return (
    <>
      {players.map((player) => (
        <RemoteAvatar key={player.sessionId} player={player} targets={targets} />
      ))}
    </>
  );
}

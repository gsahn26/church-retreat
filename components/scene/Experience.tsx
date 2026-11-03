"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Character from "./Character";
import ChurchStructures from "./ChurchStructures";
import RemotePlayers, { type RemotePlayer, type RemoteTarget } from "./RemotePlayers";
import { useKeyboard } from "@/hooks/useKeyboard";
import { usePointerLock } from "@/hooks/usePointerLock";
import { joinWorld } from "@/lib/multiplayer";
import { getSessionId } from "@/lib/visits";
import { useAppStore } from "@/lib/store";
import type { ActivityId, HairStyle, OutfitColor } from "@/lib/store";
import { touchInput } from "@/lib/touchInput";
import {
  INTERACTION_POINTS,
  WORLD_BOUNDS,
  distanceXZ,
  getZoneAt,
  isPointInsideSolids,
  resolveCollisions,
} from "@/lib/world";

const MOVE_SPEED = 4.2;
// Max distance covered per collision pass. Must stay well under the wall
// thickness (0.6) / character radius (0.32) so a step can never cross a wall.
const MAX_MOVE_STEP = 0.08;
const CAMERA_DISTANCE = 4.5;
const CAMERA_HEIGHT = 1.4;

// Multiplayer tuning. ~4 updates/second stays smooth with interpolation and
// keeps us far below Supabase's 100 broadcast messages/second free-plan limit.
const SEND_INTERVAL_MS = 250;
const IDLE_RESEND_MS = 8000;
const MOVE_EPSILON = 0.03;
const YAW_EPSILON = 0.05;
const REMOTE_STALE_MS = 12000;
const MAX_REMOTE_PLAYERS = 20;

interface NetClient {
  sendState: () => void;
  leave: () => void;
}

export default function Experience() {
  const { gl } = useThree();
  const keyboard = useKeyboard();
  const { look } = usePointerLock(gl.domElement);

  const characterRef = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3(0, 0, 8));
  const velocity = useRef(new THREE.Vector3());

  // --- multiplayer -------------------------------------------------------
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const remotePlayersRef = useRef<RemotePlayer[]>([]);
  const remoteTargets = useRef<Map<string, RemoteTarget>>(new Map());
  const netRef = useRef<NetClient | null>(null);
  const lastSentRef = useRef({ at: 0, x: 0, z: 8, yaw: 0, activity: null as string | null });
  const forceSendRef = useRef(false);

  const outfit = useAppStore((s) => s.outfit);
  const hair = useAppStore((s) => s.hair);
  const activity = useAppStore((s) => s.activity);

  useEffect(() => {
    const sessionId = getSessionId();

    const client = joinWorld({
      sessionId,
      getSnapshot: () => {
        // Read straight from the store so the payload is always current
        // without re-subscribing on every outfit/activity change.
        const self = useAppStore.getState();
        return {
          nickname: self.nickname,
          outfit: self.outfit,
          hair: self.hair,
          activity: self.activity,
          x: position.current.x,
          z: position.current.z,
          yaw: look.current.yaw,
        };
      },
      onRoster: (players) => {
        const others: RemotePlayer[] = players
          .filter((p) => p.sessionId !== sessionId)
          .slice(0, MAX_REMOTE_PLAYERS)
          .map((p) => ({
            sessionId: p.sessionId,
            nickname: p.nickname || "익명",
            outfit: p.outfit as OutfitColor | undefined,
            hair: p.hair as HairStyle | undefined,
            x: p.x,
            z: p.z,
            yaw: p.yaw,
          }));
        for (const p of others) {
          // Seed anyone we have not heard a position from yet with the spot
          // they were standing on when they joined.
          if (!remoteTargets.current.has(p.sessionId)) {
            remoteTargets.current.set(p.sessionId, {
              x: p.x,
              z: p.z,
              yaw: p.yaw,
              activity: null,
              at: Date.now(),
            });
          }
        }
        if (others.length !== remotePlayersRef.current.length) {
          // Someone joined: push our position right away so they see us
          // instead of waiting for our next idle heartbeat.
          forceSendRef.current = true;
        }
        remotePlayersRef.current = others;
        setRemotePlayers(others);
        // The 접속자 panel reads this instead of polling Postgres, so people
        // disappear the moment their presence entry disappears.
        useAppStore.getState().setOnlineVisitors(
          players.map((p) => ({
            sessionId: p.sessionId,
            nickname: p.nickname || "익명",
          }))
        );
      },
      onMove: (state) => {
        remoteTargets.current.set(state.sessionId, {
          x: state.x,
          z: state.z,
          yaw: state.yaw,
          activity: (state.activity ?? null) as ActivityId,
          at: Date.now(),
        });
      },
    });

    netRef.current = client;
    return () => {
      client.leave();
      netRef.current = null;
      useAppStore.getState().setOnlineVisitors([]);
    };
  }, [look]);

  // Dev-only bridge: browser QA can read the player state and aim the camera
  // directly, since pointer lock is not available in headless runs.
  // Stripped from production builds by the NODE_ENV check.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__retreat = {
      getPlayer: () => ({
        x: position.current.x,
        y: position.current.y,
        z: position.current.z,
        yaw: look.current.yaw,
        pitch: look.current.pitch,
      }),
      setPlayer: (x: number, z: number, yaw?: number) => {
        position.current.set(x, 0, z);
        if (typeof yaw === "number") look.current.yaw = yaw;
      },
      setYaw: (yaw: number) => {
        look.current.yaw = yaw;
      },
      getRemotes: () =>
        Array.from(remoteTargets.current.entries()).map(([sessionId, target]) => ({
          sessionId,
          nickname:
            remotePlayersRef.current.find((p) => p.sessionId === sessionId)?.nickname ?? "",
          ...target,
        })),
      getRoster: () => remotePlayersRef.current.map((p) => p.nickname),
    };
  }, [look]);

  const setActivity = useAppStore((s) => s.setActivity);
  const setCurrentZone = useAppStore((s) => s.setCurrentZone);
  const setNearbyActivity = useAppStore((s) => s.setNearbyActivity);
  const openQt = useAppStore((s) => s.openQt);
  const closeQt = useAppStore((s) => s.closeQt);
  const qtOpen = useAppStore((s) => s.qtOpen);

  const interactPrevRef = useRef(false);
  const nearbyRef = useRef<string | null>(null);
  const lastPruneRef = useRef(0);

  useFrame((state, delta) => {
    const k = keyboard.current;
    const lying = activity === "resting";
    const seated = activity === "sitting";
    const frozen = lying || seated;

    if (!frozen) {
      const forwardVec = new THREE.Vector3(
        Math.sin(look.current.yaw),
        0,
        Math.cos(look.current.yaw)
      );
      const rightVec = new THREE.Vector3(
        Math.sin(look.current.yaw - Math.PI / 2),
        0,
        Math.cos(look.current.yaw - Math.PI / 2)
      );

      // keyboard (digital, -1/0/1) combined with the on-screen joystick
      // (analog, -1..1) so both input methods drive the same movement.
      const moveZ = THREE.MathUtils.clamp(
        (k.forward ? 1 : 0) - (k.backward ? 1 : 0) + touchInput.moveZ,
        -1,
        1
      );
      const moveX = THREE.MathUtils.clamp(
        (k.right ? 1 : 0) - (k.left ? 1 : 0) + touchInput.moveX,
        -1,
        1
      );

      velocity.current.set(0, 0, 0);
      velocity.current.addScaledVector(forwardVec, moveZ);
      velocity.current.addScaledVector(rightVec, moveX);

      if (velocity.current.lengthSq() > 0) {
        // Cap the frame delta and sub-step the movement: a single long frame
        // (tab switch, GC pause, low-end device) must not jump the player
        // across a wall before collision is resolved.
        velocity.current.normalize();
        const distance = MOVE_SPEED * Math.min(delta, 0.1);
        const steps = Math.max(1, Math.ceil(distance / MAX_MOVE_STEP));
        const stepDistance = distance / steps;
        for (let i = 0; i < steps; i++) {
          position.current.addScaledVector(velocity.current, stepDistance);
          position.current.x = THREE.MathUtils.clamp(
            position.current.x,
            WORLD_BOUNDS.minX,
            WORLD_BOUNDS.maxX
          );
          position.current.z = THREE.MathUtils.clamp(
            position.current.z,
            WORLD_BOUNDS.minZ,
            WORLD_BOUNDS.maxZ
          );
          resolveCollisions(position.current);
        }
      }
    }

    if (characterRef.current) {
      characterRef.current.position.copy(position.current);
      characterRef.current.rotation.y = look.current.yaw + Math.PI;
    }

    // --- stream our state to the other visitors -------------------------
    const now = performance.now();
    const sent = lastSentRef.current;
    const moved =
      Math.abs(position.current.x - sent.x) > MOVE_EPSILON ||
      Math.abs(position.current.z - sent.z) > MOVE_EPSILON;
    const turned =
      Math.abs(
        Math.atan2(
          Math.sin(look.current.yaw - sent.yaw),
          Math.cos(look.current.yaw - sent.yaw)
        )
      ) > YAW_EPSILON;
    if (
      now - sent.at > SEND_INTERVAL_MS &&
      (forceSendRef.current ||
        moved ||
        turned ||
        activity !== sent.activity ||
        now - sent.at > IDLE_RESEND_MS)
    ) {
      forceSendRef.current = false;
      lastSentRef.current = {
        at: now,
        x: position.current.x,
        z: position.current.z,
        yaw: look.current.yaw,
        activity,
      };
      netRef.current?.sendState();
    }

    // Drop players whose packets stopped arriving (closed tab, lost network).
    // Presence already removes them; this is just a safety net.
    if (now - lastPruneRef.current > 2000) {
      lastPruneRef.current = now;
      for (const [sessionId, target] of remoteTargets.current) {
        if (Date.now() - target.at > REMOTE_STALE_MS) {
          remoteTargets.current.delete(sessionId);
        }
      }
    }

    setCurrentZone(getZoneAt(position.current.x, position.current.z));

    // nearby interaction point
    let closest: "praying" | "resting" | "gardening" | "sitting" | null = null;
    for (const p of INTERACTION_POINTS) {
      if (distanceXZ(position.current, p.position) < p.radius) {
        closest = p.id;
        break;
      }
    }
    if (nearbyRef.current !== closest) {
      nearbyRef.current = closest;
      setNearbyActivity(closest);
    }

    // interact key (edge-triggered), keyboard E or the on-screen touch button
    const interactPressed = k.interact || touchInput.interact;
    if (interactPressed && !interactPrevRef.current) {
      if (qtOpen) {
        // closes the prayer modal; closeQt() returns to "sitting" if that's
        // the pose it was opened from, so E always means "one step back"
        closeQt();
      } else if (activity) {
        setActivity(null);
      } else if (closest === "praying") {
        openQt();
      } else if (closest) {
        setActivity(closest);
      }
    }
    interactPrevRef.current = interactPressed;

    // camera orbit around character
    const camOffset = new THREE.Vector3(
      Math.sin(look.current.yaw) * -CAMERA_DISTANCE * Math.cos(look.current.pitch),
      CAMERA_HEIGHT - Math.sin(look.current.pitch) * CAMERA_DISTANCE * -1,
      Math.cos(look.current.yaw) * -CAMERA_DISTANCE * Math.cos(look.current.pitch)
    );
    const camTarget = position.current.clone().add(new THREE.Vector3(0, 1.2, 0));
    // Pull the camera in along its own offset if a wall sits between it and
    // the character (e.g. sitting in a front pew near the sanctuary door),
    // so it never ends up clipped through geometry looking out from outside.
    let camT = 1;
    for (let t = 0.15; t <= 1; t += 0.1) {
      const testX = camTarget.x + camOffset.x * t;
      const testZ = camTarget.z + camOffset.z * t;
      if (isPointInsideSolids(testX, testZ)) {
        camT = Math.max(0.15, t - 0.15);
        break;
      }
    }
    const desiredCamPos = camTarget.clone().add(camOffset.clone().multiplyScalar(camT));
    state.camera.position.lerp(desiredCamPos, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(camTarget);
  });

  return (
    <>
      <fog attach="fog" args={["#bcd6ea", 20, 60]} />
      <color attach="background" args={["#8fc1e8"]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[12, 18, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 25, -25]} />
      </directionalLight>

      <ChurchStructures playerPosition={position} />

      <RemotePlayers players={remotePlayers} targets={remoteTargets} />

      <Character
        ref={characterRef}
        outfit={outfit}
        hair={hair}
        lying={activity === "resting"}
        sitting={activity === "sitting"}
      />
    </>
  );
}

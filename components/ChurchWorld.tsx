"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import Experience from "./scene/Experience";
import HUD from "./ui/HUD";
import { useAppStore } from "@/lib/store";
import { logVisit, heartbeatPresence } from "@/lib/visits";

const HEARTBEAT_MS = 20_000;

export default function ChurchWorld() {
  const nickname = useAppStore((s) => s.nickname);

  useEffect(() => {
    if (!nickname) return;
    logVisit(nickname).catch((err) => console.error("logVisit failed", err));
    heartbeatPresence(nickname).catch((err) =>
      console.error("heartbeatPresence failed", err)
    );
    const id = setInterval(() => {
      heartbeatPresence(nickname).catch((err) =>
        console.error("heartbeatPresence failed", err)
      );
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [nickname]);

  return (
    <div
      className="relative h-dvh w-dvw overflow-hidden bg-stone-800"
      style={{ touchAction: "none" }}
    >
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  );
}

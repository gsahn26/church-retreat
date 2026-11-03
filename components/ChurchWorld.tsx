"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./scene/Experience";
import HUD from "./ui/HUD";

export default function ChurchWorld() {
  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-stone-800">
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 200 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  );
}

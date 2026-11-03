"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Character from "./Character";
import ChurchStructures from "./ChurchStructures";
import { useKeyboard } from "@/hooks/useKeyboard";
import { usePointerLock } from "@/hooks/usePointerLock";
import { useAppStore } from "@/lib/store";
import { INTERACTION_POINTS, WORLD_BOUNDS, distanceXZ, getZoneAt } from "@/lib/world";

const MOVE_SPEED = 4.2;
const CAMERA_DISTANCE = 4.5;
const CAMERA_HEIGHT = 1.4;

export default function Experience() {
  const { gl } = useThree();
  const keyboard = useKeyboard();
  const { look } = usePointerLock(gl.domElement);

  const characterRef = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3(0, 0, 8));
  const velocity = useRef(new THREE.Vector3());

  const outfit = useAppStore((s) => s.outfit);
  const hair = useAppStore((s) => s.hair);
  const activity = useAppStore((s) => s.activity);
  const setActivity = useAppStore((s) => s.setActivity);
  const setCurrentZone = useAppStore((s) => s.setCurrentZone);
  const setNearbyActivity = useAppStore((s) => s.setNearbyActivity);
  const openQt = useAppStore((s) => s.openQt);
  const closeQt = useAppStore((s) => s.closeQt);

  const interactPrevRef = useRef(false);
  const nearbyRef = useRef<string | null>(null);

  useFrame((state, delta) => {
    const k = keyboard.current;
    const lying = activity === "resting";

    if (!lying) {
      const forwardVec = new THREE.Vector3(
        Math.sin(look.current.yaw),
        0,
        Math.cos(look.current.yaw)
      );
      const rightVec = new THREE.Vector3(
        Math.sin(look.current.yaw + Math.PI / 2),
        0,
        Math.cos(look.current.yaw + Math.PI / 2)
      );

      velocity.current.set(0, 0, 0);
      if (k.forward) velocity.current.add(forwardVec);
      if (k.backward) velocity.current.sub(forwardVec);
      if (k.left) velocity.current.sub(rightVec);
      if (k.right) velocity.current.add(rightVec);

      if (velocity.current.lengthSq() > 0) {
        velocity.current.normalize().multiplyScalar(MOVE_SPEED * delta);
        position.current.add(velocity.current);
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
      }
    }

    if (characterRef.current) {
      characterRef.current.position.copy(position.current);
      characterRef.current.rotation.y = look.current.yaw + Math.PI;
    }

    setCurrentZone(getZoneAt(position.current.x, position.current.z));

    // nearby interaction point
    let closest: "praying" | "resting" | "gardening" | null = null;
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

    // interact key (edge-triggered)
    if (k.interact && !interactPrevRef.current) {
      if (activity === "praying") {
        closeQt();
      } else if (activity) {
        setActivity(null);
      } else if (closest === "praying") {
        openQt();
      } else if (closest) {
        setActivity(closest);
      }
    }
    interactPrevRef.current = k.interact;

    // camera orbit around character
    const camOffset = new THREE.Vector3(
      Math.sin(look.current.yaw) * -CAMERA_DISTANCE * Math.cos(look.current.pitch),
      CAMERA_HEIGHT - Math.sin(look.current.pitch) * CAMERA_DISTANCE * -1,
      Math.cos(look.current.yaw) * -CAMERA_DISTANCE * Math.cos(look.current.pitch)
    );
    const camTarget = position.current.clone().add(new THREE.Vector3(0, 1.2, 0));
    const desiredCamPos = camTarget.clone().add(camOffset);
    state.camera.position.lerp(desiredCamPos, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(camTarget);
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[12, 18, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 25, -25]} />
      </directionalLight>
      <fog attach="fog" args={["#d7dcc9", 20, 55]} />
      <color attach="background" args={["#d7dcc9"]} />

      <ChurchStructures />

      <Character ref={characterRef} outfit={outfit} hair={hair} lying={activity === "resting"} />
    </group>
  );
}

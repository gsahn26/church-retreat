import * as THREE from "three";
import type { ZoneId, ActivityId } from "./store";

export interface InteractionPoint {
  id: NonNullable<ActivityId>;
  position: [number, number, number];
  radius: number;
  zone: ZoneId;
}

export const INTERACTION_POINTS: InteractionPoint[] = [
  { id: "praying", position: [0, 0, -17.5], radius: 2.2, zone: "hall" },
  { id: "resting", position: [10, 0, -5], radius: 1.8, zone: "room" },
  { id: "gardening", position: [-8, 0, 5], radius: 2, zone: "courtyard" },
];

interface ZoneBox {
  id: ZoneId;
  min: [number, number];
  max: [number, number];
}

const ZONE_BOXES: ZoneBox[] = [
  { id: "hall", min: [-5, -20], max: [5, -11] },
  { id: "room", min: [7.5, -7.5], max: [12.5, -2.5] },
  { id: "courtyard", min: [-20, -11], max: [20, 20] },
];

export function getZoneAt(x: number, z: number): ZoneId {
  for (const box of ZONE_BOXES) {
    if (x >= box.min[0] && x <= box.max[0] && z >= box.min[1] && z <= box.max[1]) {
      return box.id;
    }
  }
  return "courtyard";
}

export function distanceXZ(
  a: [number, number, number] | THREE.Vector3,
  b: [number, number, number]
): number {
  const ax = Array.isArray(a) ? a[0] : a.x;
  const az = Array.isArray(a) ? a[2] : a.z;
  const dx = ax - b[0];
  const dz = az - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export const WORLD_BOUNDS = { minX: -19, maxX: 19, minZ: -19.5, maxZ: 19 };

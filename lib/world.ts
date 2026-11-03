import * as THREE from "three";
import type { ZoneId, ActivityId } from "./store";

export interface InteractionPoint {
  id: NonNullable<ActivityId>;
  position: [number, number, number];
  radius: number;
  zone: ZoneId;
}

const PEW_ROWS_Z = [1.8, 0.3, -1.2, -2.7];
export const SANCTUARY_Z = -15;

// the sanctuary's courtyard-facing wall line, and the door set into it
const SANCTUARY_FRONT_Z = SANCTUARY_Z + 4.4;
export const SANCTUARY_DOOR = {
  x: 0,
  z: SANCTUARY_FRONT_Z,
  halfWidth: 1.3, // matches the centre aisle between the pews
  triggerRadius: 4, // opens well before the player can reach the frame
};

// one sit spot per pew bench (4 rows x 2 pews)
const PEW_SIT_POINTS: InteractionPoint[] = PEW_ROWS_Z.flatMap((rowZ) => [
  { id: "sitting" as const, position: [-2.6, 0, SANCTUARY_Z + rowZ] as [number, number, number], radius: 1.1, zone: "hall" as const },
  { id: "sitting" as const, position: [2.6, 0, SANCTUARY_Z + rowZ] as [number, number, number], radius: 1.1, zone: "hall" as const },
]);

export const INTERACTION_POINTS: InteractionPoint[] = [
  { id: "praying", position: [0, 0, -17.5], radius: 2.2, zone: "hall" },
  { id: "resting", position: [10, 0, -5], radius: 1.8, zone: "room" },
  { id: "gardening", position: [-8, 0, 5], radius: 2, zone: "courtyard" },
  ...PEW_SIT_POINTS,
];

interface ZoneBox {
  id: ZoneId;
  min: [number, number];
  max: [number, number];
}

const ZONE_BOXES: ZoneBox[] = [
  { id: "hall", min: [-5, -20], max: [5, -11] },
  { id: "room", min: [7.5, -7.5], max: [12.5, -2.5] },
  { id: "home", min: [12, 5.8], max: [20, 13] },
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

// Every indoor floor platform mesh in ChurchStructures sits above y=0 (the
// courtyard ground): the sanctuary's is centred at y=0.3 with height 0.6
// (top at 0.6), the quiet room's and the house's are centred at y=0.25 with
// height 0.5 (top at 0.5). The player's position has always stayed at y=0
// everywhere, so standing or sitting indoors actually meant standing/sitting
// at the *courtyard's* ground height - below the real floor by that much
// (most visible when sitting: a pew/chair seat built against its own local
// floor put the character well under the actual seat). Reusing the zone
// boxes (close enough to each room's real floor footprint) to pick the
// right height keeps this in one place instead of duplicating room shapes.
const ZONE_FLOOR_Y: Record<ZoneId, number> = {
  hall: 0.6,
  room: 0.5,
  home: 0.5,
  courtyard: 0,
};

export function getFloorY(x: number, z: number): number {
  return ZONE_FLOOR_Y[getZoneAt(x, z)];
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

export const WORLD_BOUNDS = { minX: -19, maxX: 24, minZ: -19.5, maxZ: 19 };

// --- collision -------------------------------------------------------

export interface SolidBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  // Only set on low furniture (pews/chairs, the altar table, the pulpit).
  // Player movement collision (resolveCollisions) ignores this and always
  // treats every box as floor-to-ceiling solid. The camera-pullback check
  // (isPointInsideSolids) uses it to let the chase camera pass *over* a
  // chair instead of yanking in close every time a turn swings it across
  // one - it only needs to avoid actual walls.
  maxY?: number;
}

function box(
  cx: number,
  cz: number,
  halfW: number,
  halfD: number,
  maxY?: number
): SolidBox {
  return { minX: cx - halfW, maxX: cx + halfW, minZ: cz - halfD, maxZ: cz + halfD, maxY };
}

const SANCTUARY_SOLIDS: SolidBox[] = [
  // back + side walls, plus the front wall split either side of the door
  box(0, SANCTUARY_Z - 4.4, 5.7, 0.3),
  box(-5.4, SANCTUARY_Z, 0.3, 4.6),
  box(5.4, SANCTUARY_Z, 0.3, 4.6),
  box(-3.2, SANCTUARY_FRONT_Z, 1.9, 0.3),
  box(3.2, SANCTUARY_FRONT_Z, 1.9, 0.3),
  // communion table + pulpit, so they read as solid furniture (maxY lets
  // the chase camera pass over these instead of treating them like walls)
  box(0, SANCTUARY_Z - 3.3, 1.3, 0.5, 1.6),
  box(-3.1, SANCTUARY_Z - 3, 0.45, 0.35, 1.2),
  // pew chairs: one box per row-spot (covers both chairs there)
  ...PEW_ROWS_Z.flatMap((rowZ) => [
    box(-2.6, SANCTUARY_Z + rowZ, 1.35, 0.3, 1.8),
    box(2.6, SANCTUARY_Z + rowZ, 1.35, 0.3, 1.8),
  ]),
];

const QUIET_ROOM_SOLIDS: SolidBox[] = [
  box(10, -5 - 2.8, 3.2, 0.3), // back wall (front, facing the garden, stays open)
  box(10 - 2.85, -5, 0.3, 3.2),
  box(10 + 2.85, -5, 0.3, 3.2),
];

// a small house east of the church courtyard; footprint x:[12.4,19.6] z:[5.8,12.2],
// with a 1.2-wide door gap centered on the south wall (x=16, z=5.8) so the
// player can walk in facing north from the courtyard.
export const HOME_SOLIDS: SolidBox[] = [
  box(16, 12.2, 3.6, 0.3), // north (back) wall
  box(12.4, 9, 0.3, 3.4), // west wall
  box(19.6, 9, 0.3, 3.4), // east wall
  box(13.9, 5.8, 1.5, 0.3), // south wall, left of the door
  box(18.1, 5.8, 1.5, 0.3), // south wall, right of the door
];

export const SOLID_BOXES: SolidBox[] = [
  ...SANCTUARY_SOLIDS,
  ...QUIET_ROOM_SOLIDS,
  ...HOME_SOLIDS,
];

export function isPointInsideSolids(x: number, z: number, y?: number): boolean {
  for (const b of SOLID_BOXES) {
    if (b.maxY !== undefined && y !== undefined && y > b.maxY) continue;
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) return true;
  }
  return false;
}

const CHARACTER_RADIUS = 0.32;

export function resolveCollisions(pos: THREE.Vector3) {
  for (const b of SOLID_BOXES) {
    const closestX = THREE.MathUtils.clamp(pos.x, b.minX, b.maxX);
    const closestZ = THREE.MathUtils.clamp(pos.z, b.minZ, b.maxZ);
    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq > 0) {
      if (distSq >= CHARACTER_RADIUS * CHARACTER_RADIUS) continue;
      const dist = Math.sqrt(distSq);
      const overlap = CHARACTER_RADIUS - dist;
      pos.x += (dx / dist) * overlap;
      pos.z += (dz / dist) * overlap;
      continue;
    }

    // The centre ended up inside the box (long frame, teleport, edge case).
    // The closest point is the centre itself, so there is no push direction:
    // eject along the shallowest axis instead of leaving the player inside.
    const outWest = pos.x - b.minX + CHARACTER_RADIUS;
    const outEast = b.maxX - pos.x + CHARACTER_RADIUS;
    const outNorth = pos.z - b.minZ + CHARACTER_RADIUS;
    const outSouth = b.maxZ - pos.z + CHARACTER_RADIUS;
    const smallest = Math.min(outWest, outEast, outNorth, outSouth);
    if (smallest === outWest) pos.x = b.minX - CHARACTER_RADIUS;
    else if (smallest === outEast) pos.x = b.maxX + CHARACTER_RADIUS;
    else if (smallest === outNorth) pos.z = b.minZ - CHARACTER_RADIUS;
    else pos.z = b.maxZ + CHARACTER_RADIUS;
  }
}

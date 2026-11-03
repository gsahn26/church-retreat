// Shared mutable input state written by the on-screen joystick/button
// (components/ui/MobileControls.tsx) and read every frame by the movement
// loop (components/scene/Experience.tsx). Plain singleton rather than
// zustand/React state on purpose: this is per-frame input, same pattern as
// the keyboard and pointer-look refs, and shouldn't trigger re-renders.
export const touchInput = {
  moveX: 0, // -1 (left) .. 1 (right)
  moveZ: 0, // -1 (back) .. 1 (forward)
  interact: false,
};

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

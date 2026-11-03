import { useEffect, useRef } from "react";

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
}

const KEY_MAP: Record<string, keyof KeyboardState> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyE: "interact",
};

export function useKeyboard() {
  const state = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.code];
      if (key) state.current[key] = true;
    };
    const up = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.code];
      if (key) state.current[key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return state;
}

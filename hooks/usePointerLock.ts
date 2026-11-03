import { useEffect, useRef, useState } from "react";

export interface LookState {
  yaw: number;
  pitch: number;
}

const PITCH_LIMIT = Math.PI / 2 - 0.1;

export function usePointerLock(domTarget: HTMLElement | null) {
  const look = useRef<LookState>({ yaw: 0, pitch: -0.25 });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!domTarget) return;

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== domTarget) return;
      look.current.yaw -= e.movementX * 0.0025;
      look.current.pitch -= e.movementY * 0.0025;
      look.current.pitch = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, look.current.pitch)
      );
    };

    const onClick = () => {
      if (document.pointerLockElement !== domTarget) {
        domTarget.requestPointerLock()?.catch(() => {
          // pointer lock can be refused (e.g. embedded iframe contexts) — movement still works via keyboard
        });
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {
            // fullscreen can be refused too — the game still works windowed
          });
        }
      }
    };

    const onLockChange = () => {
      setLocked(document.pointerLockElement === domTarget);
    };

    document.addEventListener("mousemove", onMouseMove);
    domTarget.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      domTarget.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, [domTarget]);

  return { look, locked };
}

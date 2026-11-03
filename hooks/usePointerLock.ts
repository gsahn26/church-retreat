import { useEffect, useRef, useState } from "react";

export interface LookState {
  yaw: number;
  pitch: number;
}

const PITCH_LIMIT = Math.PI / 2 - 0.1;
const TOUCH_LOOK_SENSITIVITY = 0.0045;

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

    // Touch-drag look (mobile): pointer lock isn't usable on touch screens,
    // so a one-finger drag directly on the canvas rotates the camera the
    // same way mouse movementX/Y does. Touches that start on an overlay
    // control (joystick, interact button) never reach the canvas as their
    // target, so this only ever sees "look" touches.
    let touchId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (touchId !== null) return;
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      lastX = touch.clientX;
      lastY = touch.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchId === null) return;
      const touch = Array.from(e.changedTouches).find(
        (t) => t.identifier === touchId
      );
      if (!touch) return;
      e.preventDefault();
      const dx = touch.clientX - lastX;
      const dy = touch.clientY - lastY;
      lastX = touch.clientX;
      lastY = touch.clientY;
      look.current.yaw -= dx * TOUCH_LOOK_SENSITIVITY;
      look.current.pitch -= dy * TOUCH_LOOK_SENSITIVITY;
      look.current.pitch = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, look.current.pitch)
      );
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchId === null) return;
      if (Array.from(e.changedTouches).some((t) => t.identifier === touchId)) {
        touchId = null;
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    domTarget.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    domTarget.addEventListener("touchstart", onTouchStart, { passive: true });
    domTarget.addEventListener("touchmove", onTouchMove, { passive: false });
    domTarget.addEventListener("touchend", onTouchEnd);
    domTarget.addEventListener("touchcancel", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      domTarget.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      domTarget.removeEventListener("touchstart", onTouchStart);
      domTarget.removeEventListener("touchmove", onTouchMove);
      domTarget.removeEventListener("touchend", onTouchEnd);
      domTarget.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [domTarget]);

  return { look, locked };
}

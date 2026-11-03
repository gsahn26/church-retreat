"use client";

import { useRef, useState } from "react";
import { touchInput } from "@/lib/touchInput";

const JOYSTICK_RADIUS = 48; // px the knob can travel from center

export default function MobileControls() {
  const baseRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);

  const updateFromTouch = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS;
      dy = (dy / dist) * JOYSTICK_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    touchInput.moveX = dx / JOYSTICK_RADIUS;
    touchInput.moveZ = -dy / JOYSTICK_RADIUS; // screen up = forward
  };

  const resetJoystick = () => {
    touchId.current = null;
    touchInput.moveX = 0;
    touchInput.moveZ = 0;
    setKnob({ x: 0, y: 0 });
  };

  const onJoystickTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    const touch = e.changedTouches[0];
    touchId.current = touch.identifier;
    updateFromTouch(touch.clientX, touch.clientY);
  };
  const onJoystickTouchMove = (e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === touchId.current
    );
    if (!touch) return;
    updateFromTouch(touch.clientX, touch.clientY);
  };
  const onJoystickTouchEnd = (e: React.TouchEvent) => {
    if (
      Array.from(e.changedTouches).some(
        (t) => t.identifier === touchId.current
      )
    ) {
      resetJoystick();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* movement joystick, bottom-left */}
      <div
        ref={baseRef}
        onTouchStart={onJoystickTouchStart}
        onTouchMove={onJoystickTouchMove}
        onTouchEnd={onJoystickTouchEnd}
        onTouchCancel={onJoystickTouchEnd}
        className="pointer-events-auto absolute bottom-8 left-8 h-28 w-28 touch-none rounded-full border border-white/25 bg-black/25 backdrop-blur-sm"
      >
        <div
          className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-white/40"
          style={{
            transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)`,
          }}
        />
      </div>

      {/* interact button, bottom-right */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          setPressed(true);
          touchInput.interact = true;
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setPressed(false);
          touchInput.interact = false;
        }}
        onTouchCancel={() => {
          setPressed(false);
          touchInput.interact = false;
        }}
        className={`pointer-events-auto absolute bottom-10 right-8 flex h-20 w-20 touch-none items-center justify-center rounded-full border border-amber-200/40 text-sm font-semibold text-amber-50 backdrop-blur-sm transition ${
          pressed ? "bg-amber-400/60" : "bg-black/25"
        }`}
      >
        E
      </button>
    </div>
  );
}

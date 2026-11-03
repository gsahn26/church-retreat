"use client";

import { useEffect, useRef } from "react";

export default function LoginBackdrop() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: nx, y: ny };
    }
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.04;
      current.current.y += (target.current.y - current.current.y) * 0.04;
      const { x, y } = current.current;
      if (sceneRef.current) {
        sceneRef.current.style.transform = `translate3d(${x * -14}px, ${y * -8}px, 0) rotateY(${x * 2.2}deg) rotateX(${y * -1.4}deg)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x * 22}px, ${y * 14}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "1200px" }}>
      {/* deep forest-green church ground wash, echoing 목양교회's palette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b2a1c] via-[#223422] to-[#0c130c]" />

      {/* breathing warm glow, like candlelight through a window */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[30%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(255,205,120,0.35) 0%, rgba(120,150,90,0.12) 45%, transparent 72%)",
          animation: "backdrop-breathe 6s ease-in-out infinite",
        }}
      />

      {/* parallax scene: church silhouette + arched window + cross */}
      <div ref={sceneRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <svg
          className="absolute bottom-0 left-1/2 h-[55vh] w-auto -translate-x-1/2 opacity-90"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden="true"
        >
          {/* gabled roofline */}
          <path d="M20 300 L20 140 L200 20 L380 140 L380 300 Z" fill="#12210f" />
          {/* arched window */}
          <path
            d="M200 60 C170 60 150 85 150 120 L150 190 L250 190 L250 120 C250 85 230 60 200 60 Z"
            fill="rgba(255,205,120,0.22)"
          />
          <path
            d="M200 60 C170 60 150 85 150 120 L150 190 L250 190 L250 120 C250 85 230 60 200 60 Z"
            stroke="#3f5c37"
            strokeWidth="4"
          />
          <line x1="200" y1="60" x2="200" y2="190" stroke="#3f5c37" strokeWidth="3" />
          <line x1="150" y1="130" x2="250" y2="130" stroke="#3f5c37" strokeWidth="3" />
          {/* cross on the roof */}
          <rect x="195" y="-30" width="10" height="55" fill="#e8dcae" />
          <rect x="175" y="-12" width="50" height="10" fill="#e8dcae" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes backdrop-breathe {
          0%,
          100% {
            opacity: 0.55;
            scale: 0.96;
          }
          50% {
            opacity: 0.85;
            scale: 1.05;
          }
        }
      `}</style>
    </div>
  );
}

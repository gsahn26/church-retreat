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
    function onTouch(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      const nx = (touch.clientX / window.innerWidth) * 2 - 1;
      const ny = (touch.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: nx, y: ny };
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });

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
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "1200px" }}>
      {/* dusk sky: a warmer band near the horizon (like a photo shot at
          blue hour) instead of one flat tint top to bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #0a1410 0%, #142218 32%, #24331f 58%, #3a3a22 78%, #0c130c 100%)",
        }}
      />

      {/* stars, faint and only in the upper sky */}
      <svg className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true">
        <defs>
          <radialGradient id="starFade" cx="50%" cy="20%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="55%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[
          [8, 10], [22, 6], [37, 14], [52, 5], [68, 11], [81, 7], [93, 15],
          [15, 22], [45, 24], [72, 20], [60, 28], [30, 30], [88, 26],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={`${x}%`}
            cy={`${y}%`}
            r={i % 3 === 0 ? 1.6 : 1}
            fill="url(#starFade)"
            style={{ animation: `star-twinkle ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </svg>

      {/* subtle film grain, so flat vector shading reads more like a photo */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

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
        {/* theatrical spotlight beam, shining straight down from above like
            stage lighting onto the angel below */}
        <div
          className="absolute left-1/2 top-0 h-[70vh] w-[48vmin] -translate-x-1/2 opacity-90"
          style={{
            clipPath: "polygon(43% 0%, 57% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to bottom, rgba(255,250,225,0.6) 0%, rgba(255,236,182,0.3) 40%, rgba(255,224,160,0.08) 72%, transparent 100%)",
            filter: "blur(7px)",
            animation: "backdrop-breathe 5s ease-in-out infinite",
          }}
          aria-hidden="true"
        />

        {/* angel, hovering in the light above the church */}
        <div
          className="absolute left-1/2 top-[9%] -translate-x-1/2"
          style={{ animation: "angel-float 6s ease-in-out infinite" }}
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
            style={{
              background:
                "radial-gradient(circle, rgba(255,246,212,0.6) 0%, rgba(255,236,182,0.2) 50%, transparent 75%)",
              filter: "blur(5px)",
            }}
          />
          <svg width="92" height="92" viewBox="0 0 100 100" className="relative drop-shadow-[0_0_14px_rgba(255,244,200,0.8)]">
            {/* halo */}
            <ellipse cx="50" cy="17" rx="13" ry="5" fill="none" stroke="#fff3c4" strokeWidth="3" opacity="0.95" />
            {/* wings */}
            <path d="M50 40 C30 27 13 33 5 52 C20 50 35 54 49 67 Z" fill="#fef8e6" opacity="0.95" />
            <path d="M50 40 C70 27 87 33 95 52 C80 50 65 54 51 67 Z" fill="#fef8e6" opacity="0.95" />
            {/* robe */}
            <path d="M50 29 C41 29 35 38 35 48 L31 87 C31 91 69 91 69 87 L65 48 C65 38 59 29 50 29 Z" fill="#fffaf0" />
            {/* head */}
            <circle cx="50" cy="22" r="9.5" fill="#fffaf0" />
          </svg>
        </div>

        <svg
          className="absolute bottom-0 left-1/2 h-[55vh] w-auto -translate-x-1/2 opacity-95"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            {/* roof/facade lit faintly from the upper-left, like moonlight
                grazing the ridge, instead of one flat silhouette fill */}
            <linearGradient id="roofShade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a4024" />
              <stop offset="45%" stopColor="#16260f" />
              <stop offset="100%" stopColor="#0a1408" />
            </linearGradient>
            <linearGradient id="sideShade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0a1408" />
              <stop offset="100%" stopColor="#060b05" />
            </linearGradient>
            <pattern id="brick" width="26" height="14" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
              <rect width="26" height="14" fill="transparent" />
              <path d="M0 7 H26 M13 0 V7 M0 7 V14 M26 7 V14" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
            </pattern>
          </defs>

          {/* ground-contact shadow, so the building feels planted rather than floating */}
          <ellipse cx="200" cy="300" rx="190" ry="14" fill="#000" opacity="0.35" />
          {/* stone steps up to the door */}
          <rect x="165" y="286" width="70" height="8" fill="#1a2a16" />
          <rect x="172" y="278" width="56" height="8" fill="#20331b" />

          {/* narrow side wall sliver for a 3D read, not a flat cutout */}
          <path d="M380 140 L398 155 L398 300 L380 300 Z" fill="url(#sideShade)" />

          {/* gabled roofline + facade */}
          <path d="M20 300 L20 140 L200 20 L380 140 L380 300 Z" fill="url(#roofShade)" />
          <path d="M20 300 L20 140 L200 20 L380 140 L380 300 Z" fill="url(#brick)" />
          <path d="M20 300 L20 140 L200 20 L380 140 L380 300 Z" stroke="#0a1408" strokeWidth="2" opacity="0.6" />

          {/* arched window, lit warmly from inside */}
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

          {/* arched doorway at the base, matching the window's shape language */}
          <path
            d="M172 300 L172 250 C172 230 184 218 200 218 C216 218 228 230 228 250 L228 300 Z"
            fill="#05080a"
            opacity="0.85"
          />
          <path
            d="M172 300 L172 250 C172 230 184 218 200 218 C216 218 228 230 228 250 L228 300 Z"
            stroke="#3f5c37"
            strokeWidth="3"
          />

          {/* cross on the roof */}
          <rect x="195" y="-30" width="10" height="55" fill="#e8dcae" />
          <rect x="175" y="-12" width="50" height="10" fill="#e8dcae" />
        </svg>
      </div>

      {/* vignette, like a camera lens falloff, to frame the shot */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <style jsx>{`
        @keyframes star-twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
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
        @keyframes angel-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

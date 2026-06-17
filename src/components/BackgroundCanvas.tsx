"use client";
import { useEffect, useRef } from "react";

const N_PARTICLES = 60;
const N_TWINKLES  = 200;
const GRID        = 4; // dot grid spacing (CSS px) — must match globals.css background-size

// Palette [r, g, b] — whites & grays weighted 5:2 against teal
const PAL: [number, number, number][] = [
  [255, 255, 255],
  [255, 255, 255],
  [220, 220, 220],
  [175, 175, 175],
  [120, 120, 120],
  [36,  214, 188], // #24D6BC
  [36,  214, 188],
];

function rnd(lo = 0, hi = 1) { return lo + Math.random() * (hi - lo); }
function pick(): [number, number, number] { return PAL[(Math.random() * PAL.length) | 0]; }

export default function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, W = 0, H = 0;

    // ── Particle type ──────────────────────────────────────────────────────────
    type P = {
      x: number; y: number; vx: number; vy: number;
      r: number; rMin: number; rMax: number; rPhase: number; rSpeed: number;
      cA: [number, number, number]; cB: [number, number, number];
      cT: number; cDur: number;
      alpha: number;
    };
    function mkP(): P {
      const rMin = 1.3 + rnd() * 1.7;
      const rMax = rMin + 1.2 + rnd() * 2.8;
      return {
        x: rnd() * W, y: rnd() * H,
        vx: (rnd() - 0.5) * 0.16, vy: (rnd() - 0.5) * 0.11,
        r: (rMin + rMax) / 2, rMin, rMax,
        rPhase: rnd() * Math.PI * 2, rSpeed: 0.005 + rnd() * 0.013,
        cA: pick(), cB: pick(),
        cT: rnd(), cDur: 90 + rnd() * 320,
        alpha: 0.26 + rnd() * 0.44,
      };
    }
    const parts: P[] = [];

    // ── Twinkle type ───────────────────────────────────────────────────────────
    type T = {
      gx: number; gy: number;
      alpha: number; peak: number;
      phase: "in" | "hold" | "out";
      hold: number; speed: number;
    };
    function mkT(): T {
      return {
        gx: Math.floor(rnd() * Math.floor(W / GRID)) * GRID,
        gy: Math.floor(rnd() * Math.floor(H / GRID)) * GRID,
        alpha: 0, peak: rnd(0.10, 0.22),
        phase: "in", hold: 0, speed: rnd(0.002, 0.007),
      };
    }
    const twinkles: T[] = [];

    // ── Resize ─────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!parts.length) for (let i = 0; i < N_PARTICLES; i++) parts.push(mkP());

      if (!twinkles.length) {
        for (let i = 0; i < N_TWINKLES; i++) {
          const t = mkT();
          t.alpha = rnd(0, t.peak); // stagger initial state
          twinkles.push(t);
        }
      } else {
        for (const t of twinkles) {
          t.gx = Math.floor(rnd() * Math.floor(W / GRID)) * GRID;
          t.gy = Math.floor(rnd() * Math.floor(H / GRID)) * GRID;
        }
      }
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Twinkling dots (1×1 px on the CSS dot grid)
      for (const t of twinkles) {
        if (t.phase === "in") {
          t.alpha += (t.peak - t.alpha) * t.speed;
          if (t.alpha >= t.peak * 0.92) {
            t.phase = "hold";
            t.hold  = (50 + rnd() * 200) | 0;
          }
        } else if (t.phase === "hold") {
          if (--t.hold <= 0) t.phase = "out";
        } else {
          t.alpha *= 1 - t.speed * 2.2;
          if (t.alpha < 0.002) {
            t.gx    = Math.floor(rnd() * Math.floor(W / GRID)) * GRID;
            t.gy    = Math.floor(rnd() * Math.floor(H / GRID)) * GRID;
            t.alpha = 0;
            t.peak  = rnd(0.10, 0.22);
            t.phase = "in";
            t.speed = rnd(0.0015, 0.006);
          }
        }
        if (t.alpha > 0.002) {
          ctx.fillStyle = `rgba(255,255,255,${t.alpha.toFixed(3)})`;
          ctx.fillRect(t.gx, t.gy, 1, 1);
        }
      }

      // Floating soft-glow particles
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -30) p.x += W + 60; else if (p.x > W + 30) p.x -= W + 60;
        if (p.y < -30) p.y += H + 60; else if (p.y > H + 30) p.y -= H + 60;

        // Size pulse
        p.rPhase += p.rSpeed;
        const tgt = p.rMin + (p.rMax - p.rMin) * ((Math.sin(p.rPhase) + 1) * 0.5);
        p.r += (tgt - p.r) * 0.055;

        // Color shift
        p.cT += 1 / p.cDur;
        if (p.cT >= 1) { p.cA = p.cB; p.cB = pick(); p.cT = 0; }
        const tc = p.cT;
        const cr = (p.cA[0] + (p.cB[0] - p.cA[0]) * tc) | 0;
        const cg = (p.cA[1] + (p.cB[1] - p.cA[1]) * tc) | 0;
        const cb = (p.cA[2] + (p.cB[2] - p.cA[2]) * tc) | 0;

        // Radial glow
        const gr = p.r * 3.8;
        const g  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
        const a  = p.alpha.toFixed(2);
        g.addColorStop(0,    `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(0.38, `rgba(${cr},${cg},${cb},${(p.alpha * 0.28).toFixed(2)})`);
        g.addColorStop(1,    `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(p.x - gr, p.y - gr, gr * 2, gr * 2);
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0, left: 0,
        pointerEvents: "none",
        zIndex: 10,
        mixBlendMode: "screen",
      }}
    />
  );
}

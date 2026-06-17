"use client";

import { useReducedMotion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"

const STACK = [
  {
    name: "Next.js 15",
    tag: "Framework",
    desc: "App Router, SSR y React Server Components para páginas rápidas y SEO-ready.",
    side: "right" as const,
    rotY: 10, rotX: -4,
  },
  {
    name: "React 19",
    tag: "UI",
    desc: "Componentes declarativos, Server Components y sistema Suspense.",
    side: "left" as const,
    rotY: -28, rotX: 6,
  },
  {
    name: "TypeScript",
    tag: "Lenguaje",
    desc: "Tipos estrictos en toda la base de código, de cliente a servidor.",
    side: "right" as const,
    rotY: 22, rotX: -5,
  },
  {
    name: "Tailwind CSS v4",
    tag: "Estilos",
    desc: "Utilidades con design tokens coherentes y sin CSS no utilizado.",
    side: "left" as const,
    rotY: -18, rotX: 4,
  },
  {
    name: "Node.js",
    tag: "Backend",
    desc: "Runtime para APIs, webhooks e integraciones de servidor.",
    side: "right" as const,
    rotY: 30, rotX: -3,
  },
  {
    name: "PostgreSQL + Prisma",
    tag: "Base de datos",
    desc: "Base relacional sólida con ORM typesafe y migraciones versionadas.",
    side: "left" as const,
    rotY: -14, rotX: 7,
  },
  {
    name: "Vercel",
    tag: "Deploy",
    desc: "Deploy global en segundos, preview automática por rama y analytics.",
    side: "right" as const,
    rotY: 0, rotX: 0,
  },
];

const LAYER_COUNT = 7;

// Vertical position of each annotation card within its side column.
// Right side has 4 cards (i=0,2,4,6), left has 3 (i=1,3,5).
const CARD_TOP: Record<number, string> = {
  0: "2%",   // Next.js     (right 1/4)
  1: "8%",   // React       (left  1/3)
  2: "26%",  // TypeScript  (right 2/4)
  3: "38%",  // Tailwind    (left  2/3)
  4: "50%",  // Node.js     (right 3/4)
  5: "64%",  // PostgreSQL  (left  3/3)
  6: "72%",  // Vercel      (right 4/4)
};

// Color ramp: neutral → teal as we progress through the stack
const STEP_GLOW = [
  "0 70px 160px rgba(0,0,0,0.28), 0 24px 64px rgba(0,0,0,0.15), 0 6px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.28), 0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(50,121,249,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.28), 0 24px 64px rgba(0,0,0,0.15), 0 0 24px rgba(50,121,249,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.24), 0 24px 64px rgba(0,0,0,0.12), 0 0 32px rgba(36,214,188,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.22), 0 24px 64px rgba(0,0,0,0.10), 0 0 40px rgba(36,214,188,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.20), 0 24px 64px rgba(0,0,0,0.10), 0 0 52px rgba(36,214,188,0.24), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 70px 160px rgba(0,0,0,0.18), 0 24px 64px rgba(0,0,0,0.08), 0 0 70px rgba(36,214,188,0.32), 0 0 120px rgba(36,214,188,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
];

// Screen overlay color per step (teal tint accumulates)
const STEP_OVERLAY = [
  "rgba(0,0,0,0)",
  "rgba(50,121,249,0.025)",
  "rgba(50,121,249,0.05)",
  "rgba(36,214,188,0.04)",
  "rgba(36,214,188,0.07)",
  "rgba(36,214,188,0.10)",
  "rgba(36,214,188,0.14)",
];

// Chrome traffic-light dot colors per step
const DOT_COLORS = [
  ["oklch(0.9 0 0)", "oklch(0.9 0 0)", "oklch(0.9 0 0)"],
  ["oklch(0.9 0 0)", "oklch(0.9 0 0)", "oklch(0.9 0 0)"],
  ["oklch(0.65 0.18 25)", "oklch(0.9 0 0)", "oklch(0.9 0 0)"],
  ["oklch(0.65 0.18 25)", "oklch(0.78 0.16 85)", "oklch(0.9 0 0)"],
  ["oklch(0.65 0.18 25)", "oklch(0.78 0.16 85)", "oklch(0.70 0.17 145)"],
  ["oklch(0.65 0.18 25)", "oklch(0.78 0.16 85)", "oklch(0.70 0.17 145)"],
  ["oklch(0.65 0.18 25)", "oklch(0.78 0.16 85)", "oklch(0.70 0.17 145)"],
];

export default function TechStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef     = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const frameRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dot0Ref    = useRef<HTMLDivElement>(null);
  const dot1Ref    = useRef<HTMLDivElement>(null);
  const dot2Ref    = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (reduceMotion) return;
    if (!sectionRef.current || !pinRef.current || !productRef.current) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Initial states ────────────────────────────────────────────────────────
      gsap.set(productRef.current, { rotationY: STACK[0].rotY, rotationX: STACK[0].rotX, opacity: 0, y: 48 });
      for (let i = 0; i < LAYER_COUNT; i++) {
        gsap.set(`[data-layer="${i}"]`, { opacity: 0 });
      }
      STACK.forEach((item, i) => {
        gsap.set(`[data-annotation="${i}"]`, { opacity: 0, x: item.side === "right" ? 28 : -28 });
      });

      // ── Timeline ──────────────────────────────────────────────────────────────
      const tl = gsap.timeline();

      // Product enters
      tl.to(productRef.current, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, 0);

      STACK.forEach((item, i) => {
        const at = i === 0 ? 0.6 : i * 1.8;  // tighter steps

        // Rotate product
        if (i > 0) {
          tl.to(productRef.current, {
            rotationY: item.rotY,
            rotationX: item.rotX,
            duration: 1.4,
            ease: "power2.inOut",
          }, at);
        }

        // Progressive color: frame glow
        tl.to(frameRef.current, {
          boxShadow: STEP_GLOW[i],
          duration: 1.0,
          ease: "power2.out",
        }, at + 0.3);

        // Progressive color: screen tint overlay
        tl.to(overlayRef.current, {
          backgroundColor: STEP_OVERLAY[i],
          duration: 1.0,
          ease: "power2.out",
        }, at + 0.3);

        // Progressive color: chrome traffic lights
        tl.to(dot0Ref.current, { backgroundColor: DOT_COLORS[i][0], duration: 0.6 }, at + 0.4);
        tl.to(dot1Ref.current, { backgroundColor: DOT_COLORS[i][1], duration: 0.6 }, at + 0.5);
        tl.to(dot2Ref.current, { backgroundColor: DOT_COLORS[i][2], duration: 0.6 }, at + 0.6);

        // Reveal cumulative browser layer
        tl.to(`[data-layer="${i}"]`, { opacity: 1, duration: 0.7, ease: "power2.out" }, at + 0.4);

        // Show annotation
        tl.to(`[data-annotation="${i}"]`, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, at + 0.6);

        // Cards stay visible — they accumulate as the stack progresses
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: pinRef.current,
        scrub: 1.5,
        animation: tl,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  // ── Annotation card ──────────────────────────────────────────────────────────
  const AnnotationCard = ({ item, i }: { item: typeof STACK[number]; i: number }) => (
    <div
      data-annotation={i}
      style={{
        position: "absolute",
        top: CARD_TOP[i],
        ...(item.side === "right" ? { left: 0 } : { right: 0 }),
        display: "flex",
        alignItems: "flex-start",
        flexDirection: item.side === "right" ? "row" : "row-reverse",
        gap: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginTop: 22, flexShrink: 0 }}>
        {item.side === "right" ? (
          <>
            <div style={{ width: 48, height: 1, background: "oklch(0.78 0 0)" }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "oklch(0.25 0 0)", flexShrink: 0 }} />
          </>
        ) : (
          <>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "oklch(0.25 0 0)", flexShrink: 0 }} />
            <div style={{ width: 48, height: 1, background: "oklch(0.78 0 0)" }} />
          </>
        )}
      </div>
      <div
        style={{
          width: 186,
          marginLeft: item.side === "right" ? 10 : 0,
          marginRight: item.side === "left" ? 10 : 0,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "13px 14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", marginBottom: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
          <span style={{
            fontSize: 9, fontWeight: 500, color: "var(--ink-faint)",
            border: "1px solid var(--border)", borderRadius: 99,
            padding: "2px 6px", lineHeight: 1,
          }}>
            {item.tag}
          </span>
        </div>
        <p style={{ fontSize: 10.5, color: "var(--ink-muted)", lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="stack"
      aria-labelledby="stack-heading"
      className="relative lg:h-[360vh]"
    >
      {/* ── Mobile: static list ─────────────────────────────────────────────── */}
      <div className="section-inner py-20 lg:hidden">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Tecnología
        </span>
        <h2
          id="stack-heading"
          className="mt-2 font-display text-[clamp(2rem,4.2vw,3.3rem)] font-semibold leading-[1.04] tracking-[-0.04em]"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          El stack detrás de cada proyecto.
        </h2>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {STACK.map((item, i) => (
            <li
              key={item.name}
              className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-xs)]"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[11px] font-semibold tabular-nums text-[var(--ink-muted)]">
                {i + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-[var(--ink)]">{item.name}</span>
                  <span className="rounded-full border border-[var(--border)] px-1.5 py-px text-[10px] font-medium text-[var(--ink-faint)]">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-[var(--ink-muted)]">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Desktop: 3D scroll animation ────────────────────────────────────── */}
      <div
        ref={pinRef}
        className="hidden h-svh flex-col items-start justify-start overflow-hidden px-8 pt-4 lg:flex xl:px-14"
      >
        <div className="mb-6 w-full">
          <h2
            className="mx-auto flex justify-center font-display text-[clamp(3.4rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-[var(--ink)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            El stack detrás
          </h2>
          <h2
            className="mx-auto mb-4 xl:mb-20 2xl:mb-40 flex justify-center font-display text-[clamp(3.4rem,7vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-[var(--ink)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            de cada proyecto.
          </h2>
        </div>

        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "min(96vw, 1240px)",
          height: "min(50vh, 460px)",
          alignSelf: "center",
        }}>
          {/* Left annotation zone */}
          <div style={{ position: "relative", width: 230, height: "100%", flexShrink: 0 }}>
            {STACK.map((item, i) =>
              item.side === "left" ? <AnnotationCard key={item.name} item={item} i={i} /> : null
            )}
          </div>

          {/* 3D Product */}
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            perspective: "1600px",
            perspectiveOrigin: "50% 44%",
          }}>
            <div ref={productRef} style={{ transformStyle: "preserve-3d", willChange: "transform", width: "min(54vw, 680px)" }}>

              {/* Browser frame */}
              <div
                ref={frameRef}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid oklch(0.85 0 0)",
                  boxShadow: STEP_GLOW[0],
                  background: "white",
                }}
              >
                {/* Chrome bar */}
                <div style={{
                  background: "oklch(0.972 0 0)",
                  borderBottom: "1px solid oklch(0.905 0 0)",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div ref={dot0Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                    <div ref={dot1Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                    <div ref={dot2Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                  </div>
                  <div style={{
                    flex: 1, margin: "0 8px",
                    background: "white",
                    border: "1px solid oklch(0.905 0 0)",
                    borderRadius: 99,
                    padding: "4px 12px",
                    fontSize: 11,
                    color: "oklch(0.62 0 0)",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}>
                    tuempresa.vercel.app
                  </div>
                </div>

                {/* Screen content */}
                <div style={{ position: "relative", height: "min(35vw, 410px)", background: "white", overflow: "hidden" }}>

                  {/* Color tint overlay */}
                  <div
                    ref={overlayRef}
                    style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      pointerEvents: "none",
                      backgroundColor: "rgba(0,0,0,0)",
                      transition: "none",
                    }}
                  />

                  {/* Layer 0 · Next.js */}
                  <div data-layer="0" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, color: "oklch(0.74 0 0)", letterSpacing: "0.06em" }}>
                      Next.js App initialized
                    </span>
                  </div>

                  {/* Layer 1 · React · navbar */}
                  <div data-layer="1" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, borderBottom: "1px solid oklch(0.93 0 0)", display: "flex", alignItems: "center", padding: "0 24px", background: "white" }}>
                    <div style={{ width: 58, height: 11, borderRadius: 6, background: "oklch(0.12 0 0)" }} />
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
                      {[40, 48, 32].map((w, j) => <div key={j} style={{ width: w, height: 6, borderRadius: 3, background: "oklch(0.88 0 0)" }} />)}
                      <div style={{ width: 76, height: 28, borderRadius: 99, background: "oklch(0.12 0 0)" }} />
                    </div>
                  </div>

                  {/* Layer 2 · TypeScript · hero */}
                  <div data-layer="2" style={{ position: "absolute", top: 44, left: 0, right: 0, padding: "26px 24px 0" }}>
                    <div style={{ height: 25, width: "76%", borderRadius: 8, background: "oklch(0.1 0 0)", marginBottom: 10 }} />
                    <div style={{ height: 20, width: "50%", borderRadius: 8, background: "oklch(0.1 0 0)", opacity: 0.28, marginBottom: 18 }} />
                    <div style={{ height: 7, width: "62%", borderRadius: 4, background: "oklch(0.9 0 0)", marginBottom: 7 }} />
                    <div style={{ height: 7, width: "46%", borderRadius: 4, background: "oklch(0.93 0 0)", marginBottom: 22 }} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 104, height: 30, borderRadius: 99, background: "oklch(0.1 0 0)" }} />
                      <div style={{ width: 104, height: 30, borderRadius: 99, border: "1px solid oklch(0.88 0 0)" }} />
                    </div>
                  </div>

                  {/* Layer 3 · Tailwind · cards */}
                  <div data-layer="3" style={{ position: "absolute", bottom: 40, left: 24, right: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} style={{ border: "1px solid oklch(0.92 0 0)", borderRadius: 14, padding: 14, background: "oklch(0.985 0 0)" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 5, background: j === 0 ? "rgba(36,214,188,0.35)" : "oklch(0.87 0 0)", marginBottom: 10 }} />
                        <div style={{ height: 5, borderRadius: 3, background: "oklch(0.91 0 0)", marginBottom: 6 }} />
                        <div style={{ height: 5, width: "70%", borderRadius: 3, background: "oklch(0.94 0 0)" }} />
                      </div>
                    ))}
                  </div>

                  {/* Layer 4 · Node.js · API badge */}
                  <div data-layer="4" style={{ position: "absolute", right: 14, top: 54, borderRadius: 10, border: "1px solid oklch(0.91 0 0)", background: "white", padding: "6px 10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.72 0.17 145)" }} />
                    <code style={{ fontSize: 9, color: "oklch(0.5 0 0)", fontFamily: "monospace" }}>GET /api 200</code>
                  </div>

                  {/* Layer 5 · PostgreSQL/Prisma · DB rows */}
                  <div data-layer="5" style={{ position: "absolute", right: 14, top: 96, borderRadius: 10, border: "1px solid rgba(36,214,188,0.3)", background: "white", padding: "8px 10px", boxShadow: "0 2px 10px rgba(36,214,188,0.08)" }}>
                    {[52, 42, 32].map((w, j) => (
                      <div key={j} style={{ height: 4, width: w, borderRadius: 2, background: j === 0 ? "rgba(36,214,188,0.4)" : "oklch(0.89 0 0)", marginBottom: j < 2 ? 4 : 0 }} />
                    ))}
                    <code style={{ display: "block", marginTop: 6, fontSize: 9, color: "oklch(0.6 0 0)", fontFamily: "monospace" }}>
                      3 rows · Prisma
                    </code>
                  </div>

                  {/* Layer 6 · Vercel · deployed banner */}
                  <div data-layer="6" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(90deg, oklch(0.1 0 0), oklch(0.12 0.04 180))", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m4 12 6 6 10-10" stroke="#24D6BC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "white" }}>Deployed to Vercel · Production</span>
                  </div>

                  {/* Light simulation */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)", pointerEvents: "none", zIndex: 11 }} />
                </div>
              </div>

              {/* Ground shadow */}
              <div style={{
                position: "absolute",
                bottom: -52, left: "50%",
                transform: "translateX(-50%)",
                width: "68%", height: 48,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.11)",
                filter: "blur(22px)",
                pointerEvents: "none",
              }} />
            </div>
          </div>

          {/* Right annotation zone */}
          <div style={{ position: "relative", width: 230, height: "100%", flexShrink: 0 }}>
            {STACK.map((item, i) =>
              item.side === "right" ? <AnnotationCard key={item.name} item={item} i={i} /> : null
            )}
          </div>
        </div>
      </div>

      {/* Cards start hidden via CSS so GSAP can animate without React style-prop conflict */}
      <style>{`
        #stack [data-annotation] { opacity: 0; }
      `}</style>
    </section>
  );
}

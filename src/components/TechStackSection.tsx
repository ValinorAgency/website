"use client";

import { useReducedMotion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"

const STACK = [
  { name: "Next.js 15",        tag: "Framework",      desc: "App Router, SSR y React Server Components para páginas rápidas y SEO-ready.", side: "right" as const, rotY: 10,  rotX: -4 },
  { name: "React 19",          tag: "UI",              desc: "Componentes declarativos, Server Components y sistema Suspense.",             side: "left"  as const, rotY: -28, rotX:  6 },
  { name: "TypeScript",        tag: "Lenguaje",        desc: "Tipos estrictos en toda la base de código, de cliente a servidor.",          side: "right" as const, rotY: 22,  rotX: -5 },
  { name: "Tailwind CSS v4",   tag: "Estilos",         desc: "Utilidades con design tokens coherentes y sin CSS no utilizado.",            side: "left"  as const, rotY: -18, rotX:  4 },
  { name: "Node.js",           tag: "Backend",         desc: "Runtime para APIs, webhooks e integraciones de servidor.",                   side: "right" as const, rotY: 30,  rotX: -3 },
  { name: "PostgreSQL + Prisma", tag: "Base de datos", desc: "Base relacional sólida con ORM typesafe y migraciones versionadas.",         side: "left"  as const, rotY: -14, rotX:  7 },
  { name: "Vercel",            tag: "Deploy",          desc: "Deploy global en segundos, preview automática por rama y analytics.",        side: "right" as const, rotY: 0,   rotX:  0 },
];

const LAYER_COUNT = 7;

const CARD_TOP: Record<number, string> = {
  0: "2%", 1: "8%", 2: "26%", 3: "38%", 4: "50%", 5: "64%", 6: "72%",
};

const STEP_GLOW = [
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
];

const STEP_OVERLAY = [
  "rgba(0,0,0,0)",
  "rgba(50,121,249,0.025)",
  "rgba(50,121,249,0.05)",
  "rgba(36,214,188,0.04)",
  "rgba(36,214,188,0.07)",
  "rgba(36,214,188,0.10)",
  "rgba(36,214,188,0.14)",
];

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
  const sectionRef  = useRef<HTMLDivElement>(null);
  const desktopRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const productRef  = useRef<HTMLDivElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const dot0Ref     = useRef<HTMLDivElement>(null);
  const dot1Ref     = useRef<HTMLDivElement>(null);
  const dot2Ref     = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (reduceMotion) return;
    if (!sectionRef.current || !desktopRef.current || !titleRef.current || !cardRef.current || !productRef.current) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // How many timeline seconds before the existing layer animation starts
      const OFFSET = 3.0;

      // ── Initial states ────────────────────────────────────────────────────
      gsap.set(titleRef.current,  { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(cardRef.current,   { y: window.innerHeight, scale: 0.72 });
      gsap.set(productRef.current, { rotationY: STACK[0].rotY, rotationX: STACK[0].rotX, opacity: 0, y: 48 });
      for (let i = 0; i < LAYER_COUNT; i++) {
        gsap.set(`[data-layer="${i}"]`, { opacity: 0 });
      }
      STACK.forEach((item, i) => {
        gsap.set(`[data-annotation="${i}"]`, { opacity: 0, x: item.side === "right" ? 28 : -28 });
      });

      // ── Timeline ──────────────────────────────────────────────────────────
      const tl = gsap.timeline();

      // Phase 1 — title blurs and lifts out
      tl.to(titleRef.current, {
        opacity: 0,
        y: -50,
        filter: "blur(16px)",
        duration: 1.4,
        ease: "power2.in",
      }, 0);

      // Phase 2a — card rises from below (still small)
      tl.to(cardRef.current, {
        y: 0,
        duration: 1.8,
        ease: "power3.out",
      }, 0.3);

      // Phase 2b — card expands to fill viewport once in position
      tl.to(cardRef.current, {
        scale: 1,
        duration: 1.2,
        ease: "power2.inOut",
      }, 1.5);

      // Phase 3 — product enters (shifted by OFFSET)
      tl.to(productRef.current, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, OFFSET);

      STACK.forEach((item, i) => {
        const at = OFFSET + (i === 0 ? 0.6 : i * 1.8);

        if (i > 0) {
          tl.to(productRef.current, {
            rotationY: item.rotY, rotationX: item.rotX,
            duration: 1.4, ease: "power2.inOut",
          }, at);
        }

        tl.to(frameRef.current,   { boxShadow: STEP_GLOW[i],             duration: 1.0, ease: "power2.out" }, at + 0.3);
        tl.to(overlayRef.current, { backgroundColor: STEP_OVERLAY[i],    duration: 1.0, ease: "power2.out" }, at + 0.3);
        tl.to(dot0Ref.current,    { backgroundColor: DOT_COLORS[i][0],   duration: 0.6 }, at + 0.4);
        tl.to(dot1Ref.current,    { backgroundColor: DOT_COLORS[i][1],   duration: 0.6 }, at + 0.5);
        tl.to(dot2Ref.current,    { backgroundColor: DOT_COLORS[i][2],   duration: 0.6 }, at + 0.6);
        tl.to(`[data-layer="${i}"]`,      { opacity: 1, duration: 0.7, ease: "power2.out" }, at + 0.4);
        tl.to(`[data-annotation="${i}"]`, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, at + 0.6);
      });

      ScrollTrigger.create({
        trigger: desktopRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * 5.0}`,
        pin: desktopRef.current,
        scrub: 1.5,
        animation: tl,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  // ── Annotation card ───────────────────────────────────────────────────────
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
            <div className="ann-line" style={{ width: 48, height: 1, background: "#24D6BC" }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#24D6BC", flexShrink: 0 }} />
          </>
        ) : (
          <>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#24D6BC", flexShrink: 0 }} />
            <div className="ann-line" style={{ width: 48, height: 1, background: "#24D6BC" }} />
          </>
        )}
      </div>
      <div
        className="ann-card"
        style={{
          width: 186,
          marginLeft: item.side === "right" ? 10 : 0,
          marginRight: item.side === "left" ? 10 : 0,
          background: "#0D1F1C",
          border: "1px solid rgba(36,214,188,0.22)",
          borderRadius: 14,
          padding: "13px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.30), 0 0 0 1px rgba(36,214,188,0.08)",
          borderTop: "2px solid #24D6BC",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", marginBottom: 5 }}>
          <span className="ann-name" style={{ fontSize: 12, fontWeight: 600, color: "#E8F7F4" }}>{item.name}</span>
          <span style={{
            fontSize: 9, fontWeight: 500, color: "#24D6BC",
            border: "1px solid rgba(36,214,188,0.30)", borderRadius: 99,
            padding: "2px 6px", lineHeight: 1,
            fontFamily: "ui-monospace, monospace",
          }}>
            {item.tag}
          </span>
        </div>
        <p className="ann-desc" style={{ fontSize: 10.5, color: "rgba(232,247,244,0.60)", lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="stack"
      aria-labelledby="stack-heading"
      className="relative"
    >
      {/* ── Background (title phase only — card has own bg) ─────────────────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 15%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 15%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", left: "50%", top: "38%",
          transform: "translate(-50%, -50%)",
          width: "60%", height: "50%",
          background: "radial-gradient(ellipse, rgba(36,214,188,0.07) 0%, rgba(36,214,188,0.02) 45%, transparent 70%)",
          filter: "blur(1px)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(6,6,9,0.6) 100%)" }} />
      </div>

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

      {/* ── Desktop: pinned container (title + rising card) ──────────────────── */}
      <div
        ref={desktopRef}
        className="hidden lg:block"
        style={{ height: "100svh", position: "relative", zIndex: 15, overflow: "hidden" }}
      >

        {/* Title — centered, fades out on scroll */}
        <div
          ref={titleRef}
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            paddingBottom: "3rem",
            zIndex: 2, pointerEvents: "none",
          }}
        >
          <h2
            id="stack-heading"
            className="font-display text-[clamp(4rem,9vw,12rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-center text-[var(--ink)]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            El stack detrás<br />de cada proyecto.
          </h2>
        </div>

        {/* Card — rises from below to fill the viewport */}
        <div
          ref={cardRef}
          data-card
          style={{
            position: "absolute",
            inset: "10px",
            background: "#ededed",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "20px",
            boxShadow: [
              "inset 0 0 0 1px rgba(255,255,255,0.04)",
              "inset 0 1px 0 rgba(255,255,255,0.07)",
              "0 0 0 1px rgba(0,0,0,0.6)",
              "0 40px 140px rgba(0,0,0,0.9)",
              "0 0 100px rgba(36,214,188,0.05)",
            ].join(", "),
            overflow: "hidden",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Card-level background: inner grid + center glow */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: [
                "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
                "linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
              ].join(","),
              backgroundSize: "52px 52px",
              maskImage: "radial-gradient(ellipse 88% 65% at 50% 52%, black 18%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 88% 65% at 50% 52%, black 18%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: "56%", height: "48%",
              background: "radial-gradient(ellipse, rgba(36,214,188,0.055) 0%, rgba(36,214,188,0.015) 50%, transparent 72%)",
              filter: "blur(2px)",
            }} />
          </div>

          {/* Mockup layout */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center",
            width: "min(96vw, 1240px)",
            height: "min(72vh, 500px)",
          }}>

            {/* Left annotation zone */}
            <div style={{ position: "relative", width: 230, height: "100%", flexShrink: 0 }}>
              {STACK.map((item, i) =>
                item.side === "left" ? <AnnotationCard key={item.name} item={item} i={i} /> : null
              )}
            </div>

            {/* 3D Browser */}
            <div style={{
              flex: 1, display: "flex", justifyContent: "center",
              perspective: "1600px", perspectiveOrigin: "50% 44%",
            }}>
              <div ref={productRef} style={{ transformStyle: "preserve-3d", willChange: "transform", width: "min(54vw, 680px)" }}>

                {/* Browser frame */}
                <div
                  ref={frameRef}
                  style={{
                    borderRadius: 20, overflow: "hidden",
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
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div ref={dot0Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                      <div ref={dot1Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                      <div ref={dot2Ref} style={{ width: 11, height: 11, borderRadius: "50%", background: "oklch(0.9 0 0)" }} />
                    </div>
                    <div style={{
                      flex: 1, margin: "0 8px",
                      background: "white", border: "1px solid oklch(0.905 0 0)",
                      borderRadius: 99, padding: "4px 12px",
                      fontSize: 11, color: "oklch(0.62 0 0)",
                      overflow: "hidden", whiteSpace: "nowrap",
                    }}>
                      tuempresa.vercel.app
                    </div>
                  </div>

                  {/* Screen */}
                  <div style={{ position: "relative", height: "min(35vw, 410px)", background: "white", overflow: "hidden" }}>
                    <div ref={overlayRef} style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", backgroundColor: "rgba(0,0,0,0)", transition: "none" }} />

                    <div data-layer="0" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, color: "oklch(0.74 0 0)", letterSpacing: "0.06em" }}>Next.js App initialized</span>
                    </div>

                    <div data-layer="1" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, borderBottom: "1px solid oklch(0.93 0 0)", display: "flex", alignItems: "center", padding: "0 24px", background: "white" }}>
                      <div style={{ width: 58, height: 11, borderRadius: 6, background: "oklch(0.12 0 0)" }} />
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
                        {[40, 48, 32].map((w, j) => <div key={j} style={{ width: w, height: 6, borderRadius: 3, background: "oklch(0.88 0 0)" }} />)}
                        <div style={{ width: 76, height: 28, borderRadius: 99, background: "oklch(0.12 0 0)" }} />
                      </div>
                    </div>

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

                    <div data-layer="3" style={{ position: "absolute", bottom: 40, left: 24, right: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{ border: "1px solid oklch(0.92 0 0)", borderRadius: 14, padding: 14, background: "oklch(0.985 0 0)" }}>
                          <div style={{ width: 16, height: 16, borderRadius: 5, background: j === 0 ? "rgba(36,214,188,0.35)" : "oklch(0.87 0 0)", marginBottom: 10 }} />
                          <div style={{ height: 5, borderRadius: 3, background: "oklch(0.91 0 0)", marginBottom: 6 }} />
                          <div style={{ height: 5, width: "70%", borderRadius: 3, background: "oklch(0.94 0 0)" }} />
                        </div>
                      ))}
                    </div>

                    <div data-layer="4" style={{ position: "absolute", right: 14, top: 54, borderRadius: 10, border: "1px solid oklch(0.91 0 0)", background: "white", padding: "6px 10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.72 0.17 145)" }} />
                      <code style={{ fontSize: 9, color: "oklch(0.5 0 0)", fontFamily: "monospace" }}>GET /api 200</code>
                    </div>

                    <div data-layer="5" style={{ position: "absolute", right: 14, top: 96, borderRadius: 10, border: "1px solid rgba(36,214,188,0.3)", background: "white", padding: "8px 10px", boxShadow: "0 2px 10px rgba(36,214,188,0.08)" }}>
                      {[52, 42, 32].map((w, j) => (
                        <div key={j} style={{ height: 4, width: w, borderRadius: 2, background: j === 0 ? "rgba(36,214,188,0.4)" : "oklch(0.89 0 0)", marginBottom: j < 2 ? 4 : 0 }} />
                      ))}
                      <code style={{ display: "block", marginTop: 6, fontSize: 9, color: "oklch(0.6 0 0)", fontFamily: "monospace" }}>3 rows · Prisma</code>
                    </div>

                    <div data-layer="6" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(90deg, oklch(0.1 0 0), oklch(0.12 0.04 180))", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="m4 12 6 6 10-10" stroke="#24D6BC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "white" }}>Deployed to Vercel · Production</span>
                    </div>

                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)", pointerEvents: "none", zIndex: 11 }} />
                  </div>
                </div>

                {/* Ground shadow */}
                <div style={{
                  position: "absolute", bottom: -52, left: "50%",
                  transform: "translateX(-50%)",
                  width: "68%", height: 48, borderRadius: "50%",
                  background: "rgba(0,0,0,0.15)", filter: "blur(22px)",
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
      </div>

      <style>{`
        #stack [data-annotation] { opacity: 0; }
        #stack [data-layer]      { opacity: 0; }

        /* Card hidden below viewport on desktop by default; GSAP takes over via inline style */
        @media (min-width: 1024px) {
          #stack [data-card] { transform: translateY(110vh); }
        }
        /* Reduced motion: show card immediately without transform */
        @media (min-width: 1024px) and (prefers-reduced-motion: reduce) {
          #stack [data-card]       { transform: none !important; }
          #stack [data-annotation] { opacity: 1; }
          #stack [data-layer]      { opacity: 1; }
        }

        /* Compact annotation cards on short screens */
        @media (min-width: 1024px) and (max-height: 820px) {
          #stack .ann-card { width: 150px !important; padding: 8px 10px !important; border-radius: 12px !important; }
          #stack .ann-line { width: 30px !important; }
          #stack .ann-name { font-size: 10.5px !important; }
          #stack .ann-desc { font-size: 9px !important; line-height: 1.45 !important; }
        }
      `}</style>
    </section>
  );
}

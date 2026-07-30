"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef, useState } from "react"

const STACK = [
  { name: "Next.js 16",        tag: "Framework",      desc: "App Router, SSR y React Server Components para páginas rápidas y SEO-ready.", area: "frontend" as const, side: "right" as const, rotY: 10,  rotX: -4 },
  { name: "React 19",          tag: "UI",              desc: "Componentes declarativos, Server Components y sistema Suspense.",             area: "frontend" as const, side: "left"  as const, rotY: -28, rotX:  6 },
  { name: "TypeScript",        tag: "Lenguaje",        desc: "Tipos estrictos en toda la base de código, de cliente a servidor.",          area: "frontend" as const, side: "right" as const, rotY: 22,  rotX: -5 },
  { name: "Tailwind CSS v4",   tag: "Estilos",         desc: "Utilidades con design tokens coherentes y sin CSS no utilizado.",            area: "frontend" as const, side: "left"  as const, rotY: -18, rotX:  4 },
  { name: "Node.js",           tag: "Backend",         desc: "Runtime para APIs, webhooks e integraciones de servidor.",                   area: "backend" as const, side: "right" as const, rotY: 30,  rotX: -3 },
  { name: "PostgreSQL + Prisma", tag: "Base de datos", desc: "Base relacional sólida con ORM typesafe y migraciones versionadas.",         area: "backend" as const, side: "left"  as const, rotY: -14, rotX:  7 },
  { name: "Vercel",            tag: "Deploy",          desc: "Deploy global en segundos, preview automática por rama y analytics.",        area: "backend" as const, side: "right" as const, rotY: 0,   rotX:  0 },
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

function TechTypewriterGroup({ area, title, reduceMotion }: { area: "frontend" | "backend"; title: string; reduceMotion: boolean }) {
  const technologies = STACK.filter((technology) => technology.area === area);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const item = technologies[active];
  const visibleName = reduceMotion ? item.name : typed;

  useEffect(() => {
    if (reduceMotion) return;
    let timer: number;

    if (!deleting && typed.length < item.name.length) {
      timer = window.setTimeout(() => setTyped(item.name.slice(0, typed.length + 1)), 58);
    } else if (!deleting) {
      timer = window.setTimeout(() => setDeleting(true), 2400);
    } else if (typed.length > 0) {
      timer = window.setTimeout(() => setTyped((value) => value.slice(0, -1)), 30);
    } else {
      timer = window.setTimeout(() => {
        setActive((current) => (current + 1) % technologies.length);
        setDeleting(false);
      }, 180);
    }

    return () => window.clearTimeout(timer);
  }, [active, deleting, item.name, reduceMotion, technologies.length, typed]);

  const selectTechnology = (index: number) => {
    setActive(index);
    setTyped("");
    setDeleting(false);
  };

  return (
    <section className="tech-typewriter-group" aria-labelledby={`tech-group-${area}`}>
      <h3 id={`tech-group-${area}`}>{title}</h3>
      <div className="tech-typewriter-stage">
        <span className="tech-typewriter-tag">{item.tag}</span>
        <div className="tech-typewriter-word font-display" aria-hidden="true"><span>{visibleName}</span><i /></div>
        <p className="sr-only">{item.name}. {item.desc}</p>
        <div className="tech-typewriter-description">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={item.name} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }} transition={{ duration: reduceMotion ? 0 : .3 }}>
              {item.desc}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="tech-typewriter-controls" aria-label={`Elegir tecnología de ${title}`}>
        {technologies.map((technology, index) => (
          <button key={technology.name} type="button" className={active === index ? "is-active" : ""} onClick={() => selectTechnology(index)} aria-label={`Mostrar ${technology.name}`} aria-pressed={active === index}><span /></button>
        ))}
      </div>
    </section>
  );
}

function MobileTechTypewriter({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="tech-typewriter-mobile relative z-10 overflow-hidden py-20 lg:hidden">
      <div className="section-inner px-5 sm:px-6">
        <h2 className="max-w-[12ch] font-display text-[clamp(2.5rem,9vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.04em]" style={{ textWrap: "balance" } as React.CSSProperties}>
          El stack detrás de cada proyecto.
        </h2>
        <p className="mt-4 max-w-[34rem] text-sm leading-6 text-[var(--ink-muted)] sm:text-base">
          Elegimos cada capa por su función: velocidad, escalabilidad, mantenimiento y una operación más simple.
        </p>

        <div className="tech-typewriter-groups">
          <TechTypewriterGroup area="frontend" title="Frontend" reduceMotion={reduceMotion} />
          <TechTypewriterGroup area="backend" title="Backend + infraestructura" reduceMotion={reduceMotion} />
        </div>
      </div>

      <style>{`
        .tech-typewriter-groups { display: grid; gap: 4.5rem; margin-top: 4rem; }
        .tech-typewriter-group { min-width: 0; }
        .tech-typewriter-group > h3 { padding-bottom: .8rem; border-bottom: 1px solid var(--border); color: var(--ink); font-size: .76rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
        .tech-typewriter-stage { min-height: 19rem; display: flex; flex-direction: column; justify-content: center; padding-block: 1.75rem; }
        .tech-typewriter-tag { color: #24d6bc; font-size: .65rem; font-weight: 650; letter-spacing: .13em; text-transform: uppercase; }
        .tech-typewriter-word { min-height: 2.15em; display: flex; align-items: center; margin-top: .7rem; color: var(--ink); font-size: clamp(2.55rem,12.5vw,4.5rem); font-weight: 650; line-height: .94; letter-spacing: -.04em; overflow-wrap: anywhere; }
        .tech-typewriter-word i { width: 2px; height: .86em; display: inline-block; margin-left: .08em; background: #24d6bc; animation: tech-caret .8s steps(1,end) infinite; }
        .tech-typewriter-description { min-height: 6.5rem; margin-top: 1.25rem; }
        .tech-typewriter-description p { max-width: 34ch; color: var(--ink-muted); font-size: .9rem; line-height: 1.65; }
        .tech-typewriter-controls { display: flex; gap: .35rem; }
        .tech-typewriter-controls button { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: transparent; }
        .tech-typewriter-controls button span { width: 2rem; height: 2px; display: block; background: rgba(255,255,255,.18); transform: scaleX(.7); transition: transform .3s ease, background .3s ease; }
        .tech-typewriter-controls button.is-active span { background: #24d6bc; transform: scaleX(1); }
        @keyframes tech-caret { 0%,48% { opacity: 1; } 49%,100% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .tech-typewriter-word i { animation: none; opacity: 1; } }
      `}</style>
    </div>
  );
}

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
        gsap.set(`[data-layer="${i}"]`, { opacity: 0, y: i === 0 ? 0 : 16, scale: i === 3 ? 0.94 : 1 });
        if (i === 3) gsap.set(`[data-layer="${i}"]`, { clipPath: "inset(0 100% 0 0 round 16px)" });
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
        if (i === 3) {
          tl.to(`[data-layer="${i}"]`, { opacity: 1, y: 0, scale: 1, clipPath: "inset(0 0% 0 0 round 16px)", duration: 1.05, ease: "power3.out" }, at + 0.25);
        } else {
          tl.to(`[data-layer="${i}"]`, { opacity: 1, y: 0, scale: 1, duration: 0.78, ease: "power3.out" }, at + 0.4);
        }
        tl.to(`[data-annotation="${i}"]`, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, at + 0.6);
      });

      ScrollTrigger.create({
        trigger: desktopRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * 5.0}`,
        pin: desktopRef.current,
        scrub: 1.5,
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onEnterBack: (self) => {
          tl.totalProgress(self.progress, false);
        },
        onUpdate: (self) => {
          if (self.direction < 0) tl.totalProgress(self.progress, false);
        },
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
      {/* Background (title phase only — card has its own background) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: ["linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"].join(","), backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 15%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 40%, black 15%, transparent 70%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "38%", transform: "translate(-50%, -50%)", width: "60%", height: "50%", background: "radial-gradient(ellipse, rgba(36,214,188,0.07) 0%, rgba(36,214,188,0.02) 45%, transparent 70%)", filter: "blur(1px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(6,6,9,0.6) 100%)" }} />
      </div>
      {/* Mobile/tablet: typewriter technology showcase */}
      <MobileTechTypewriter reduceMotion={reduceMotion} />

      {/* Desktop: pinned container (title + rising card) */}
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
                  <div className="stack-demo-screen" aria-hidden="true" style={{ position: "relative", height: "min(35vw, 410px)", background: "#f6f2e9", overflow: "hidden" }}>
                    <div ref={overlayRef} style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", backgroundColor: "rgba(0,0,0,0)", transition: "none" }} />

                    <div data-layer="0" className="demo-page-base">
                      <div className="demo-page-wash" />
                    </div>

                    <div data-layer="1" className="demo-site-nav">
                      <div className="demo-site-brand"><span>V</span><b>Valinor Studio</b></div>
                      <div className="demo-site-links"><span>Proyectos</span><span>Estudio</span><span>Contacto</span></div>
                      <div className="demo-site-nav-cta">Hablemos</div>
                    </div>

                    <div data-layer="2" className="demo-hero-copy">
                      <h3>Espacios digitales<br />con intención.</h3>
                      <p>Diseñamos experiencias claras para marcas que quieren avanzar.</p>
                      <div className="demo-hero-actions"><b>Ver proyectos</b><span>Conocer el estudio ↗</span></div>
                    </div>

                    <div data-layer="3" className="demo-hero-image">
                      <div className="demo-iridescent-art">
                        <span className="demo-art-orbit demo-art-orbit-one" />
                        <span className="demo-art-orbit demo-art-orbit-two" />
                        <span className="demo-art-core" />
                        <small>Forma · luz · movimiento</small>
                      </div>
                    </div>

                    <div data-layer="4" className="demo-work-strip">
                      <div className="demo-work-heading"><span>Trabajo seleccionado</span><b>2026</b></div>
                      <div className="demo-work-items">
                        <div><i className="demo-thumb demo-thumb-one" /><span>Atelier Norte</span></div>
                        <div><i className="demo-thumb demo-thumb-two" /><span>Casa Prisma</span></div>
                        <div><i className="demo-thumb demo-thumb-three" /><span>Materia</span></div>
                      </div>
                    </div>

                    <div data-layer="5" className="demo-system-status">
                      <div><span className="demo-status-dot" /><code>GET /proyectos</code><b>200</b></div>
                      <div><span className="demo-status-dot" /><code>PostgreSQL</code><b>12 items</b></div>
                    </div>

                    <div data-layer="6" className="demo-deploy-bar">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="m4 12 6 6 10-10" stroke="#24D6BC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Publicado en producción</span><i>valinor-studio.vercel.app</i>
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
        .demo-page-base { position: absolute; inset: 0; background: #f6f2e9; color: #171817; }
        .demo-page-wash { position: absolute; inset: 0; background: radial-gradient(circle at 76% 38%, rgba(137,218,199,.2), transparent 30%), linear-gradient(120deg, rgba(255,255,255,.72), transparent 55%); }
        .demo-site-nav { position: absolute; z-index: 2; inset: 0 0 auto; height: 46px; display: flex; align-items: center; gap: 18px; padding: 0 22px; border-bottom: 1px solid rgba(23,24,23,.1); color: #171817; }
        .demo-site-brand { display: flex; align-items: center; gap: 7px; }
        .demo-site-brand span { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: #171817; color: #fff; font-size: 8px; font-weight: 700; }
        .demo-site-brand b { font-size: 10px; font-weight: 650; letter-spacing: -.01em; }
        .demo-site-links { display: flex; gap: 14px; margin-left: auto; color: rgba(23,24,23,.55); font-size: 7px; }
        .demo-site-nav-cta { padding: 6px 10px; border-radius: 99px; background: #171817; color: #fff; font-size: 7px; font-weight: 650; }
        .demo-hero-copy { position: absolute; z-index: 2; top: 82px; left: 24px; width: 51%; color: #171817; }
        .demo-hero-copy h3 { font-size: clamp(23px,2.3vw,33px); font-weight: 650; line-height: .93; letter-spacing: -.04em; }
        .demo-hero-copy p { max-width: 29ch; margin-top: 12px; color: rgba(23,24,23,.55); font-size: 8px; line-height: 1.55; }
        .demo-hero-actions { display: flex; align-items: center; gap: 14px; margin-top: 15px; font-size: 7px; }
        .demo-hero-actions b { padding: 8px 12px; border-radius: 99px; background: #171817; color: #fff; font-weight: 600; }
        .demo-hero-actions span { color: rgba(23,24,23,.58); }
        .demo-hero-image { position: absolute; z-index: 1; top: 65px; right: 22px; width: 40%; height: 194px; overflow: hidden; border-radius: 16px; }
        .demo-iridescent-art { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(circle at 72% 22%, #fff8da 0 10%, transparent 32%), radial-gradient(circle at 20% 24%, #bdeee3 0 11%, transparent 37%), radial-gradient(circle at 72% 76%, #d8c7f2 0 15%, transparent 42%), linear-gradient(145deg,#d9ebeb,#f1dfe6 48%,#e9e2bd); }
        .demo-iridescent-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg,rgba(255,255,255,.5),transparent 35%,rgba(255,255,255,.22) 63%,transparent); }
        .demo-art-orbit { position: absolute; border: 1px solid rgba(255,255,255,.72); border-radius: 50%; transform: rotate(-24deg); }
        .demo-art-orbit-one { width: 82%; height: 40%; top: 29%; left: 9%; }
        .demo-art-orbit-two { width: 48%; height: 72%; top: 12%; left: 28%; transform: rotate(32deg); }
        .demo-art-core { position: absolute; top: 50%; left: 50%; width: 56px; height: 56px; border-radius: 42% 58% 62% 38%; background: rgba(255,255,255,.52); box-shadow: 0 12px 28px rgba(83,68,102,.14); transform: translate(-50%,-50%) rotate(18deg); }
        .demo-iridescent-art small { position: absolute; z-index: 2; right: 10px; bottom: 9px; color: rgba(23,24,23,.58); font-size: 6px; letter-spacing: .08em; text-transform: uppercase; }
        .demo-work-strip { position: absolute; z-index: 2; right: 22px; bottom: 40px; left: 22px; height: 94px; padding-top: 10px; border-top: 1px solid rgba(23,24,23,.12); color: #171817; }
        .demo-work-heading { display: flex; justify-content: space-between; color: rgba(23,24,23,.48); font-size: 6px; letter-spacing: .08em; text-transform: uppercase; }
        .demo-work-heading b { font-weight: 500; }
        .demo-work-items { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px; }
        .demo-work-items > div { min-width: 0; }
        .demo-work-items span { display: block; margin-top: 4px; font-size: 6px; font-weight: 600; }
        .demo-thumb { height: 42px; display: block; border-radius: 7px; }
        .demo-thumb-one { background: linear-gradient(135deg,#dac9bd,#f4eadf 52%,#9db9b1); }
        .demo-thumb-two { background: radial-gradient(circle at 70% 30%,#f8efd2,transparent 30%),linear-gradient(135deg,#a8d3cc,#e0c6e6); }
        .demo-thumb-three { background: linear-gradient(125deg,#25272a 0 38%,#d7c6b9 38% 62%,#b7dfd7 62%); }
        .demo-system-status { position: absolute; z-index: 7; top: 53px; right: 12px; display: grid; gap: 5px; }
        .demo-system-status > div { display: grid; grid-template-columns: 6px auto auto; gap: 6px; align-items: center; padding: 5px 7px; border: 1px solid rgba(23,24,23,.1); border-radius: 8px; background: rgba(255,255,255,.88); box-shadow: 0 6px 16px rgba(25,28,28,.08); }
        .demo-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #24b99f; }
        .demo-system-status code { color: rgba(23,24,23,.62); font-size: 6px; }
        .demo-system-status b { color: #268d7b; font-size: 6px; font-weight: 650; }
        .demo-deploy-bar { position: absolute; z-index: 8; right: 0; bottom: 0; left: 0; height: 40px; display: flex; align-items: center; justify-content: center; gap: 7px; background: #151817; color: #fff; }
        .demo-deploy-bar span { font-size: 7px; font-weight: 600; }
        .demo-deploy-bar i { color: rgba(255,255,255,.38); font-size: 6px; font-style: normal; }

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

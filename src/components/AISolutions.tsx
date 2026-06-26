"use client";

import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger);

const expo = cubicBezier(0.16, 1, 0.3, 1);

// ─── Shape generators (coords normalized to [-1, 1]) ──────────────────────

type Pt = { x: number; y: number };

function samplePts(pts: Pt[], n: number): Pt[] {
  if (pts.length === 0 || n <= 0) return [];
  if (pts.length <= n) return [...pts];
  return Array.from({ length: n }, (_, i) => pts[Math.floor((i / n) * pts.length)]);
}

function gearShape(): Pt[] {
  const pts: Pt[] = [];
  const teeth = 8, steps = teeth * 24;
  const outerR = 0.85, valleyR = 0.62, hubR = 0.30;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const frac = (i % 24) / 24;
    const r = frac < 0.22 || frac > 0.78 ? outerR : valleyR;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * hubR, y: Math.sin(a) * hubR });
  }
  return pts;
}

function networkShape(): Pt[] {
  const nodes: Pt[] = [
    { x: 0, y: 0.05 }, { x: -0.55, y: -0.48 }, { x: 0.58, y: -0.42 },
    { x: -0.68, y: 0.18 }, { x: 0.65, y: 0.28 },
    { x: 0.02, y: -0.72 }, { x: -0.28, y: 0.65 }, { x: 0.42, y: 0.60 },
  ];
  const pts: Pt[] = [];
  nodes.forEach(n => {
    pts.push(n);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push({ x: n.x + Math.cos(a) * 0.07, y: n.y + Math.sin(a) * 0.07 });
    }
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.78) {
        const s = Math.max(2, Math.floor(d * 9));
        for (let k = 1; k < s; k++) {
          const t = k / s;
          pts.push({ x: nodes[i].x + dx * t, y: nodes[i].y + dy * t });
        }
      }
    }
  }
  return pts;
}

function envelopeShape(): Pt[] {
  const pts: Pt[] = [];
  const w = 0.82, h = 0.52;
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    pts.push({ x: -w + t * 2 * w, y: -h });
    pts.push({ x: -w + t * 2 * w, y: h });
  }
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    pts.push({ x: -w, y: -h + t * 2 * h });
    pts.push({ x: w, y: -h + t * 2 * h });
  }
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    pts.push({ x: -w + t * w, y: -h + t * h });
    pts.push({ x: w - t * w, y: -h + t * h });
  }
  return pts;
}

function documentsShape(): Pt[] {
  const pts: Pt[] = [];
  [{ ox: 0.12, oy: -0.14 }, { ox: -0.08, oy: 0.08 }].forEach(({ ox, oy }) => {
    const w = 0.50, h = 0.68;
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      pts.push({ x: ox - w + t * 2 * w, y: oy - h });
      pts.push({ x: ox - w + t * 2 * w, y: oy + h });
    }
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push({ x: ox - w, y: oy - h + t * 2 * h });
      pts.push({ x: ox + w, y: oy - h + t * 2 * h });
    }
    [-0.3, -0.02, 0.26, 0.52].forEach(rowFrac => {
      const y = oy - h + (rowFrac + 0.5) * h * 2;
      for (let i = 0; i <= 8; i++) {
        pts.push({ x: ox - w * 0.7 + (i / 8) * w * 1.4, y });
      }
    });
  });
  return pts;
}

function chatBubbleShape(): Pt[] {
  const pts: Pt[] = [];
  const w = 0.78, top = -0.58, btm = 0.22;
  for (let i = 0; i <= 38; i++) {
    const t = i / 38;
    pts.push({ x: -w + t * 2 * w, y: top });
    pts.push({ x: -w + t * 2 * w, y: btm });
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push({ x: -w, y: top + t * (btm - top) });
    pts.push({ x: w, y: top + t * (btm - top) });
  }
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    pts.push({ x: -0.15 + t * (-0.52 + 0.15), y: btm + t * (0.70 - btm) });
    pts.push({ x: -0.52 + t * (0.0 + 0.52), y: 0.70 - t * (0.70 - btm) });
  }
  [-0.28, 0, 0.28].forEach(dotX => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      pts.push({ x: dotX + Math.cos(a) * 0.05, y: -0.18 + Math.sin(a) * 0.05 });
    }
  });
  return pts;
}

function personShape(): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * 0.22, y: -0.52 + Math.sin(a) * 0.22 });
  }
  for (let i = 0; i <= 14; i++) pts.push({ x: 0, y: -0.28 + (i / 14) * 0.52 });
  for (let i = 0; i <= 30; i++) {
    const a = Math.PI * 0.08 + (i / 30) * Math.PI * 0.84;
    pts.push({ x: Math.cos(a) * 0.62, y: 0.1 + Math.sin(a) * 0.42 });
  }
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    pts.push({ x: -0.58 + t * 0.12, y: 0.1 + t * 0.5 });
    pts.push({ x: 0.58 - t * 0.12, y: 0.1 + t * 0.5 });
  }
  return pts;
}

function chartShape(): Pt[] {
  const pts: Pt[] = [];
  const ox = -0.70, oy = 0.68;
  for (let i = 0; i <= 32; i++) pts.push({ x: ox + (i / 32) * 1.52, y: oy });
  for (let i = 0; i <= 32; i++) pts.push({ x: ox, y: oy - (i / 32) * 1.48 });
  [{ x: -0.52, h: 0.38 }, { x: -0.18, h: 0.62 }, { x: 0.16, h: 0.88 }, { x: 0.50, h: 1.20 }].forEach(({ x, h }) => {
    const bw = 0.20;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push({ x, y: oy - t * h });
      pts.push({ x: x + bw, y: oy - t * h });
    }
    for (let i = 0; i <= 6; i++) pts.push({ x: x + (i / 6) * bw, y: oy - h });
  });
  return pts;
}

function loopShape(): Pt[] {
  const pts: Pt[] = [];
  const r = 0.68, gapStart = -0.18, gapEnd = 0.18;
  const arcSpan = Math.PI * 2 - (gapEnd - gapStart);
  for (let i = 0; i <= 62; i++) {
    const a = gapEnd + (i / 62) * arcSpan;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  const endA = gapEnd + arcSpan;
  const ax = Math.cos(endA) * r, ay = Math.sin(endA) * r;
  const tx = -Math.sin(endA), ty = Math.cos(endA);
  const al = 0.28;
  for (let i = 0; i <= 10; i++) {
    const f = 1 - i / 10;
    pts.push({ x: ax + (tx * al - ty * al * 0.6) * f, y: ay + (ty * al + tx * al * 0.6) * f });
    pts.push({ x: ax + (tx * al + ty * al * 0.6) * f, y: ay + (ty * al - tx * al * 0.6) * f });
  }
  return pts;
}

// ─── Particle canvas ───────────────────────────────────────────────────────

const CANVAS_SIZE = 300;
const PARTICLE_COUNT = 550;

interface ParticleCanvasProps {
  shapeFn: () => Pt[];
  reduce: boolean;
}

function ParticleCanvas({ shapeFn, reduce }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width  = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width  = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(dpr, dpr);

    const cx = CANVAS_SIZE / 2, cy = CANVAS_SIZE / 2, radius = CANVAS_SIZE / 2 - 8;
    const FOV = 2.2; // perspectiva: mayor = menos distorsión

    const particles = samplePts(shapeFn(), PARTICLE_COUNT).map(pt => ({
      nx: pt.x,                             // home X normalizado [-1, 1]
      ny: pt.y,                             // home Y normalizado [-1, 1]
      nz: (Math.random() - 0.5) * 0.28,    // profundidad aleatoria
      x:  cx + pt.x * radius + (Math.random() - 0.5) * 16,
      y:  cy + pt.y * radius + (Math.random() - 0.5) * 16,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
      size:  1.1 + Math.random() * 1.0,
    }));

    if (reduce) {
      // Dibuja estático con leve perspectiva en ángulo fijo
      const angle = 0.4;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      particles.forEach(p => {
        const rx = p.nx * cos - p.nz * sin;
        const rz = p.nx * sin + p.nz * cos;
        const persp = FOV / (FOV + rz);
        ctx.globalAlpha = 0.4 + 0.4 * persp;
        ctx.beginPath();
        ctx.arc(cx + rx * radius * persp, cy + p.ny * radius * persp, Math.max(0.3, 1.5 * persp), 0, Math.PI * 2);
        ctx.fillStyle = "#24D6BC";
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      return;
    }

    const t0 = performance.now();

    function frame(now: number) {
      if (!ctx) return;
      const t        = (now - t0) / 1000;
      const angle    = t * 0.22; // rotación lenta sobre eje Y
      const cos      = Math.cos(angle);
      const sin      = Math.sin(angle);
      const spring   = 0.058;
      const noiseAmp = 1.4;
      const friction = 0.80;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Ordenar por Z rotado (painters algorithm: los más lejanos primero)
      const sorted = particles.map(p => {
        const rz = p.nx * sin + p.nz * cos;
        return { p, rz };
      }).sort((a, b) => a.rz - b.rz);

      sorted.forEach(({ p, rz }) => {
        const rx    = p.nx * cos - p.nz * sin;
        const persp = FOV / (FOV + rz);

        const tx = cx + rx * radius * persp + Math.sin(t * 1.15 + p.phase) * noiseAmp * persp;
        const ty = cy + p.ny * radius * persp + Math.cos(t * 0.88 + p.phase * 1.3) * noiseAmp * persp;

        p.vx = (p.vx + (tx - p.x) * spring) * friction;
        p.vy = (p.vy + (ty - p.y) * spring) * friction;
        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = 0.32 + 0.52 * persp; // más oscuro en profundidad
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, p.size * persp), 0, Math.PI * 2);
        ctx.fillStyle = "#24D6BC";
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ─── Data ─────────────────────────────────────────────────────────────────

const services: { label: string; sub: string; shapeFn: () => Pt[] }[] = [
  { label: "Automatización administrativa",  sub: "Procesos manuales que se ejecutan solos",          shapeFn: gearShape       },
  { label: "Asistentes de conocimiento",     sub: "Tu empresa responde con su propio contexto",        shapeFn: networkShape    },
  { label: "Automatización de emails",       sub: "Bandejas gestionadas sin intervención humana",      shapeFn: envelopeShape   },
  { label: "Procesamiento de documentos",    sub: "PDFs y formularios procesados al instante",         shapeFn: documentsShape  },
  { label: "Automatización de WhatsApp",     sub: "Respuestas y flujos en el canal más usado",         shapeFn: chatBubbleShape },
  { label: "Asistentes para RRHH",           sub: "Onboarding, consultas y procesos internos",         shapeFn: personShape     },
  { label: "Asistentes comerciales",         sub: "Seguimiento, calificación y propuestas",            shapeFn: chartShape      },
  { label: "Automatización de tareas",       sub: "Cualquier flujo que se repite, automatizado",       shapeFn: loopShape       },
];

const NAVBAR_H = 72;

// ─── Section ───────────────────────────────────────────────────────────────

export default function AISolutions() {
  const ref            = useRef<HTMLElement | null>(null);
  const pinRef         = useRef<HTMLDivElement>(null);
  const itemRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const barFillRef     = useRef<HTMLDivElement>(null);
  const counterRef     = useRef<HTMLSpanElement>(null);
  const footerRef      = useRef<HTMLDivElement>(null);
  const footerWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const inView         = useInView(ref, { once: true, margin: "-6% 0px" });
  const reduce         = useReducedMotion() ?? false;

  useEffect(() => {
    if (reduce) return;

    const pin   = pinRef.current;
    const items = itemRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (!pin || items.length !== services.length) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      const tweens = items.map(item =>
        gsap.fromTo(item,
          { y: 40, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: item, start: "top 88%" },
          }
        )
      );
      return () => {
        tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
        items.forEach(item => gsap.set(item, { clearProps: "all" }));
      };
    }

    // ── Desktop: pinned horizontal sequence ────────────────────────────────
    const N       = services.length;
    const pinH    = window.innerHeight - NAVBAR_H;
    const barFill = barFillRef.current;
    const counter = counterRef.current;

    gsap.set(pin, { height: pinH, overflow: "hidden" });
    items.forEach((item, i) => {
      gsap.set(item, { position: "absolute", inset: 0, xPercent: i === 0 ? 0 : 100 });
    });

    // Timeline: each service gets 1 unit of dwell, transitions take 1 unit
    // Structure: [dwell 0] [trans 0→1] [dwell 1] [trans 1→2] ... [dwell N-1]
    const tl = gsap.timeline();
    for (let i = 0; i < N - 1; i++) {
      const transStart = i * 2 + 1;
      tl.to(items[i],         { xPercent: -100, ease: "power2.inOut", duration: 1 }, transStart);
      tl.fromTo(items[i + 1], { xPercent: 100 }, { xPercent: 0, ease: "power2.inOut", duration: 1 }, transStart);
    }

    // totalDur = (N-1)*2 + 1 = 15 for N=8
    const totalDur   = (N - 1) * 2 + 1;
    const scrollUnit = window.innerHeight * 0.55;

    const st = ScrollTrigger.create({
      trigger: pin,
      pin: true,
      pinSpacing: true,
      start: `top top+=${NAVBAR_H}`,
      end: `+=${totalDur * scrollUnit}`,
      scrub: 1,
      animation: tl,
      onUpdate(self) {
        if (barFill) gsap.set(barFill, { scaleX: self.progress });
        if (counter) {
          const t = self.progress * totalDur;
          const idx = Math.min(Math.floor(t / 2), N - 1);
          counter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
        }
      },
    });

    return () => {
      st.kill();
      gsap.set(pin, { clearProps: "height,overflow" });
      items.forEach(item => gsap.set(item, { clearProps: "all" }));
      if (barFill) gsap.set(barFill, { scaleX: 0 });
      if (counter) counter.textContent = `01 / ${String(N).padStart(2, "0")}`;
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const container = footerRef.current;
    const words = footerWordsRef.current.filter((el): el is HTMLSpanElement => !!el);
    if (!container || !words.length) return;

    const tl = gsap.timeline();
    tl.to(words, { color: "rgba(255,255,255,0.82)", stagger: 1, duration: 0.8, ease: "none" });
    tl.to({}, { duration: 4 }); // pausa después de revelar todo

    // Pin el texto en pantalla mientras se revelan las palabras
    const st = ScrollTrigger.create({
      trigger: container,
      pin: true,
      pinSpacing: true,
      animation: tl,
      start: `center center`,
      end: `+=${window.innerHeight * 8}`,
      scrub: 1,
    });

    return () => {
      st.kill();
      gsap.set(words, { clearProps: "color" });
    };
  }, [reduce]);

  return (
    <section
      ref={ref}
      id="servicios-ai"
      style={{ background: "#07080d", paddingTop: "clamp(9rem, 18vw, 14rem)" }}
    >
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: expo }}
        style={{
          padding: "0 clamp(1.5rem, 6vw, 5rem)",
          marginBottom: "clamp(3rem, 7vw, 5rem)",
        }}
      >
        <p style={{
          fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#24D6BC", marginBottom: "1.25rem",
        }}>
          Inteligencia Artificial
        </p>
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(4rem, 10.5vw, 16rem)",
            fontWeight: 600, letterSpacing: "-0.045em",
            color: "rgba(255,255,255,0.95)", lineHeight: 0.95,
          }}
        >
          Tu equipo<br />hace más.{" "}
          <span style={{ color: "rgba(255,255,255,0.22)" }}>
            El trabajo<br />no se acumula.
          </span>
        </h2>
      </motion.div>

      {/* Pinned service sequence */}
      <div ref={pinRef} style={{ position: "relative" }}>
        {services.map((s, i) => (
          <div
            key={s.label}
            ref={el => { itemRefs.current[i] = el; }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "clamp(2rem, 5vw, 6rem)",
              padding: "clamp(2rem, 4vw, 4rem) clamp(1.5rem, 6vw, 5rem)",
            }}
          >
            {/* Left: counter + name + sub */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.7rem", letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.22)",
                display: "block",
                marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
              }}>
                {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(2.5rem, 5.5vw, 7rem)",
                  fontWeight: 600, letterSpacing: "-0.04em",
                  color: "rgba(255,255,255,0.92)", lineHeight: 1.0,
                  marginBottom: "1.5rem",
                }}
              >
                {s.label}
              </h3>
              <p style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
                color: "rgba(255,255,255,0.38)", lineHeight: 1.65,
                maxWidth: "38ch", margin: 0,
              }}>
                {s.sub}
              </p>
            </div>

            {/* Right: particle canvas — oculto en mobile */}
            <div className="hidden sm:block" style={{ flexShrink: 0 }}>
              <ParticleCanvas shapeFn={s.shapeFn} reduce={reduce} />
            </div>
          </div>
        ))}

        {/* Progress bar — visible solo en desktop (dentro del pin) */}
        <div className="hidden md:flex" style={{
          position: "absolute",
          bottom: "clamp(1.5rem, 3vw, 2.5rem)",
          left: "clamp(1.5rem, 6vw, 5rem)",
          right: "clamp(1.5rem, 6vw, 5rem)",
          alignItems: "center",
          gap: "1.25rem",
        }}>
          <div style={{
            flex: 1,
            height: "1px",
            background: "rgba(255,255,255,0.08)",
            position: "relative",
          }}>
            <div
              ref={barFillRef}
              style={{
                position: "absolute",
                inset: 0,
                background: "#24D6BC",
                transformOrigin: "left center",
                transform: "scaleX(0)",
              }}
            />
          </div>
          <span
            ref={counterRef}
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.32)",
              flexShrink: 0,
            }}
          >
            01 / 08
          </span>
        </div>
      </div>

      {/* Footer — palabra por palabra revelada al scrollear */}
      <div
        ref={footerRef}
        style={{
          padding: "clamp(6rem, 12vw, 10rem) clamp(1.5rem, 6vw, 5rem)",
          textAlign: "center",
        }}
      >
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: "clamp(1.5rem, 2.8vw, 3.2rem)",
          fontWeight: 300,
          lineHeight: 1.5,
          letterSpacing: "-0.01em",
          maxWidth: "26ch",
          margin: "0 auto",
        }}>
          {"No vendemos \"IA por moda\". Cada implementación empieza por entender qué tarea consume más tiempo en tu equipo, y termina con una solución que podés medir, ajustar y escalar.".split(" ").map((word, i) => (
            <span
              key={i}
              ref={el => { footerWordsRef.current[i] = el; }}
              style={{ color: "rgba(255,255,255,0.12)" }}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

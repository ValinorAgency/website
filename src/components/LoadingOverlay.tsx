"use client";
import { useEffect, useState } from "react"

// Presupuesto total ~650ms (conteo + salida) para que el loader sea una
// transición breve, no una espera. No depende de imágenes, fuentes, WebGL
// ni APIs: es puramente temporizado, así que nunca puede quedar colgado
// esperando un recurso real.
const COUNT_DURATION = 380;
const EXIT_DURATION = 260;
// Cuánto tarda, dentro de la salida, en dejar de bloquear clics: no es 0ms
// (para no permitir clics accidentales mientras el overlay todavía cubre
// visualmente la pantalla) ni el final completo de la salida (para no
// bloquear más de lo necesario).
const POINTER_RELEASE_DELAY = 120;
// Backstop determinista: pase lo que pase (una pestaña en segundo plano que
// pausa requestAnimationFrame, por ejemplo), el overlay nunca permanece más
// que esto.
const SAFETY_MAX_MS = COUNT_DURATION + EXIT_DURATION + 200;
// Con prefers-reduced-motion, la salida se reduce casi a cero.
const REDUCED_EXIT_DURATION = 60;

function ease(t: number) {
  // Fast start, very slow end — feels like a real async load
  return t < 0.6
    ? (t / 0.6) * 0.72
    : 0.72 + ((t - 0.6) / 0.4) * 0.28;
}

const CORNERS = [
  { top: 28, left: 28, borderTop: true, borderLeft: true },
  { top: 28, right: 28, borderTop: true, borderRight: true },
  { bottom: 28, left: 28, borderBottom: true, borderLeft: true },
  { bottom: 28, right: 28, borderBottom: true, borderRight: true },
] as const;

export default function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [gone, setGone] = useState(false);
  const [exitDurationMs, setExitDurationMs] = useState(EXIT_DURATION);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const countMs = reduceMotion ? 0 : COUNT_DURATION;
    const exitMs = reduceMotion ? REDUCED_EXIT_DURATION : EXIT_DURATION;
    const pointerDelay = reduceMotion ? 0 : POINTER_RELEASE_DELAY;

    let raf = 0;
    let start: number | null = null;
    let hasExited = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Bloquea el scroll de fondo solo mientras el overlay cubre la pantalla.
    const previousOverflow = document.body.style.overflow;
    let scrollLocked = true;
    document.body.style.overflow = "hidden";
    const releaseScroll = () => {
      if (!scrollLocked) return;
      document.body.style.overflow = previousOverflow;
      scrollLocked = false;
    };

    const beginExit = () => {
      if (hasExited) return;
      hasExited = true;
      setExitDurationMs(exitMs);
      setExiting(true);
      releaseScroll();
      document.documentElement.dataset.heroRevealed = "true";
      window.dispatchEvent(new CustomEvent("valinor:hero-reveal"));
      timers.push(setTimeout(() => setInteractive(true), pointerDelay));
      timers.push(setTimeout(() => setGone(true), exitMs));
    };

    // Todo el flujo pasa por requestAnimationFrame (incluso con countMs=0,
    // que llega a t=1 en el primer frame): así ningún setState corre de
    // forma síncrona en el cuerpo del efecto.
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = countMs === 0 ? 1 : Math.min((now - start) / countMs, 1);
      setProgress(Math.round(ease(t) * 100));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        beginExit();
      }
    };
    raf = requestAnimationFrame(tick);

    // Si por lo que sea el flujo normal nunca dispara (pestaña en segundo
    // plano, error, etc.), este límite fuerza igual el reveal del hero y el
    // desmontaje del overlay.
    timers.push(
      setTimeout(() => {
        beginExit();
        releaseScroll();
        setGone(true);
      }, SAFETY_MAX_MS),
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      releaseScroll();
    };
  }, []);

  if (gone) return null;

  const exitTransition = `opacity ${exitDurationMs}ms cubic-bezier(0.4,0,0.2,1), clip-path ${exitDurationMs}ms cubic-bezier(0.76,0,0.24,1)`;
  const logoTransition = `transform ${exitDurationMs}ms cubic-bezier(0.76,0,0.24,1), opacity ${Math.min(exitDurationMs, 220)}ms ease, filter ${exitDurationMs}ms ease`;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#060609",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: interactive ? "none" : "all",
        opacity: exiting ? 0 : 1,
        clipPath: exiting ? "circle(0% at 50% 50%)" : "circle(72% at 50% 50%)",
        transition: exiting ? exitTransition : "none",
      }}
    >
      {/* dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 0.8px, transparent 0.8px)",
        backgroundSize: "4px 4px",
      }} />

      {/* corner marks */}
      {CORNERS.map((c, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 18, height: 18,
          top: "top" in c ? c.top : undefined,
          bottom: "bottom" in c ? c.bottom : undefined,
          left: "left" in c ? c.left : undefined,
          right: "right" in c ? c.right : undefined,
          borderTop:    "borderTop"    in c && c.borderTop    ? "1px solid rgba(255,255,255,0.13)" : undefined,
          borderBottom: "borderBottom" in c && c.borderBottom ? "1px solid rgba(255,255,255,0.13)" : undefined,
          borderLeft:   "borderLeft"   in c && c.borderLeft   ? "1px solid rgba(255,255,255,0.13)" : undefined,
          borderRight:  "borderRight"  in c && c.borderRight  ? "1px solid rgba(255,255,255,0.13)" : undefined,
        }} />
      ))}

      {/* Logo — green watermark behind the counter */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: exiting ? "translate(-50%, -50%) scale(0.48)" : "translate(-50%, -50%) scale(1)",
          width: "clamp(280px, 58vw, 720px)",
          aspectRatio: "1 / 1",
          background: "#24D6BC",
          opacity: exiting ? 0 : 0.28,
          filter: exiting ? "drop-shadow(0 0 80px rgba(36,214,188,0.9)) blur(8px)" : "drop-shadow(0 0 32px rgba(36,214,188,0.22))",
          maskImage: "url('/logoValinor-removebg.png')",
          WebkitMaskImage: "url('/logoValinor-removebg.png')",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          pointerEvents: "none",
          userSelect: "none",
          transition: logoTransition,
        }}
      />
      <div style={{ position: "relative", textAlign: "center" }}>
        {/* Counter */}
        <div style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "clamp(4.5rem, 13vw, 8.5rem)",
          fontWeight: 200,
          letterSpacing: "-0.04em",
          color: "#EEEEF2",
          lineHeight: 1,
          userSelect: "none",
          tabularNums: true,
        } as React.CSSProperties}>
          {String(progress).padStart(2, "0")}
          <span style={{ fontSize: "0.36em", opacity: 0.3, marginLeft: "0.1em", verticalAlign: "middle" }}>%</span>
        </div>

        {/* Label */}
        <div style={{
          marginTop: 24,
          fontSize: "0.58rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}>
          Iniciando
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0,
        height: 1,
        width: "100%",
        transform: `scaleX(${progress / 100})`,
        transformOrigin: "left center",
        background: "linear-gradient(90deg, rgba(36,214,188,0.15) 0%, #24D6BC 55%, rgba(36,214,188,0.5) 100%)",
        transition: "transform 0.06s linear",
      }} />
    </div>
  );
}

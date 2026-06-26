"use client";
import { useEffect, useState } from "react"

const DURATION = 2800;

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
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / DURATION, 1);
      setProgress(Math.round(ease(t) * 100));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => setGone(true), 750);
        }, 280);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;

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
        pointerEvents: exiting ? "none" : "all",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.04)" : "scale(1)",
        transition: exiting
          ? "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)"
          : "none",
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

      {/* Logo — large watermark behind the counter */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logoValinor-removebg.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(280px, 58vw, 720px)",
          opacity: 0.13,
          pointerEvents: "none",
          userSelect: "none",
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
        width: `${progress}%`,
        background: "linear-gradient(90deg, rgba(36,214,188,0.15) 0%, #24D6BC 55%, rgba(36,214,188,0.5) 100%)",
        transition: "width 0.06s linear",
      }} />
    </div>
  );
}

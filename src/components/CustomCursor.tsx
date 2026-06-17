"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const elRef      = useRef<HTMLDivElement>(null);
  const posRef     = useRef({ x: -200, y: -200 });
  const aimRef     = useRef({ x: -200, y: -200 });
  const sizeRef    = useRef(14);
  const sizeTgtRef = useRef(14);
  const visibleRef = useRef(false);
  const rafRef     = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = elRef.current;
    if (!dot) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      aimRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        // Snap on first move so cursor doesn't travel from (-200,-200)
        posRef.current = { x: e.clientX, y: e.clientY };
        visibleRef.current = true;
        dot.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      dot.style.opacity = "0";
    };

    const onEnter = () => {
      visibleRef.current = true;
      dot.style.opacity = "1";
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      const isInteractive = el.closest(
        "a, button, label, [role='button'], .hero-cta-btn, input, select, textarea"
      );
      sizeTgtRef.current = isInteractive ? 40 : 14;
    };

    const tick = () => {
      posRef.current.x = lerp(posRef.current.x, aimRef.current.x, 0.13);
      posRef.current.y = lerp(posRef.current.y, aimRef.current.y, 0.13);
      sizeRef.current  = lerp(sizeRef.current, sizeTgtRef.current, 0.11);

      const s = sizeRef.current;
      dot.style.transform = `translate(${posRef.current.x - s * 0.5}px, ${posRef.current.y - s * 0.5}px)`;
      dot.style.width  = `${s}px`;
      dot.style.height = `${s}px`;

      rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    document.addEventListener("mouseenter", onEnter, { passive: true });
    document.addEventListener("mouseover",  onOver,  { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover",  onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={elRef}
      aria-hidden
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         14,
        height:        14,
        borderRadius:  "50%",
        background:    "white",
        mixBlendMode:  "difference",
        pointerEvents: "none",
        zIndex:        999999,
        willChange:    "transform, width, height",
        opacity:       0,
        transition:    "opacity 0.25s",
      }}
    />
  );
}

"use client";

import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

export default function CustomSolutions() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      id="soluciones"
      style={{
        background: "#07080d",
        padding: "clamp(7rem, 15vw, 12rem) clamp(1.5rem, 6vw, 5rem)",
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: expo }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(3.5rem, 9vw, 6rem)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "rgba(255,255,255,0.95)",
            lineHeight: 0.98,
          }}
        >
          Tu operación<br />más clara.{" "}
          <span style={{ color: "rgba(255,255,255,0.22)" }}>
            Una solución<br />hecha para encajar.
          </span>
        </h2>
      </motion.div>
    </section>
  );
}
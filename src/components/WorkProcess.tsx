"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const steps = [
  {
    n: "01",
    title: "Reunión inicial",
    desc: "30 minutos. Sin PowerPoints. Entendemos tu negocio, tu problema real y qué resultado esperás.",
    duration: "Día 1",
  },
  {
    n: "02",
    title: "Análisis y propuesta",
    desc: "Definimos el alcance, la arquitectura técnica y el presupuesto fijo. Sin estimaciones vagas.",
    duration: "Días 2–4",
  },
  {
    n: "03",
    title: "Diseño & prototipo",
    desc: "Wireframes y diseño visual antes de escribir una sola línea de código. Aprobás lo que vas a ver.",
    duration: "Semana 1–2",
  },
  {
    n: "04",
    title: "Desarrollo iterativo",
    desc: "Sprints cortos con entregas visibles. Cada viernes tenés algo nuevo para revisar y aprobar.",
    duration: "Semana 2–N",
  },
  {
    n: "05",
    title: "Pruebas & revisión",
    desc: "Testing exhaustivo en múltiples dispositivos. Corrección de todo lo que reportes antes del cierre.",
    duration: "Última semana",
  },
  {
    n: "06",
    title: "Deploy & entrega",
    desc: "Salida a producción, capacitación de tu equipo y documentación técnica. El código es tuyo.",
    duration: "Día final",
  },
];

export default function WorkProcess() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="proceso" className="section-shell" style={{ background: "var(--surface)" }}>
      <div className="section-inner">

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: expo }}
          style={{ marginBottom: "3.5rem" }}
        >
          <p style={{
            fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#24D6BC", marginBottom: "0.75rem",
          }}>
            Proceso
          </p>
          <h2 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            lineHeight: 1.15,
          }}>
            Cómo trabajamos juntos
          </h2>
        </motion.div>

        {/* Steps */}
        <div style={{ position: "relative" }}>
          {/* vertical line desktop */}
          <div style={{
            position: "absolute",
            left: "calc(2.5rem)",
            top: 0, bottom: 0,
            width: 1,
            background: "linear-gradient(180deg, transparent, var(--border) 8%, var(--border) 92%, transparent)",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={reduce ? false : { opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: expo }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "5rem 1fr",
                  gap: "0 2rem",
                  paddingBottom: i < steps.length - 1 ? "2.5rem" : 0,
                  position: "relative",
                }}
              >
                {/* Step indicator */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0.1rem" }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: i === 0 ? "rgba(36,214,188,0.15)" : "var(--surface-raised)",
                    border: `1px solid ${i === 0 ? "rgba(36,214,188,0.4)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    zIndex: 1,
                    position: "relative",
                  }}>
                    <span style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.6rem",
                      color: i === 0 ? "#24D6BC" : "var(--ink-faint)",
                      letterSpacing: "0.04em",
                    }}>
                      {s.n}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ paddingTop: "0.35rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.4rem" }}>
                    <h3 style={{
                      fontSize: "0.95rem", fontWeight: 600,
                      color: "var(--ink)", letterSpacing: "-0.015em",
                    }}>
                      {s.title}
                    </h3>
                    <span style={{
                      fontSize: "0.6rem", letterSpacing: "0.1em",
                      color: "var(--ink-faint)",
                      fontFamily: "ui-monospace, monospace",
                    }}>
                      {s.duration}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.65 }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

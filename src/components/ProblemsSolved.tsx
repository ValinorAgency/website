"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const problems = [
  {
    problem: "Mi web tiene visitas pero no convierte.",
    solution: "Rediseñamos el flujo de conversión: propuesta de valor clara, CTA visible, velocidad óptima y copy que elimina dudas antes de que aparezcan.",
  },
  {
    problem: "Tengo procesos manuales que consumen tiempo.",
    solution: "Mapeamos el proceso, identificamos los pasos automatizables y construimos el flujo. La primera semana ya ves el ahorro.",
  },
  {
    problem: "Mi equipo usa cinco herramientas que no se hablan entre sí.",
    solution: "Conectamos tus sistemas con integraciones a medida: sin migrar todo, sin fricción, con los datos en un solo lugar.",
  },
  {
    problem: "Quiero usar IA pero no sé por dónde empezar.",
    solution: "Hacemos un diagnóstico de tu operación, identificamos el caso de uso con mayor impacto y lo construimos en menos de dos semanas.",
  },
  {
    problem: "Contraté a alguien antes y el resultado fue una decepción.",
    solution: "Trabajamos con entregables visibles desde la semana uno. Definimos qué vas a ver, cuándo y qué pasa si no cumplimos.",
  },
  {
    problem: "No tengo presupuesto para un equipo tech interno.",
    solution: "Te damos el resultado de un equipo senior sin los costos fijos: desarrollo, diseño, IA y soporte bajo un mismo paraguas.",
  },
];

export default function ProblemsSolved() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="problemas" className="section-shell">
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
            Diagnóstico
          </p>
          <h2 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            lineHeight: 1.15,
          }}>
            ¿Te suena alguno de estos?
          </h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.06 * i, ease: expo }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                padding: "1.75rem 0",
                borderBottom: "1px solid var(--border)",
                alignItems: "start",
              }}
              className="problems-row"
            >
              {/* Problem */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                <span style={{
                  flexShrink: 0,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: "0.1rem",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "block" }} />
                </span>
                <p style={{
                  fontSize: "0.95rem",
                  color: "var(--ink-muted)",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}>
                  "{item.problem}"
                </p>
              </div>

              {/* Solution */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                <span style={{
                  flexShrink: 0,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: "rgba(36,214,188,0.12)",
                  border: "1px solid rgba(36,214,188,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: "0.1rem",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#24D6BC", display: "block" }} />
                </span>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)", lineHeight: 1.65 }}>
                  {item.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .problems-row { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
        }
      `}</style>
    </section>
  );
}

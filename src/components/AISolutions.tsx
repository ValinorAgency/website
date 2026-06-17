"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const solutions = [
  {
    title: "Agentes conversacionales",
    desc: "Chatbots con memoria, contexto y criterio. Responden, califican y derivan con la lógica de tu negocio — no con respuestas genéricas.",
    icon: "💬",
  },
  {
    title: "Automatización de procesos",
    desc: "Eliminamos tareas repetitivas: clasificación de emails, generación de reportes, respuestas automáticas, flujos de aprobación.",
    icon: "⚙️",
  },
  {
    title: "Integración con modelos LLM",
    desc: "Conectamos GPT-4, Claude, Gemini y otros modelos a tus sistemas existentes con control de costos y trazabilidad.",
    icon: "🔗",
  },
  {
    title: "Análisis de datos con IA",
    desc: "Convertimos tus datos en decisiones. Resúmenes automáticos, detección de patrones, alertas inteligentes.",
    icon: "📊",
  },
];

export default function AISolutions() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="ia" className="section-shell" style={{ background: "var(--surface)" }}>
      <div className="section-inner">

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem" }}>

          {/* Header */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: expo }}
            style={{ maxWidth: "36rem" }}
          >
            <p style={{
              fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#24D6BC", marginBottom: "0.75rem",
            }}>
              Inteligencia Artificial
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}>
              IA que trabaja con vos, no en lugar tuyo
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-muted)", lineHeight: 1.7 }}>
              No vendemos magia. Construimos automatizaciones reales con criterio, supervisión humana y resultados medibles desde la primera semana.
            </p>
          </motion.div>

          {/* Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 24rem), 1fr))",
            gap: "1rem",
          }}>
            {solutions.map((s, i) => (
              <motion.div
                key={s.title}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + 0.08 * i, ease: expo }}
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{s.icon}</span>
                <h3 style={{
                  fontSize: "0.95rem", fontWeight: 600,
                  color: "var(--ink)", letterSpacing: "-0.015em",
                }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom stat strip */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: expo }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            {[
              { n: "< 2 sem", label: "primer agente en producción" },
              { n: "100%", label: "código tuyo, sin vendor lock-in" },
              { n: "24/7", label: "disponibilidad sin costo de personal" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: "1.5rem", fontWeight: 700,
                  color: "#24D6BC", letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  {n}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "0.3rem" }}>
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

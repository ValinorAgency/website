"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const reasons = [
  {
    n: "01",
    title: "Entrega en semanas, no meses",
    desc: "Iteramos rápido. Tenés algo funcional para revisar en los primeros 7 días. Sin promesas vacías de roadmaps eternos.",
  },
  {
    n: "02",
    title: "Código tuyo, sin dependencias",
    desc: "Todo lo que construimos es tuyo al 100%. Sin licencias ocultas, sin lock-in, sin sorpresas cuando quieras cambiar algo.",
  },
  {
    n: "03",
    title: "Tecnología de vanguardia",
    desc: "Usamos Next.js, TypeScript y los mejores modelos de IA del momento. No PHP de 2012, no WordPress con 47 plugins.",
  },
  {
    n: "04",
    title: "Un solo punto de contacto",
    desc: "No tercerizamos ni pasamos tickets a un helpdesk. Hablás con quien desarrolla. Respuesta real en menos de 24h.",
  },
  {
    n: "05",
    title: "Precio justo sin sorpresas",
    desc: "Presupuesto fijo antes de arrancar. Si algo demora más, es nuestro problema, no el tuyo.",
  },
  {
    n: "06",
    title: "Resultado medible",
    desc: "Definimos KPIs concretos antes de empezar: velocidad, conversión, tiempo ahorrado. Así podés evaluar el ROI real.",
  },
];

export default function WhyUs() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="por-que" className="section-shell">
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
            Por qué Valinor
          </p>
          <h2 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            lineHeight: 1.15,
            maxWidth: "24ch",
          }}>
            Lo que nos diferencia
          </h2>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))",
          gap: "2rem 3rem",
        }}>
          {reasons.map((r, i) => (
            <motion.div
              key={r.n}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.07 * i, ease: expo }}
            >
              <div style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.6rem",
                color: "#24D6BC",
                letterSpacing: "0.12em",
                marginBottom: "0.6rem",
              }}>
                {r.n}
              </div>
              <h3 style={{
                fontSize: "0.95rem", fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.015em",
                marginBottom: "0.5rem",
              }}>
                {r.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.65 }}>
                {r.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

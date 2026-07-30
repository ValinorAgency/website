"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const values = [
  { label: "Claridad", desc: "Decimos lo que podemos hacer, cuándo y cuánto cuesta. Sin ambigüedades." },
  { label: "Criterio", desc: "No ejecutamos pedidos a ciegas. Si algo no tiene sentido, lo decimos." },
  { label: "Velocidad", desc: "Respetamos tu tiempo. Entregamos rápido sin sacrificar calidad." },
  { label: "Compromiso", desc: "El proyecto no termina en el deploy. Estamos cuando algo falla." },
];

export default function AboutUs() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="nosotros" className="section-shell">
      <div className="section-inner">

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "start",
        }}
          className="about-grid"
        >
          {/* Left */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: expo }}
          >
            <p style={{
              fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#24D6BC", marginBottom: "0.75rem",
            }}>
              Sobre nosotros
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}>
              Diseñamos soluciones digitales que se entienden y funcionan
            </h2>
            <p style={{
              fontSize: "0.95rem", color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: "1rem",
            }}>
              Valinor Agency es un equipo especializado en diseño y desarrollo web. Trabajamos con empresas, profesionales y equipos que necesitan presentar mejor su propuesta, vender online o resolver una operación con una herramienta propia.
            </p>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-muted)", lineHeight: 1.75 }}>
              Cada proyecto empieza por entender el negocio y el resultado esperado. A partir de eso proponemos una solución concreta, la validamos en etapas y la construimos para que sea clara, mantenible y fácil de usar.
            </p>

            <div style={{
              marginTop: "2.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
            }}>
              {[
                { n: "A medida", label: "alcance y diseño" },
                { n: "Por etapas", label: "entregas revisables" },
                { n: "Propio", label: "código entregable" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div style={{
                    fontSize: "1.75rem", fontWeight: 700,
                    color: "var(--ink)", letterSpacing: "-0.04em", lineHeight: 1,
                  }}>
                    {n}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--ink-faint)", marginTop: "0.35rem" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — values */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: expo }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {values.map((v, i) => (
              <motion.div
                key={v.label}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.2 + 0.08 * i, ease: expo }}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  color: "#24D6BC", letterSpacing: "0.04em",
                  marginBottom: "0.4rem",
                }}>
                  {v.label}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>

      <style>{`
        @media (max-width: 720px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
}

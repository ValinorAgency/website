"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const projects = [
  {
    name: "Plataforma de reservas",
    category: "Web App",
    desc: "Sistema de reservas con panel de administración, notificaciones automáticas y pagos integrados.",
    tags: ["Next.js", "Stripe", "Supabase"],
    accent: "#24D6BC",
  },
  {
    name: "Agente de ventas IA",
    category: "Automatización",
    desc: "Chatbot que califica leads, responde preguntas frecuentes y agenda reuniones sin intervención humana.",
    tags: ["Claude API", "Zapier", "CRM"],
    accent: "#3279F9",
  },
  {
    name: "E-commerce premium",
    category: "Tienda online",
    desc: "Tienda de moda con catálogo dinámico, filtros avanzados, checkout optimizado y panel de gestión.",
    tags: ["Next.js", "Shopify", "Figma"],
    accent: "#24D6BC",
  },
  {
    name: "Dashboard operativo",
    category: "Plataforma interna",
    desc: "Panel de control para equipo de 40 personas: tareas, métricas, aprobaciones y reportes en tiempo real.",
    tags: ["React", "PostgreSQL", "Auth"],
    accent: "#3279F9",
  },
  {
    name: "Landing de lanzamiento",
    category: "Landing Page",
    desc: "Página de preventa con lista de espera, animaciones 3D y 18% de conversión en la primera semana.",
    tags: ["Next.js", "Framer", "GSAP"],
    accent: "#24D6BC",
  },
  {
    name: "Procesador de documentos",
    category: "IA aplicada",
    desc: "Sistema que lee, clasifica y extrae información de facturas y contratos con 97% de precisión.",
    tags: ["GPT-4", "Python", "AWS"],
    accent: "#3279F9",
  },
];

export default function Portfolio() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="portfolio" className="section-shell" style={{ backgroundColor: "var(--surface)" }}>
      <div className="section-inner">

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: expo }}
          style={{ marginBottom: "3.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}
        >
          <div>
            <p style={{
              fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#24D6BC", marginBottom: "0.75rem",
            }}>
              Portfolio
            </p>
            <h2 className="font-display" style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.15,
            }}>
              Trabajos realizados
            </h2>
          </div>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 22rem), 1fr))",
          gap: "1rem",
        }}>
          {projects.map((p, i) => (
            <motion.article
              key={p.name}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.07 * i, ease: expo }}
              className="card-pad"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${p.accent}, transparent)`,
                opacity: 0.6,
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase",
                  color: p.accent, opacity: 0.8,
                }}>
                  {p.category}
                </span>
                <span style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink-faint)",
                  fontSize: "0.75rem",
                }}>
                  ↗
                </span>
              </div>

              <h3 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.02em",
              }}>
                {p.name}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.65, flex: 1 }}>
                {p.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {p.tags.map(t => (
                  <span key={t} style={{
                    fontSize: "0.62rem", padding: "0.2rem 0.55rem",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--ink-faint)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}

"use client";
import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const services = [
  {
    num: "01",
    title: "Landing Pages",
    desc: "Páginas de alta conversión con diseño premium y copy que comunica valor en segundos. Optimizadas para velocidad y SEO.",
    tags: ["Next.js", "SEO", "Performance"],
  },
  {
    num: "02",
    title: "Sitios Corporativos",
    desc: "Presencia web profesional que construye autoridad y confianza. Diseño a medida, sin templates genéricos.",
    tags: ["Diseño custom", "CMS", "Multilenguaje"],
  },
  {
    num: "03",
    title: "E-Commerce",
    desc: "Tiendas online preparadas para vender desde el día uno. Catálogos, pagos, inventario y panel de gestión.",
    tags: ["Pagos", "Inventario", "Panel admin"],
  },
  {
    num: "04",
    title: "Plataformas & Dashboards",
    desc: "Aplicaciones web internas para gestionar operaciones: CRMs, portales de clientes, herramientas de equipo.",
    tags: ["Auth", "Roles", "APIs"],
  },
  {
    num: "05",
    title: "Integraciones & APIs",
    desc: "Conectamos tu web con cualquier servicio externo: ERPs, CRMs, pasarelas de pago, herramientas de terceros.",
    tags: ["REST", "Webhooks", "OAuth"],
  },
  {
    num: "06",
    title: "Mantenimiento & Soporte",
    desc: "Tu web actualizada, segura y en funcionamiento. Monitoreo, actualizaciones y soporte técnico continuo.",
    tags: ["Uptime", "Updates", "Seguridad"],
  },
];

export default function WebServices() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="servicios" className="section-shell">
      <div className="section-inner">

        {/* Header */}
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
            Desarrollo Web
          </p>
          <h2 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            maxWidth: "28ch",
            lineHeight: 1.15,
          }}>
            Todo lo que tu negocio necesita online
          </h2>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 22rem), 1fr))",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {services.map((s, i) => (
            <motion.div
              key={s.num}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 * i, ease: expo }}
              style={{
                background: "var(--surface)",
                padding: "1.75rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                minHeight: "10rem",
              }}
            >
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em",
              }}>
                {s.num}
              </span>
              <h3 style={{
                fontSize: "1.05rem", fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.02em",
              }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)", lineHeight: 1.65, flex: 1 }}>
                {s.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                {s.tags.map(t => (
                  <span key={t} style={{
                    fontSize: "0.62rem", letterSpacing: "0.08em",
                    padding: "0.2rem 0.6rem",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--ink-faint)",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

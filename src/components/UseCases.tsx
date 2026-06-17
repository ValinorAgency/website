"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import AnimatedDots from "./AnimatedDots";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const cases = [
  {
    tag: "Conversión",
    title: "Landings que venden una idea compleja en segundos.",
    description:
      "Para lanzamientos, servicios premium y sitios comerciales donde la prioridad es generar confianza rápida y una ruta clara hacia la acción.",
    bullets: ["Propuesta clara", "CTA visible", "Lectura móvil limpia"],
    visual: "conversion",
  },
  {
    tag: "Operación",
    title: "Herramientas internas que ordenan trabajo sin sentirse pesadas.",
    description:
      "Paneles y flujos para equipos que necesitan menos fricción, menos hojas sueltas y más trazabilidad en lo que hacen todos los días.",
    bullets: ["Estados visibles", "Tareas vivas", "Menos tareas manuales"],
    visual: "operations",
  },
  {
    tag: "IA aplicada",
    title: "Agentes que responden, clasifican y derivan con criterio.",
    description:
      "Automatizaciones para soporte, ventas y seguimiento que combinan reglas, contexto y verificación para no perder control.",
    bullets: ["Contexto útil", "Escalado humano", "Chequeo previo"],
    visual: "agents",
  },
];

function CaseVisual({
  kind,
  reduceMotion,
}: {
  kind: string;
  reduceMotion: boolean;
}) {
  if (kind === "conversion") {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
        <AnimatedDots variant="panel" className="opacity-35" />

        <div className="relative space-y-4">
          <div className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--ink-faint)]">Hero</p>
                <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                  Un mensaje que se entiende al instante.
                </p>
              </div>
              <div className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-white">
                Live
              </div>
            </div>
            <div className="mt-4 h-2 w-4/5 rounded-full bg-[var(--surface)]" />
            <div className="mt-2 h-2 w-2/3 rounded-full bg-[var(--surface)]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
              <p className="text-xs text-[var(--ink-faint)]">CTA</p>
              <div className="mt-3 h-10 rounded-full bg-[var(--brand)]" />
            </div>
            <div className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
              <p className="text-xs text-[var(--ink-faint)]">Lectura</p>
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded-full bg-[var(--surface)]" />
                <div className="h-2 w-4/5 rounded-full bg-[var(--surface)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "operations") {
    return (
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
        <div className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
          <p className="text-xs font-medium text-[var(--ink-faint)]">Pipeline</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Captura", color: "var(--brand)" },
              { label: "Clasificación", color: "var(--accent)" },
              { label: "Aprobación", color: "var(--accent-2)" },
            ].map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--surface)] shadow-[var(--shadow-xs)]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: step.color }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--ink)]">{step.label}</p>
                    <span className="text-xs text-[var(--ink-faint)]">
                      {index === 0 ? "12s" : index === 1 ? "38s" : "manual"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--surface)]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${66 - index * 14}%`,
                        background: "var(--brand)",
                      }}
                      initial={reduceMotion ? false : { scaleX: 0, originX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.12 * index, ease: expo }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
      <div className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--ink-faint)]">Agente activo</p>
            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">Soporte AI</p>
          </div>
          <span className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-white">
            Online
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[
            "Lee la consulta",
            "Busca contexto",
            "Responde o deriva",
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[0.72rem] font-semibold text-white"
                        style={{
                          background:
                            index === 0
                              ? "var(--brand)"
                              : index === 1
                                ? "var(--accent)"
                                : "var(--accent-2)",
                        }}
                      >
                        {index + 1}
                      </span>
              <span className="text-sm text-[var(--ink-muted)]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UseCases() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section id="casos-de-uso" className="section-shell">
      <div className="section-inner">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: expo }}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <h2
            className="font-display text-[clamp(2.2rem,4.8vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.05em]"
            style={{ textWrap: "balance" }}
          >
            Casos de uso que se sienten concretos, no conceptuales.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
            Cada bloque traduce una necesidad común en una experiencia visual
            clara, útil y fácil de discutir con un equipo real.
          </p>
        </motion.div>

        <div className="space-y-5">
          {cases.map((item, index) => {
            const reverse = index % 2 === 1;

            return (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.6,
                  delay: index * 0.08,
                  ease: expo,
                }}
                className="surface-card rounded-[1.75rem] p-5 sm:p-7"
              >
                <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                  <div className={reverse ? "lg:order-2" : ""}>
                    <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--ink-muted)]">
                      {item.tag}
                    </div>
                    <h3 className="mt-4 max-w-xl font-display text-[clamp(1.7rem,3vw,2.5rem)] font-semibold leading-[1.03] tracking-[-0.04em]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-prose text-pretty text-base leading-7 text-[var(--ink-muted)]">
                      {item.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.bullets.map((bullet) => (
                        <span
                          key={bullet}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)] shadow-[var(--shadow-xs)]"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={reverse ? "lg:order-1" : ""}>
                    <CaseVisual kind={item.visual} reduceMotion={reduceMotion} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

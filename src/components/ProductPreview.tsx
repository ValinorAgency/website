"use client";

import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import AnimatedDots from "./AnimatedDots"

const expo = cubicBezier(0.16, 1, 0.3, 1);

const sidebarItems = [
  { label: "Resumen", active: true },
  { label: "Aplicaciones", active: false },
  { label: "Proceso", active: false },
  { label: "Verificación", active: false },
];

const checkpoints = [
  "Brief validado",
  "Copy revisado",
  "UI aprobada",
  "Deploy listo",
];

const activity = [
  { label: "Consultas", value: "24", delta: "Este mes" },
  { label: "Tareas automáticas", value: "892", delta: "esta semana" },
  { label: "Verificaciones", value: "41", delta: "sin fricción" },
];

export default function ProductPreview() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduceMotion = useReducedMotion();

  const rise = {
    hidden: { opacity: 0, y: 18 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: reduceMotion ? 0 : 0.55, ease: expo },
    }),
  };

  return (
    <section id="trabajos" ref={ref} className="section-shell relative overflow-hidden">
      <div className="section-inner">
        <motion.div
          custom={0}
          variants={rise}
          initial={reduceMotion ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink-muted)] shadow-[var(--shadow-xs)]">
            Trabajos
          </div>
          <h2
            className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em]"
            style={{ textWrap: "balance" }}
          >
            Una muestra de trabajos reales, no solo pantallas.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
            La vista funciona como una demo de entregables: web, aplicaciones y
            verificación en una sola pieza para comunicar criterio técnico sin
            recargar.
          </p>
        </motion.div>

        <motion.div
          custom={1}
          variants={rise}
          initial={reduceMotion ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
          className="surface-card relative overflow-hidden rounded-[1.75rem]"
        >
          <AnimatedDots variant="panel" className="opacity-60" />

          <div className="relative border-b border-[var(--border)] bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[var(--ink)]" />
                <span className="h-3 w-3 rounded-full bg-[var(--ink-faint)]" />
                <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" />
              </div>
              <div className="mx-auto rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[0.72rem] text-[var(--ink-faint)]">
                valinor.agency/workspace
              </div>
            </div>
          </div>

          <div className="relative grid min-h-[34rem] lg:grid-cols-[17rem_1fr_18rem]">
            <aside className="border-b border-[var(--border)] bg-white p-4 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
                  SL
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">Valinor Agency</p>
                  <p className="text-xs text-[var(--ink-faint)]">Webs + aplicaciones</p>
                </div>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl px-3 py-2.5 text-sm font-medium ${
                      item.active
                        ? "bg-white text-[var(--ink)] shadow-[var(--shadow-xs)]"
                        : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-medium text-[var(--ink-faint)]">
                  Estado del proyecto
                </p>
                <div className="mt-3 space-y-2">
                  {checkpoints.map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-semibold text-white"
                        style={{
                          background: index < 3 ? "var(--brand)" : "var(--border-strong)",
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-[var(--ink-muted)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="border-b border-[var(--border)] bg-white p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--ink-faint)]">Editor</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    Landing Valinor
                  </p>
                </div>
                <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--ink-muted)]">
                  Revisión en vivo
                </span>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-md">
                    <span className="inline-flex rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white">
                      Caso real
                    </span>
                    <h3 className="mt-4 font-display text-[clamp(1.8rem,3vw,2.65rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                      Sitios que explican valor antes de pedir una reunión.
                    </h3>
                  </div>
                  <div className="hidden min-w-28 rounded-2xl border border-[var(--border)] bg-white p-3 text-right sm:block">
                    <p className="text-[0.7rem] text-[var(--ink-faint)]">Impacto</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--ink)]">34.2%</p>
                    <p className="text-xs text-[var(--ink-muted)]">+6% vs. base</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {activity.map((item, index) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[var(--border)] bg-white p-4"
                    >
                      <p className="text-xs text-[var(--ink-faint)]">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">{item.delta}</p>
                      <motion.div
                        className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]"
                        initial={reduceMotion ? false : { opacity: 0.5 }}
                        animate={
                          inView
                            ? {
                                opacity: 1,
                              }
                            : {}
                        }
                      >
                        <motion.span
                          className="block h-full rounded-full"
                          style={{
                            width: `${72 - index * 11}%`,
                            background: "var(--brand)",
                          }}
                          initial={reduceMotion ? false : { scaleX: 0, originX: 0 }}
                          animate={inView ? { scaleX: 1 } : {}}
                          transition={{
                            duration: reduceMotion ? 0 : 0.6,
                            delay: 0.35 + index * 0.08,
                            ease: expo,
                          }}
                        />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <aside className="bg-white p-4 sm:p-5">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
                <p className="text-xs font-medium text-[var(--ink-faint)]">Verificación</p>
                <div className="mt-4 space-y-3">
                  {[
                    "Copy y jerarquía aprobados",
                    "Componentes listos para mobile",
                    "Motion reducido en accesibilidad",
                  ].map((item, index) => (
                    <div key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] font-semibold text-white"
                        style={{
                          background:
                            index === 0
                              ? "var(--brand)"
                              : index === 1
                                ? "var(--accent)"
                                : "var(--accent-2)",
                        }}
                      >
                        ✓
                      </span>
                      <p className="text-sm leading-6 text-[var(--ink-muted)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-medium text-[var(--ink-faint)]">Entrega</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                  Diseño, desarrollo y criterio técnico en una sola entrega.
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                  Pensado para que el visitante entienda qué haces, por qué confiar y
                  cómo avanzar.
                </p>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

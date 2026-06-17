"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion"
import AnimatedDots from "./AnimatedDots"

const expo = cubicBezier(0.16, 1, 0.3, 1);

export default function FinalCTA() {  
  const reduceMotion = useReducedMotion();

  return (
    <section id="contacto" className="section-shell relative overflow-hidden">
      <div className="section-inner">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: expo }}
          className="surface-card relative overflow-hidden rounded-[1.75rem] px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
        >
          <AnimatedDots variant="panel" className="opacity-55" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink-muted)] shadow-[var(--shadow-xs)]">
              Contacto
            </div>

            <h2
              className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.01] tracking-[-0.05em]"
              style={{ textWrap: "balance" }}
            >
              Si querés una landing seria, empecemos por el alcance.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
              Definimos el alcance, el timing y el nivel de automatización que
              necesitás. Sin promesas grandilocuentes, sin ruido visual y con una
              propuesta clara desde el primer intercambio.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hola@valinor.agency?subject=Consulta%20Valinor%20Agency"
                className="pill-button-dark w-full sm:w-auto"
              >
                Agendar llamada
              </a>
              <a href="#casos-de-uso" className="pill-button-light w-full sm:w-auto">
                Ver casos de uso
              </a>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { label: "Respuesta", value: "< 24h hábiles" },
                { label: "Primer paso", value: "Definir alcance" },
                { label: "Contacto", value: "hola@valinor.agency" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-[var(--border)] bg-white px-4 py-4 text-left shadow-[var(--shadow-xs)]"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

              <p className="mt-6 text-sm text-[var(--ink-faint)]">
              Respuesta en menos de 24 horas hábiles.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

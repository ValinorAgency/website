"use client";

import { AnimatePresence, cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);
const reasons = [
  { title: "Entregas visibles", desc: "Dividimos el proyecto en instancias revisables para validar decisiones antes de la entrega final." },
  { title: "Código realmente tuyo", desc: "Entregamos el código y evitamos dependencias que compliquen mantener o ampliar la solución." },
  { title: "Tecnología con criterio", desc: "Elegimos la base técnica según el objetivo, el presupuesto y la operación del equipo." },
  { title: "Contacto directo", desc: "Hablás con quienes diseñan y desarrollan. Menos intermediarios, menos contexto perdido." },
  { title: "Alcance transparente", desc: "Acordamos entregables y condiciones antes de empezar. Si cambia algo, lo evaluamos con claridad." },
  { title: "Resultados observables", desc: "Definimos qué debería mejorar para revisar el resultado con evidencia, no con promesas." },
] as const;

export default function WhyUs() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: .35, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [cycleSeed, setCycleSeed] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % reasons.length), 4800);
    return () => window.clearInterval(timer);
  }, [inView, reduce, cycleSeed]);

  const selectReason = (index: number) => {
    setActive(index);
    setCycleSeed((seed) => seed + 1);
  };

  return (
    <section ref={ref} id="por-que" className="why-light section-shell">
      <div className="section-inner">
        <motion.div className="why-light-heading" initial={reduce ? false : { opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7, ease: expo }}>
          <h2 className="font-display">Lo que cambia cuando trabajamos juntos.</h2>
          <p>Una forma de trabajar pensada para reducir incertidumbre y mantener las decisiones cerca del negocio.</p>
        </motion.div>

        <div className="why-options" role="radiogroup" aria-label="Diferenciales de nuestra forma de trabajo">
          {reasons.map((reason, index) => {
            const isActive = active === index;
            return (
              <motion.div
                key={reason.title}
                className={`why-option-row${isActive ? " is-active" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: .4, delay: index * .045, ease: expo }}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-controls={`why-detail-${index}`}
                  className="why-option"
                  onClick={() => selectReason(index)}
                >
                  <span className="why-radio" aria-hidden="true"><i /></span>
                  <span>{reason.title}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      id={`why-detail-${index}`}
                      className="why-inline-detail"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ height: { duration: reduce ? 0 : .42, ease: expo }, opacity: { duration: reduce ? 0 : .26 } }}
                    >
                      <p>{reason.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .why-light { padding-block: clamp(7rem,12vw,11rem); background: #f5f5f2; color: #111; }
        .why-light-heading { display: grid; grid-template-columns: minmax(0,1.25fr) minmax(17rem,.75fr); gap: 2rem; align-items: end; margin-bottom: clamp(3rem,6vw,5rem); }
        .why-light-heading h2 { max-width: 14ch; color: #111; font-size: clamp(2.7rem,6vw,5.5rem); line-height: .98; letter-spacing: -.04em; font-weight: 800; text-transform: uppercase; }
        .why-light-heading p { max-width: 36ch; color: rgba(17,17,17,.58); line-height: 1.7; }
        .why-options { width: min(100%, 52rem); display: flex; flex-direction: column; }
        .why-option-row { border-bottom: 1px solid rgba(17,17,17,.1); }
        .why-option-row:first-child { border-top: 1px solid rgba(17,17,17,.1); }
        .why-option { width: 100%; min-height: 4.5rem; display: grid; grid-template-columns: 1.25rem 1fr; gap: 1rem; align-items: center; padding: .9rem 0; border: 0; background: transparent; color: rgba(17,17,17,.42); text-align: left; font-size: clamp(1.05rem,1.8vw,1.4rem); font-weight: 580; transition: color .3s ease; }
        .why-option:hover, .why-option-row.is-active .why-option { color: #111; }
        .why-option:focus-visible { outline: 2px solid #111; outline-offset: 4px; border-radius: 4px; }
        .why-radio { width: 1.05rem; height: 1.05rem; display: grid; place-items: center; border: 1px solid rgba(17,17,17,.32); border-radius: 50%; transition: border-color .3s ease, transform .3s cubic-bezier(.16,1,.3,1); }
        .why-radio i { width: .48rem; height: .48rem; border-radius: 50%; background: #111; opacity: 0; transform: scale(.25); transition: opacity .25s ease, transform .35s cubic-bezier(.16,1,.3,1); }
        .why-option-row.is-active .why-radio { border-color: #111; transform: scale(1.06); }
        .why-option-row.is-active .why-radio i { opacity: 1; transform: scale(1); }
        .why-inline-detail { overflow: hidden; }
        .why-inline-detail p { max-width: 46rem; padding: 0 0 1.5rem 2.25rem; color: rgba(17,17,17,.62); font-size: .92rem; line-height: 1.65; }

        @media (max-width: 760px) {
          .why-light { padding-block: 6rem; }
          .why-light-heading { grid-template-columns: 1fr; gap: 1.25rem; margin-bottom: 2.75rem; }
          .why-light-heading h2 { font-size: clamp(2.3rem,11vw,3.5rem); }
          .why-option { min-height: 4rem; font-size: 1.05rem; }
          .why-inline-detail p { padding: 0 0 1.25rem 2.05rem; font-size: .86rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .why-option, .why-radio, .why-radio i { transition: none; }
        }
      `}</style>
    </section>
  );
}
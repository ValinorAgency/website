"use client";

import { AnimatePresence, cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);
const steps = [
  { title: "Reunión inicial", desc: "Entendemos el negocio, la necesidad concreta y qué resultado esperás. Sin presentaciones innecesarias.", output: "Objetivo y contexto compartidos" },
  { title: "Análisis y propuesta", desc: "Definimos alcance, entregables, prioridades, base técnica y un presupuesto claro para avanzar.", output: "Plan de proyecto y presupuesto" },
  { title: "Diseño y prototipo", desc: "Ordenamos recorridos, contenidos e interfaz antes de desarrollar para que puedas validar cómo funcionará.", output: "Prototipo navegable" },
  { title: "Desarrollo iterativo", desc: "Construimos por etapas visibles. Revisamos avances y ajustamos decisiones con el producto funcionando.", output: "Entregas parciales revisables" },
  { title: "Pruebas y revisión", desc: "Comprobamos funcionamiento, responsive, accesibilidad y casos críticos antes de la salida pública.", output: "Versión lista para publicar" },
  { title: "Deploy y entrega", desc: "Publicamos, documentamos y acompañamos la puesta en marcha para que el equipo pueda operar la solución.", output: "Producto online y documentación" },
] as const;

function hoverStrength(index: number, hovered: number | null) {
  if (hovered === null) return 0;
  const distance = Math.abs(index - hovered);
  if (distance === 0) return 1;
  if (distance === 1) return .42;
  if (distance === 2) return .12;
  return 0;
}

export default function WorkProcess() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selected = steps[active];

  return (
    <section ref={ref} id="proceso" className="process-section section-shell">
      <div className="section-inner">
        <motion.div className="process-heading" initial={reduce ? false : { opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7, ease: expo }}>
          <h2 className="font-display">Cómo trabajamos juntos.</h2>
          <p>Un proceso visible, con decisiones concretas y espacio para revisar antes de avanzar.</p>
        </motion.div>

        <div className={`process-mobile${mobileOpen ? " is-open" : ""}`}>
          <div className="process-mobile-header">
            <span>{mobileOpen ? "6 etapas" : "Tocá la primera tarjeta para ver las etapas"}</span>
            <AnimatePresence>
              {mobileOpen && (
                <motion.button type="button" onClick={() => setMobileOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-label="Volver a apilar las etapas">
                  Apilar
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <ol className="process-mobile-stack" aria-label="Etapas del proyecto">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                className="process-mobile-card"
                layout={!reduce}
                animate={{ scale: mobileOpen ? 1 : 1 - index * .018, opacity: mobileOpen || index < 3 ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : .55, delay: reduce ? 0 : mobileOpen ? index * .045 : (steps.length - index) * .02, ease: expo }}
                style={{ zIndex: steps.length - index }}
              >
                <button type="button" onClick={() => { if (!mobileOpen) setMobileOpen(true); }} aria-expanded={mobileOpen}>
                  <span className="process-mobile-number">0{index + 1}</span>
                  <strong>{step.title}</strong>
                  {index === 0 && !mobileOpen && <span className="process-mobile-open-icon" aria-hidden="true">＋</span>}
                </button>
                <AnimatePresence initial={false}>
                  {mobileOpen && (
                    <motion.div className="process-mobile-content" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : .38, ease: expo }}>
                      <p>{step.desc}</p>
                      <span>Resultado</span>
                      <b>{step.output}</b>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="process-layout">
          <nav className="process-sidebar" aria-label="Etapas del proyecto">
            <ul className="process-sidebar-list" onPointerLeave={() => setHovered(null)}>
              {steps.map((step, index) => {
                const strength = hoverStrength(index, hovered);
                return (
                  <li key={step.title} className="process-sidebar-item">
                    <motion.span className="process-marker" aria-hidden animate={{ scaleX: .7 + strength * .55, backgroundColor: strength > .25 ? "#24d6bc" : "#4a4a52" }} transition={{ duration: reduce ? 0 : .38, ease: expo }} />
                    <motion.button type="button" className="process-sidebar-button" aria-pressed={active === index} animate={{ x: reduce ? 0 : strength * 48, color: strength > .25 ? "#24d6bc" : "#9a9aa5" }} transition={{ duration: reduce ? 0 : .48, ease: expo }} onPointerEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => setActive(index)}>
                      <span>0{index + 1}</span><strong>{step.title}</strong>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="process-detail" tabIndex={0}>
            <AnimatePresence mode="wait">
              <motion.div key={selected.title} initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: reduce ? 0 : .32, ease: expo }}>
                <h3>{selected.title}</h3><p>{selected.desc}</p>
                <div className="process-output"><span>Resultado de esta etapa</span><strong>{selected.output}</strong></div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .process-section { padding-block: clamp(8rem,13vw,12rem); background: #0b0c11; }
        .process-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; margin-bottom: clamp(3rem,6vw,5rem); }
        .process-heading h2 { color: var(--ink); font-size: clamp(2.7rem,6vw,5.5rem); line-height: .98; letter-spacing: -.04em; font-weight: 600; }
        .process-heading p { max-width: 35ch; color: var(--ink-muted); line-height: 1.7; }
        .process-layout { display: grid; grid-template-columns: minmax(20rem,.8fr) minmax(0,1.2fr); gap: clamp(3rem,8vw,8rem); align-items: center; }
        .process-sidebar { padding-left: 4.5rem; }
        .process-sidebar-list { display: flex; flex-direction: column; gap: 1.05rem; padding: 1rem 0; list-style: none; }
        .process-sidebar-item { position: relative; }
        .process-sidebar-item::before { content: ""; position: absolute; inset: -6px -48px; }
        .process-marker { position: absolute; left: -4.5rem; top: 50%; width: 3.6rem; height: 1px; transform-origin: left center; }
        .process-sidebar-item:not(:last-child)::after { content: ""; position: absolute; left: -4.5rem; top: calc(100% + .525rem); width: 1.8rem; height: 1px; background: #393941; opacity: .55; }
        .process-sidebar-button { position: relative; z-index: 1; display: inline-flex; align-items: baseline; gap: .75rem; padding: .45rem 0; border: 0; background: transparent; text-align: left; will-change: transform; }
        .process-sidebar-button span { font-size: .65rem; letter-spacing: .1em; opacity: .65; }
        .process-sidebar-button strong { font-size: clamp(1rem,1.5vw,1.25rem); font-weight: 500; }
        .process-sidebar-button:focus-visible { outline: 2px solid rgba(36,214,188,.65); outline-offset: 5px; }
        .process-detail { min-height: 27rem; display: flex; align-items: center; padding: clamp(2rem,5vw,4.5rem); border: 1px solid var(--border); border-radius: 14px; background: #111218; overflow: hidden; }
        .process-detail h3 { max-width: 12ch; color: var(--ink); font-size: clamp(2rem,4vw,4rem); line-height: 1; letter-spacing: -.035em; font-weight: 600; }
        .process-detail p { max-width: 52ch; margin-top: 1.5rem; color: var(--ink-muted); font-size: 1rem; line-height: 1.75; }
        .process-output { display: flex; flex-direction: column; gap: .35rem; margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
        .process-output span { color: var(--ink-faint); font-size: .63rem; letter-spacing: .1em; text-transform: uppercase; }
        .process-output strong { color: var(--ink); font-size: .9rem; font-weight: 500; }
        .process-mobile { display: none; }

        @media (max-width:760px) {
          .process-section { padding-block: 6rem; }
          .process-heading { align-items: start; flex-direction: column; margin-bottom: 2.5rem; }
          .process-heading h2 { font-size: clamp(2.6rem,13vw,4rem); }
          .process-layout { display: none; }
          .process-mobile { display: block; }
          .process-mobile-header { min-height: 2.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; color: var(--ink-faint); font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; }
          .process-mobile-header button { min-height: 44px; padding: 0 .5rem; border: 0; background: transparent; color: var(--ink); font-size: .72rem; text-decoration: underline; text-underline-offset: 4px; }
          .process-mobile-stack { padding: 0; list-style: none; }
          .process-mobile-card { position: relative; margin-top: -66px; overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: 14px; background: #15161c; box-shadow: 0 12px 28px rgba(0,0,0,.24); transform-origin: top center; }
          .process-mobile-card:first-child { margin-top: 0; }
          .process-mobile.is-open .process-mobile-card:not(:first-child) { margin-top: 10px; }
          .process-mobile-card > button { width: 100%; min-height: 5rem; display: grid; grid-template-columns: 2rem minmax(0,1fr) 2rem; align-items: center; gap: .4rem; padding: 1rem; border: 0; background: transparent; color: var(--ink); text-align: left; }
          .process-mobile-number { color: var(--ink-faint); font-size: .62rem; letter-spacing: .1em; }
          .process-mobile-card strong { font-size: 1.05rem; font-weight: 560; }
          .process-mobile-open-icon { justify-self: end; font-size: 1.35rem; font-weight: 300; }
          .process-mobile-content { overflow: hidden; }
          .process-mobile-content p { padding: 0 1rem 1.15rem 3.4rem; color: var(--ink-muted); font-size: .86rem; line-height: 1.6; }
          .process-mobile-content > span, .process-mobile-content > b { display: block; margin-left: 3.4rem; margin-right: 1rem; }
          .process-mobile-content > span { padding-top: .85rem; border-top: 1px solid var(--border); color: var(--ink-faint); font-size: .6rem; letter-spacing: .1em; text-transform: uppercase; }
          .process-mobile-content > b { padding: .35rem 0 1.15rem; color: var(--ink); font-size: .8rem; font-weight: 500; }
        }
      `}</style>
    </section>
  );
}
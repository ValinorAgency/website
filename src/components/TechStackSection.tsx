"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const capabilities = [
  { label: "Experiencias digitales", title: "Interfaces rápidas, claras y pensadas para convertir." },
  { label: "Sistemas sólidos", title: "Arquitecturas preparadas para crecer y mantenerse." },
  { label: "Integraciones a medida", title: "Conectamos herramientas y automatizamos tareas puntuales cuando el proyecto lo necesita." },
] as const;

const browserStates = [
  { rotateX: -4, rotateY: 10, y: -12, scale: 1.035 },
  { rotateX: 6, rotateY: -28, y: -15, scale: 1.045 },
  { rotateX: -5, rotateY: 22, y: -14, scale: 1.04 },
] as const;

function BrowserPreview({ reduceMotion, activeIndex }: { reduceMotion: boolean | null; activeIndex: number | null }) {
  const layerMotion = (delay: number, extra?: { scale?: number; x?: number }) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16, ...extra },
    whileInView: { opacity: 1, y: 0, scale: 1, x: 0 },
    viewport: { once: true, amount: 0.55 },
    transition: { duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : delay, ease: expo },
  });

  return (
    <motion.div
      className="capabilities-browser-wrap"
      initial={reduceMotion ? false : { opacity: 0, y: 50, rotateX: 7 }}
      whileInView={{ opacity: 1 }}
      animate={reduceMotion || activeIndex === null ? { y: 0, rotateX: 0, rotateY: 0, scale: 1 } : browserStates[activeIndex]}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: reduceMotion ? 0 : activeIndex === null ? 0.7 : 0.5, ease: expo }}
      data-active-capability={activeIndex === null ? "none" : activeIndex}
    >
      <div className="capabilities-browser">
        <div className="browser-chrome">
          <div className="browser-dots"><i /><i /><i /></div>
          <span>tuempresa.com</span>
        </div>
        <div className="browser-screen" aria-hidden="true">
          <div className="demo-page-wash" />
          <motion.div className="demo-site-nav" {...layerMotion(0.18)}>
            <div className="demo-site-brand"><span>V</span><b>Valinor Studio</b></div>
            <div className="demo-site-links"><span>Proyectos</span><span>Estudio</span><span>Contacto</span></div>
            <div className="demo-site-nav-cta">Hablemos</div>
          </motion.div>
          <motion.div className="demo-hero-copy" {...layerMotion(0.34, { x: -16 })}>
            <h3>Espacios digitales<br />con intención.</h3>
            <p>Diseñamos experiencias claras para marcas que quieren avanzar.</p>
            <div className="demo-hero-actions"><b>Ver proyectos</b><span>Conocer el estudio ↗</span></div>
          </motion.div>
          <motion.div className="demo-hero-image" {...layerMotion(0.5, { scale: 0.88 })}>
            <div className="demo-iridescent-art"><span className="demo-art-orbit demo-art-orbit-one" /><span className="demo-art-orbit demo-art-orbit-two" /><span className="demo-art-core" /><small>Forma · luz · movimiento</small></div>
          </motion.div>
          <motion.div className="demo-work-strip" {...layerMotion(0.66)}>
            <div className="demo-work-heading"><span>Trabajo seleccionado</span><b>2026</b></div>
            <div className="demo-work-items"><div><i className="demo-thumb demo-thumb-one" /><span>Atelier Norte</span></div><div><i className="demo-thumb demo-thumb-two" /><span>Casa Prisma</span></div><div><i className="demo-thumb demo-thumb-three" /><span>Materia</span></div></div>
          </motion.div>
          <motion.div className="demo-system-status" {...layerMotion(0.82, { x: 16 })}>
            <div><span className="demo-status-dot" /><code>GET /proyectos</code><b>200</b></div>
            <div><span className="demo-status-dot" /><code>Base de datos</code><b>Online</b></div>
          </motion.div>
          <motion.div className="demo-deploy-bar" {...layerMotion(0.98)}><span>✓</span><b>Publicado en producción</b><i>tuempresa.com</i></motion.div>
        </div>
      </div>
      <div className="browser-shadow" />
    </motion.div>
  );
}

export default function TechStackSection() {
  const reduceMotion = useReducedMotion();
  const [activeCapability, setActiveCapability] = useState<number | null>(null);

  return (
    <section id="capacidades" className="capabilities-section section-shell">
      <div className="section-inner capabilities-layout">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: expo }}
          className="capabilities-copy"
        >
          <h2 className="font-display">Tecnología actual. Criterio humano.</h2>
          <p>
            Nuestro equipo reúne especialistas en producto, diseño, frontend y backend.
            Elegimos herramientas de primer nivel para cada desafío y usamos inteligencia
            artificial para acelerar análisis, desarrollo y control de calidad.
          </p>
          <a href="#contacto">Conversemos sobre tu proyecto <span aria-hidden="true">↗</span></a>
        </motion.div>

        <BrowserPreview reduceMotion={reduceMotion} activeIndex={activeCapability} />
      </div>

      <div className="section-inner capabilities-list">
          {capabilities.map((capability, index) => (
            <motion.button
              type="button"
              key={capability.label}
              className={activeCapability === index ? "is-active" : ""}
              initial={reduceMotion ? false : { opacity: 0, x: 34 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : index * 0.09, ease: expo }}
              onPointerEnter={() => setActiveCapability(index)}
              onPointerLeave={() => setActiveCapability(null)}
              onFocus={() => setActiveCapability(index)}
              onBlur={() => setActiveCapability(null)}
              aria-pressed={activeCapability === index}
              aria-label={`${capability.label}: ${capability.title}`}
            >
              <span>0{index + 1}</span>
              <div>
                <p>{capability.label}</p>
                <h3>{capability.title}</h3>
              </div>
              <motion.i
                aria-hidden="true"
                animate={reduceMotion ? undefined : { scaleX: [0.25, 1, 0.25], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 3.6, delay: index * 0.7, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.button>
          ))}
      </div>

      <div className="capabilities-marquee" aria-hidden="true">
        <motion.div className="capabilities-marquee-track" animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
          {[0, 1].map((copy) => (
            <div className="capabilities-marquee-group" key={copy}>
              <span>DISEÑO</span><i>✳</i><span>DESARROLLO</span><i>✳</i><span>ESTRATEGIA</span><i>✳</i><span>INTEGRACIONES A MEDIDA</span><i>✳</i>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .capabilities-section { overflow: hidden; padding-block: clamp(6rem,10vw,8rem) clamp(3rem,6vw,5rem); background: #f4f4f1; color: #111; }
        .capabilities-layout { display: grid; grid-template-columns: minmax(0,.86fr) minmax(28rem,1.14fr); gap: clamp(4rem,9vw,9rem); align-items: center; perspective: 1600px; perspective-origin: 72% 44%; }
        .capabilities-copy h2 { max-width: 10ch; font-size: clamp(3rem,5.7vw,5.8rem); font-weight: 650; line-height: .94; letter-spacing: -.045em; }
        .capabilities-copy > p { max-width: 48ch; margin-top: 1.5rem; color: rgba(17,17,17,.62); font-size: 1rem; line-height: 1.75; }
        .capabilities-copy a { display: inline-flex; gap: .75rem; margin-top: 1.75rem; padding-bottom: .3rem; border-bottom: 1px solid rgba(17,17,17,.28); font-size: .86rem; font-weight: 700; }
        .capabilities-browser-wrap { position: relative; transform-style: preserve-3d; will-change: transform; }
        .capabilities-browser { overflow: hidden; border: 1px solid rgba(17,17,17,.13); border-radius: 18px; background: white; box-shadow: 0 28px 70px rgba(50,52,52,.16), 0 8px 22px rgba(50,52,52,.09); transition: border-color .35s ease, box-shadow .35s ease; }
        .capabilities-browser-wrap[data-active-capability="0"] .capabilities-browser { border-color: rgba(36,214,188,.65); box-shadow: 34px 42px 90px rgba(36,169,154,.22),0 12px 30px rgba(50,52,52,.13); }
        .capabilities-browser-wrap[data-active-capability="1"] .capabilities-browser { border-color: rgba(50,121,249,.6); box-shadow: -42px 45px 100px rgba(50,121,249,.22),0 12px 30px rgba(50,52,52,.14); }
        .capabilities-browser-wrap[data-active-capability="2"] .capabilities-browser { border-color: rgba(139,104,210,.58); box-shadow: 38px 44px 96px rgba(139,104,210,.22),0 12px 30px rgba(50,52,52,.14); }
        .browser-chrome { height: 42px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border-bottom: 1px solid rgba(17,17,17,.09); background: #f7f7f5; }
        .browser-dots { display: flex; gap: 5px; }
        .browser-dots i { width: 9px; height: 9px; border-radius: 50%; background: #ddd; }
        .browser-dots i:first-child { background: #ef8e82; }.browser-dots i:nth-child(2) { background: #edc865; }.browser-dots i:last-child { background: #70cfa5; }
        .browser-chrome > span { flex: 1; padding: 5px 12px; border: 1px solid rgba(17,17,17,.08); border-radius: 99px; background: white; color: rgba(17,17,17,.4); font-size: 9px; text-align: center; }
        .browser-screen { position: relative; height: clamp(19rem,31vw,25rem); overflow: hidden; background: #f6f2e9; }
        .browser-shadow { position: absolute; z-index: -1; right: 12%; bottom: -32px; left: 12%; height: 38px; border-radius: 50%; background: rgba(0,0,0,.16); filter: blur(20px); }
        .demo-page-wash { position: absolute; inset: 0; background: radial-gradient(circle at 76% 38%,rgba(137,218,199,.24),transparent 30%),linear-gradient(120deg,rgba(255,255,255,.75),transparent 55%); }
        .demo-site-nav { position: absolute; z-index: 2; inset: 0 0 auto; height: 44px; display: flex; align-items: center; gap: 14px; padding: 0 18px; border-bottom: 1px solid rgba(23,24,23,.1); }
        .demo-site-brand { display: flex; align-items: center; gap: 6px; }.demo-site-brand span { width: 17px; height: 17px; display: grid; place-items: center; border-radius: 50%; background: #171817; color: white; font-size: 7px; }.demo-site-brand b { font-size: 9px; }
        .demo-site-links { display: flex; gap: 11px; margin-left: auto; color: rgba(23,24,23,.52); font-size: 6px; }.demo-site-nav-cta { padding: 6px 9px; border-radius: 99px; background: #171817; color: white; font-size: 6px; }
        .demo-hero-copy { position: absolute; z-index: 2; top: 76px; left: 22px; width: 51%; }.demo-hero-copy h3 { font-size: clamp(21px,2.15vw,31px); font-weight: 650; line-height: .93; letter-spacing: -.04em; }.demo-hero-copy p { max-width: 29ch; margin-top: 10px; color: rgba(23,24,23,.55); font-size: 7px; line-height: 1.5; }
        .demo-hero-actions { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: 6px; }.demo-hero-actions b { padding: 7px 10px; border-radius: 99px; background: #171817; color: white; }.demo-hero-actions span { color: rgba(23,24,23,.55); }
        .demo-hero-image { position: absolute; z-index: 1; top: 61px; right: 18px; width: 40%; height: 47%; overflow: hidden; border-radius: 14px; }.demo-iridescent-art { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(circle at 72% 22%,#fff8da 0 10%,transparent 32%),radial-gradient(circle at 20% 24%,#bdeee3 0 11%,transparent 37%),radial-gradient(circle at 72% 76%,#d8c7f2 0 15%,transparent 42%),linear-gradient(145deg,#d9ebeb,#f1dfe6 48%,#e9e2bd); }
        .demo-iridescent-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg,rgba(255,255,255,.5),transparent 35%,rgba(255,255,255,.22) 63%,transparent); }.demo-art-orbit { position: absolute; border: 1px solid rgba(255,255,255,.72); border-radius: 50%; transform: rotate(-24deg); }.demo-art-orbit-one { width: 82%; height: 40%; top: 29%; left: 9%; }.demo-art-orbit-two { width: 48%; height: 72%; top: 12%; left: 28%; transform: rotate(32deg); }.demo-art-core { position: absolute; top: 50%; left: 50%; width: 50px; height: 50px; border-radius: 42% 58% 62% 38%; background: rgba(255,255,255,.52); transform: translate(-50%,-50%) rotate(18deg); }.demo-iridescent-art small { position: absolute; z-index: 2; right: 8px; bottom: 8px; color: rgba(23,24,23,.55); font-size: 5px; letter-spacing: .08em; text-transform: uppercase; }
        .demo-work-strip { position: absolute; z-index: 2; right: 18px; bottom: 34px; left: 18px; height: 88px; padding-top: 8px; border-top: 1px solid rgba(23,24,23,.12); }.demo-work-heading { display: flex; justify-content: space-between; color: rgba(23,24,23,.45); font-size: 5px; letter-spacing: .08em; text-transform: uppercase; }.demo-work-heading b { font-weight: 500; }.demo-work-items { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin-top: 7px; }.demo-work-items span { display: block; margin-top: 3px; font-size: 5px; font-weight: 600; }.demo-thumb { height: 38px; display: block; border-radius: 6px; }.demo-thumb-one { background: linear-gradient(135deg,#dac9bd,#f4eadf 52%,#9db9b1); }.demo-thumb-two { background: radial-gradient(circle at 70% 30%,#f8efd2,transparent 30%),linear-gradient(135deg,#a8d3cc,#e0c6e6); }.demo-thumb-three { background: linear-gradient(125deg,#25272a 0 38%,#d7c6b9 38% 62%,#b7dfd7 62%); }
        .demo-system-status { position: absolute; z-index: 7; top: 48px; right: 9px; display: grid; gap: 4px; }.demo-system-status > div { display: grid; grid-template-columns: 5px auto auto; gap: 5px; align-items: center; padding: 4px 6px; border: 1px solid rgba(23,24,23,.1); border-radius: 7px; background: rgba(255,255,255,.9); box-shadow: 0 5px 14px rgba(25,28,28,.08); }.demo-status-dot { width: 4px; height: 4px; border-radius: 50%; background: #24b99f; }.demo-system-status code,.demo-system-status b { font-size: 5px; }.demo-system-status b { color: #268d7b; }
        .demo-deploy-bar { position: absolute; z-index: 8; right: 0; bottom: 0; left: 0; height: 34px; display: flex; align-items: center; justify-content: center; gap: 6px; background: #151817; color: white; }.demo-deploy-bar span { color: #24d6bc; }.demo-deploy-bar b { font-size: 6px; }.demo-deploy-bar i { color: rgba(255,255,255,.38); font-size: 5px; font-style: normal; }
        .capabilities-list { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: clamp(1.5rem,4vw,4rem); margin-top: clamp(4rem,7vw,6rem); border-top: 1px solid rgba(17,17,17,.16); }
        .capabilities-list button { position: relative; isolation: isolate; display: grid; grid-template-columns: 2rem minmax(0,1fr); gap: 1rem; padding: 1.5rem .75rem; overflow: hidden; border: 0; border-bottom: 1px solid rgba(17,17,17,.16); border-radius: 12px; background: transparent; color: #111; text-align: left; cursor: pointer; transition: color .3s ease, transform .5s cubic-bezier(.16,1,.3,1), box-shadow .4s ease; }
        .capabilities-list button::before { content: ""; position: absolute; z-index: -1; inset: 0; border-radius: inherit; background: #111318; transform: translateY(104%); transition: transform .55s cubic-bezier(.16,1,.3,1); }
        .capabilities-list button > * { position: relative; z-index: 1; }
        .capabilities-list button:hover,.capabilities-list button.is-active { color: #f5f5f2; transform: translateY(-10px) scale(1.025); box-shadow: 0 20px 44px rgba(17,19,24,.2); }
        .capabilities-list button:hover::before,.capabilities-list button.is-active::before { transform: translateY(0); }
        .capabilities-list button:focus-visible { outline: 2px solid #24b99f; outline-offset: 5px; }
        .capabilities-list button > span { padding-top: .2rem; color: rgba(17,17,17,.36); font-size: .6rem; letter-spacing: .1em; transition: color .3s ease, transform .45s cubic-bezier(.16,1,.3,1); }
        .capabilities-list button:hover > span,.capabilities-list button.is-active > span { color: #24d6bc; transform: translateX(5px); }
        .capabilities-list p { color: rgba(17,17,17,.48); font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .capabilities-list button:hover p,.capabilities-list button.is-active p { color: rgba(255,255,255,.55); }
        .capabilities-list h3 { max-width: 25ch; margin-top: .55rem; font-size: clamp(1.25rem,2vw,1.85rem); font-weight: 560; line-height: 1.18; letter-spacing: -.025em; transition: transform .45s cubic-bezier(.16,1,.3,1); }
        .capabilities-list button:hover h3,.capabilities-list button.is-active h3 { transform: translateX(7px); }
        .capabilities-list i { position: absolute; right: 0; bottom: -1px; left: 3rem; height: 2px; background: #24d6bc; transform-origin: left; }
        .capabilities-marquee { margin-top: clamp(4rem,8vw,7rem); overflow: hidden; border-block: 1px solid rgba(17,17,17,.14); }
        .capabilities-marquee-track { display: flex; width: max-content; align-items: center; white-space: nowrap; will-change: transform; }
        .capabilities-marquee-group { min-width: 100vw; flex: 0 0 auto; display: flex; align-items: center; justify-content: space-around; padding: 1.1rem 0; }
        .capabilities-marquee span { font-family: var(--font-display-stack); font-size: clamp(1.1rem,2vw,1.65rem); font-weight: 650; letter-spacing: -.02em; }
        .capabilities-marquee i { margin-inline: 1.25rem; color: #24a99a; font-size: .75rem; font-style: normal; }
        @media (max-width: 800px) {
          .capabilities-layout { grid-template-columns: 1fr; gap: 3.5rem; }
          .capabilities-copy h2 { font-size: clamp(2.8rem,13vw,4.5rem); }
          .capabilities-browser-wrap { margin-inline: -.25rem; }
          .browser-screen { height: min(76vw,22rem); }
          .demo-site-links { display: none; }
          .capabilities-list { grid-template-columns: 1fr; gap: 0; margin-top: 4.5rem; }
          .capabilities-list button { padding-block: 1.25rem; }
        }
        @media (max-width: 420px) { .demo-hero-copy { top: 64px; left: 14px; }.demo-hero-copy h3 { font-size: 18px; }.demo-hero-image { top: 54px; right: 12px; }.demo-work-strip { right: 12px; left: 12px; }.demo-system-status { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          .capabilities-list i { transform: none !important; opacity: 1 !important; }
        }
      `}</style>
    </section>
  );
}

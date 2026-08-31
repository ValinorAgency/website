"use client";

import { gsap } from "gsap";
import { AnimatePresence, cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { type MouseEvent, useEffect, useRef, useState } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);
const projects = [
  {
    name: "Sitios web y landing pages",
    purpose: "Presentar tu empresa, marca o producto con una experiencia clara y profesional, o comunicar una propuesta puntual enfocada en captar consultas.",
    capabilities: "Diseño de interfaces, arquitectura de contenido, SEO técnico básico y formularios de contacto.",
    palette: "radial-gradient(circle at 18% 16%, #fff7dc 0 18%, transparent 44%), radial-gradient(circle at 82% 24%, #d9eef8 0 14%, transparent 43%), radial-gradient(circle at 56% 82%, #edddf7 0 18%, transparent 46%), #e9efe9",
  },
  {
    name: "Tiendas online",
    purpose: "Vender productos o servicios con un catálogo propio, un checkout optimizado y un panel para gestionar pedidos y stock.",
    capabilities: "Arquitectura de catálogo, integraciones de pago y paneles de administración de pedidos.",
    palette: "radial-gradient(circle at 20% 22%, #e0f2ec 0 18%, transparent 45%), radial-gradient(circle at 78% 18%, #f6e2df 0 16%, transparent 44%), radial-gradient(circle at 62% 82%, #e3e5fa 0 18%, transparent 48%), #eef0e8",
  },
  {
    name: "Aplicaciones web",
    purpose: "Resolver flujos específicos del negocio, como reservas, portales o seguimiento comercial, con una herramienta a medida.",
    capabilities: "Diseño de flujos de usuario, autenticación, integraciones y paneles de administración.",
    palette: "radial-gradient(circle at 16% 18%, #f8e5ee 0 17%, transparent 43%), radial-gradient(circle at 84% 28%, #e4f3df 0 16%, transparent 46%), radial-gradient(circle at 52% 84%, #f7edcf 0 18%, transparent 48%), #ecebf3",
  },
  {
    name: "Dashboards y visualización de datos",
    purpose: "Reunir métricas, estados y alertas clave en una vista clara para tomar decisiones con información actualizada.",
    capabilities: "Visualización de datos, alertas configurables e integración con distintas fuentes de información.",
    palette: "radial-gradient(circle at 22% 18%, #dfeefb 0 18%, transparent 45%), radial-gradient(circle at 80% 24%, #f4e3fa 0 15%, transparent 44%), radial-gradient(circle at 58% 82%, #e7f2d9 0 18%, transparent 48%), #f1ece5",
  },
  {
    name: "Sistemas de gestión",
    purpose: "Organizar documentos, procesos o información interna que hoy vive dispersa en planillas o carpetas.",
    capabilities: "Organización de datos, control de acceso por rol y trazabilidad de estados.",
    palette: "radial-gradient(circle at 20% 20%, #fff0d7 0 18%, transparent 44%), radial-gradient(circle at 82% 20%, #e2eafa 0 16%, transparent 45%), radial-gradient(circle at 54% 82%, #f3dfe5 0 18%, transparent 48%), #e8f1ec",
  },
  {
    name: "Integraciones y automatizaciones",
    purpose: "Conectar herramientas existentes y automatizar tareas puntuales para reducir trabajo manual repetitivo.",
    capabilities: "Conexión de APIs y servicios externos, y automatización de procesos según las necesidades del proyecto.",
    palette: "radial-gradient(circle at 18% 22%, #e4f3e8 0 18%, transparent 44%), radial-gradient(circle at 82% 18%, #f5e2d8 0 16%, transparent 45%), radial-gradient(circle at 58% 84%, #dfe9f8 0 18%, transparent 48%), #f2edf2",
  },
] as const;

type Project = (typeof projects)[number];

function closestEdge(event: MouseEvent<HTMLElement>, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const y = event.clientY - rect.top;
  return y < rect.height / 2 ? "top" : "bottom";
}

function ProjectRow({ project, index, reduce }: { project: Project; index: number; reduce: boolean | null }) {
  const rowRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const revealInnerRef = useRef<HTMLDivElement>(null);
  const revealTitleRef = useRef<HTMLHeadingElement>(null);
  const revealDescriptionRef = useRef<HTMLParagraphElement>(null);

  const enter = (event: MouseEvent<HTMLElement>) => {
    if (reduce || !rowRef.current || !revealRef.current || !revealInnerRef.current || !revealTitleRef.current || !revealDescriptionRef.current) return;
    const edge = closestEdge(event, rowRef.current);
    const outerY = edge === "top" ? "-101%" : "101%";
    const innerY = edge === "top" ? "101%" : "-101%";
    gsap.killTweensOf([revealRef.current, revealInnerRef.current, revealTitleRef.current, revealDescriptionRef.current]);
    gsap.timeline({ defaults: { duration: .7, ease: "expo.out", overwrite: "auto" } })
      .set(revealRef.current, { y: outerY })
      .set(revealInnerRef.current, { y: innerY }, 0)
      .set(revealTitleRef.current, { x: "28vw" }, 0)
      .set(revealDescriptionRef.current, { x: 32, opacity: 0 }, 0)
      .to([revealRef.current, revealInnerRef.current], { y: "0%" }, 0)
      .to(revealTitleRef.current, { x: 0, duration: .82 }, 0)
      .to(revealDescriptionRef.current, { x: 0, opacity: 1, duration: .62 }, .12);
  };

  const leave = (event: MouseEvent<HTMLElement>) => {
    if (reduce || !rowRef.current || !revealRef.current || !revealInnerRef.current) return;
    const edge = closestEdge(event, rowRef.current);
    gsap.killTweensOf([revealRef.current, revealInnerRef.current]);
    gsap.timeline({ defaults: { duration: .62, ease: "expo.out", overwrite: "auto" } })
      .to(revealRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(revealInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <article ref={rowRef} className="flow-project" onMouseEnter={enter} onMouseLeave={leave}>
      <div className="flow-project-base">
        <span className="flow-project-number">0{index + 1}</span>
        <h3>{project.name}</h3>
      </div>
      <div ref={revealRef} className="flow-project-reveal">
        <div ref={revealInnerRef} className="flow-project-reveal-inner">
          <span className="flow-project-number">0{index + 1}</span>
          <h3 ref={revealTitleRef}>{project.name}</h3>
          <p ref={revealDescriptionRef}>{project.purpose}</p>
        </div>
      </div>
    </article>
  );
}

function HighlightedTitle({ project, index, reduce, onSelect }: { project: Project; index: number; reduce: boolean | null; onSelect: (index: number) => void }) {
  const titleRef = useRef<HTMLButtonElement>(null);
  const isCentered = useInView(titleRef, { amount: .8, margin: "-30% 0px -30% 0px" });
  const active = reduce || isCentered;

  return (
    <motion.button
      ref={titleRef}
      type="button"
      className="mobile-project-title font-display"
      data-project-trigger={index}
      initial={false}
      animate={{ color: active ? "#111" : "rgba(17,17,17,.24)", opacity: active ? 1 : .72, x: active ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : .38, ease: expo }}
      onClick={() => onSelect(index)}
      aria-label={`Ver más sobre ${project.name}`}
    >
      <motion.span
        className="mobile-project-hand"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isCentered ? 1 : 0, x: isCentered ? 0 : -10, rotate: isCentered ? 0 : -12, scale: isCentered ? 1 : .75 }}
        transition={{ duration: reduce ? 0 : .38, ease: expo }}
      >
        <svg viewBox="0 0 32 32" role="presentation" focusable="false">
          <path d="M13.2 15.2V7.8a2.15 2.15 0 0 1 4.3 0v7.05-2.1a2.05 2.05 0 0 1 4.1 0v1.35-1.1a2 2 0 0 1 4 0v1.55-.45a1.9 1.9 0 0 1 3.8 0v4.35c0 5.1-3.55 8.45-8.65 8.45h-1.4c-3.05 0-5.15-1.1-6.9-3.35l-4.1-5.3a2.2 2.2 0 0 1 3.25-2.95l1.6 1.4" />
          <path d="M7.3 8.2 4.7 6.7M8.8 4.9 7.7 2M11.8 3.8V.8M7.1 11.7H4" />
        </svg>
      </motion.span>
      <span>{project.name}.</span>
    </motion.button>
  );
}

function MobileProjectHighlight({ reduce }: { reduce: boolean | null }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeProject = activeIndex === null ? null : projects[activeIndex];

  const closeProject = () => {
    const triggerIndex = activeIndex;
    setActiveIndex(null);
    if (triggerIndex !== null) requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-project-trigger="${triggerIndex}"]`)?.focus());
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const triggerIndex = activeIndex;
        setActiveIndex(null);
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-project-trigger="${triggerIndex}"]`)?.focus());
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  return (
    <div className="mobile-project-highlight">
      <div className="mobile-project-titles" aria-label="Tipos de soluciones">
        {projects.map((project, index) => (
          <HighlightedTitle key={project.name} project={project} index={index} reduce={reduce} onSelect={setActiveIndex} />
        ))}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div className="project-detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : .25 }} onMouseDown={closeProject}>
            <motion.article
              ref={dialogRef}
              className="project-detail-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-detail-title"
              initial={reduce ? false : { opacity: 0, y: 38, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: .98 }}
              transition={{ duration: reduce ? 0 : .42, ease: expo }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button ref={closeRef} type="button" className="project-detail-close" onClick={closeProject} aria-label="Cerrar detalle">×</button>
              <div className="project-detail-visual" style={{ background: activeProject.palette }} aria-hidden="true">
                <div className="project-detail-window">
                  <div className="project-detail-window-bar"><span /><span /><span /></div>
                  <div className="project-detail-window-body">
                    <div className="project-detail-copy"><i /><i /><i /></div>
                    <div className="project-detail-panel"><b /><b /><b /></div>
                  </div>
                </div>
              </div>
              <div className="project-detail-content">
                <h3 id="project-detail-title" className="font-display">{activeProject.name}</h3>
                <p>{activeProject.purpose}</p>
                <p className="project-detail-outcome">{activeProject.capabilities}</p>
                <a href="#contacto" onClick={closeProject}>Conversemos sobre tu proyecto <span aria-hidden="true">↗</span></a>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Portfolio() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="servicios" className="portfolio-flow">
      <motion.div
        className="section-inner portfolio-flow-heading"
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: .7, ease: expo }}
      >
        <h2 className="font-display">Soluciones digitales a medida</h2>
        <p className="portfolio-flow-intro">
          Diseñamos y desarrollamos soluciones web adaptadas a los objetivos, procesos y etapa de cada negocio.
        </p>
      </motion.div>

      <div className="flow-project-list">
        {projects.map((project, index) => <ProjectRow key={project.name} project={project} index={index} reduce={reduce} />)}
      </div>

      <MobileProjectHighlight reduce={reduce} />

      <style>{`
        .portfolio-flow { position: relative; padding: clamp(7rem,12vw,10rem) 0; background: #08090d; }
        .portfolio-flow-heading { padding: 0 1.5rem clamp(3rem,6vw,5rem); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem; }
        .portfolio-flow-heading h2 { max-width: 13ch; color: var(--ink); font-size: clamp(2.8rem,6.5vw,6rem); line-height: .98; letter-spacing: -.04em; font-weight: 600; text-align: center; }
        .portfolio-flow-intro { max-width: 46ch; color: var(--ink-muted); font-size: .95rem; line-height: 1.65; text-align: center; }
        .flow-project-list { border-top: 1px solid rgba(255,255,255,.13); }
        .flow-project { position: relative; height: clamp(8rem,11vw,10rem); overflow: hidden; border-bottom: 1px solid rgba(255,255,255,.13); }
        .flow-project-base, .flow-project-reveal-inner { position: absolute; inset: 0; display: grid; grid-template-columns: 3rem minmax(0,1fr) minmax(18rem,.75fr) auto; align-items: center; gap: clamp(1rem,3vw,3rem); width: min(100% - 3rem,72rem); margin: 0 auto; }
        .flow-project-base h3 { grid-column: 2 / 4; justify-self: center; color: #f7f7f8; font-size: clamp(1.65rem,3.5vw,3.4rem); line-height: 1; letter-spacing: -.035em; font-weight: 560; transition: transform .55s cubic-bezier(.16,1,.3,1); }
        .flow-project-number { font-size: .6rem; letter-spacing: .12em; opacity: .45; }
        .flow-project-reveal { position: absolute; inset: 0; transform: translateY(101%); overflow: hidden; background: #f4f4f1; color: #111; pointer-events: none; }
        .flow-project-reveal-inner { transform: translateY(-101%); }
        .flow-project-reveal h3 { color: #111; font-size: clamp(1.5rem,3vw,3rem); line-height: 1; letter-spacing: -.035em; font-weight: 620; }
        .flow-project-reveal p { max-width: 46ch; color: rgba(17,17,17,.62); font-size: .88rem; line-height: 1.6; }
        .mobile-project-highlight { display: none; }

        @media (max-width:760px) {
          .portfolio-flow { padding: 7rem 0 0; }
          .portfolio-flow-heading { padding: 0 1rem .75rem; }
          .portfolio-flow-heading h2 { font-size: clamp(2.65rem,13vw,4rem); }
          .flow-project-list { display: none; }
          .mobile-project-highlight { display: block; background: #f5f5f2; }
          .mobile-project-hint { padding: 1.25rem 1rem 0; color: rgba(17,17,17,.48); font-size: .72rem; line-height: 1.5; letter-spacing: .04em; }
          .mobile-project-titles { padding: 12svh 1rem 8svh; }
          .mobile-project-title { width: 100%; min-height: 11svh; display: grid; grid-template-columns: 1.55rem minmax(0,1fr); gap: .4rem; align-items: center; border: 0; background: transparent; text-align: left; text-transform: uppercase; font-size: clamp(2rem,10.5vw,3.6rem); font-weight: 700; line-height: .92; letter-spacing: -.045em; cursor: pointer; }
          .mobile-project-hand { width: 1.35rem; height: 1.35rem; display: grid; place-items: center; color: #111; transform-origin: 70% 55%; }
          .mobile-project-hand svg { width: 100%; height: 100%; overflow: visible; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
          .mobile-project-title:focus-visible { outline: 2px solid #111; outline-offset: 5px; }
          .project-detail-backdrop { position: fixed; z-index: 120; inset: 0; display: grid; place-items: center; padding: .75rem; background: rgba(3,4,7,.78); backdrop-filter: blur(8px); }
          .project-detail-card { position: relative; width: 100%; max-width: 40rem; max-height: calc(100svh - 1.5rem); overflow-y: auto; border: 1px solid rgba(255,255,255,.15); border-radius: 20px; background: #111217; box-shadow: 0 28px 80px rgba(0,0,0,.5); }
          .project-detail-close { position: absolute; z-index: 2; top: .75rem; right: .75rem; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid rgba(17,17,20,.14); border-radius: 50%; background: rgba(255,255,255,.75); color: #111; font-size: 1.65rem; line-height: 1; cursor: pointer; }
          .project-detail-close:focus-visible { outline: 2px solid #111; outline-offset: 3px; }
          .project-detail-visual { min-height: 15rem; display: grid; place-items: center; padding: 1rem; border-radius: 19px 19px 0 0; overflow: hidden; }
          .project-detail-window { width: 92%; overflow: hidden; border: 1px solid rgba(17,17,20,.13); border-radius: 12px; background: rgba(255,255,255,.42); box-shadow: 0 12px 34px rgba(64,55,72,.11); transform: rotate(-1deg); }
          .project-detail-window-bar { display: flex; gap: 5px; padding: .6rem; border-bottom: 1px solid rgba(17,17,20,.1); }
          .project-detail-window-bar span { width: 6px; height: 6px; border-radius: 50%; background: rgba(17,17,20,.22); }
          .project-detail-window-body { min-height: 10rem; display: grid; grid-template-columns: 1.12fr .88fr; gap: .7rem; padding: .9rem; }
          .project-detail-copy, .project-detail-panel { display: flex; flex-direction: column; gap: .55rem; }
          .project-detail-copy i, .project-detail-panel b { display: block; border-radius: 7px; background: rgba(255,255,255,.64); }
          .project-detail-copy i:nth-child(1) { width: 82%; height: 2.8rem; }
          .project-detail-copy i:nth-child(2) { width: 62%; height: .55rem; }
          .project-detail-copy i:nth-child(3) { width: 76%; height: 4rem; margin-top: .35rem; }
          .project-detail-panel b { height: 3.2rem; }
          .project-detail-panel b:nth-child(2) { height: 4.5rem; }
          .project-detail-content { padding: 1.35rem 1.1rem 1.2rem; }
          .project-detail-content h3 { max-width: 12ch; margin-top: .45rem; color: #f4f4f5; font-size: clamp(2rem,10vw,3.1rem); line-height: .96; letter-spacing: -.04em; }
          .project-detail-content p { margin-top: .85rem; color: var(--ink-muted); font-size: .88rem; line-height: 1.58; }
          .project-detail-content .project-detail-outcome { padding-top: .85rem; border-top: 1px solid rgba(255,255,255,.1); color: #e9e9ec; }
          .project-detail-content a { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.2rem; padding: .85rem 1rem; border-radius: 12px; background: #f4f4f1; color: #111; font-size: .84rem; font-weight: 700; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-project-title { color: #111 !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}

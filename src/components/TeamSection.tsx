"use client";

import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import TeamLanyard from "./TeamLanyard";

const expo = cubicBezier(0.16, 1, 0.3, 1);

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  skills: readonly string[];
  initials: string;
  accent: "blue" | "teal";
  photo: string;
  model: string;
};

const team: readonly TeamMember[] = [
  {
    name: "Milton Collard",
    role: "Cofundador · Frontend y Experiencia Digital",
    bio: "Especializado en desarrollo frontend, diseño de interfaces, SEO y optimización de conversiones. Combina análisis funcional y desarrollo para transformar objetivos de negocio en experiencias claras y efectivas.",
    skills: ["Frontend", "Diseño", "SEO", "Conversión", "Análisis funcional"],
    initials: "MC",
    accent: "blue",
    photo: "/us/frontend_milton.png",
    model: "/us/valinor_card_milton_collard.glb",
  },
  {
    name: "Martín Abbott",
    role: "Cofundador · Backend y Arquitectura de Datos",
    bio: "Especializado en desarrollo backend, bases de datos e integraciones. Combina análisis funcional y criterio técnico para construir soluciones sólidas, mantenibles y alineadas con las necesidades del negocio.",
    skills: ["Backend", "Bases de datos", "Integraciones", "Arquitectura", "Análisis funcional"],
    initials: "MA",
    accent: "teal",
    photo: "/us/backend_martin.png",
    model: "/us/valinor_card_martin_abbott.glb",
  },
] as const;

// Reemplaza el lanyard 3D en mobile (≤1023px, mismo corte que
// .team-heading-slot): tarjetas HTML/CSS apiladas, sin WebGL ni física, para
// no pagar ese costo de rendimiento en un ancho donde el drag libre tampoco
// tiene mucho sentido (compite con el scroll táctil). En mobile van más
// grandes apiladas (una debajo de otra) y con Martín primero — un orden
// distinto al del lanyard de desktop (`team`, que no se toca), por eso se
// arma una copia invertida solo para acá. Frente: foto grande con
// nombre/rol superpuestos y botón "+INFO"; al tocar la tarjeta (o el botón)
// se da vuelta y repite nombre/rol junto a la bio completa — no hay
// "seguidores" ni métricas reales para mostrar como en la referencia, así
// que se usa el texto genuino que ya existe.
function MobileTeamCards({ team }: { team: readonly TeamMember[] }) {
  const mobileTeam = [...team].reverse();
  const [flipped, setFlipped] = useState<boolean[]>(() => mobileTeam.map(() => false));
  const toggle = (index: number) => {
    setFlipped((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div className="team-mobile-cards">
      {mobileTeam.map((member, index) => {
        // member.role es la descripción completa ("Cofundador · Frontend y
        // Experiencia Digital"); acá solo entra el rol corto ("Cofundador ·
        // Frontend"), la parte antes del " y ".
        const shortRole = member.role.split(" y ")[0];
        return (
          <button
            key={member.name}
            type="button"
            className="team-flip-card"
            aria-pressed={flipped[index]}
            aria-label={flipped[index] ? `Ocultar información de ${member.name}` : `Ver información de ${member.name}`}
            onClick={() => toggle(index)}
          >
            <div className={`team-flip-inner${flipped[index] ? " is-flipped" : ""}`}>
              <div className="team-flip-face team-flip-front" aria-hidden={flipped[index]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="team-flip-front-photo" src={member.photo} alt="" />
                <span className="team-flip-front-scrim" aria-hidden="true" />
                <div className="team-flip-front-label">
                  <span className="team-flip-front-name">{member.name}</span>
                  <span className="team-flip-front-role">{shortRole}</span>
                </div>
                <span className="team-flip-info-btn">+ Info</span>
              </div>
              <div className="team-flip-face team-flip-back" aria-hidden={!flipped[index]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="team-flip-photo" src={member.photo} alt="" />
                <div className="team-flip-back-info">
                  <h3>{member.name}</h3>
                  <p className="team-flip-role">{shortRole}</p>
                  <p className="team-flip-bio">{member.bio}</p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StaticTeamGrid() {
  return (
    <div className="team-grid">
      {team.map((member) => (
        <article key={member.name} className={`team-card team-card-${member.accent}`}>
          <div className="team-avatar" aria-hidden="true">
            <span>{member.initials}</span>
          </div>
          <h3>{member.name}</h3>
          <p className="team-role">{member.role}</p>
          <p className="team-bio">{member.bio}</p>
          <ul className="team-skills">
            {member.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default function TeamSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="equipo" className="team-section section-shell">
      <div className="section-inner">
        {reduce ? (
          <>
            <motion.div className="team-heading" initial={false} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display">Conocé a quienes están detrás de Valinor</h2>
            </motion.div>
            <StaticTeamGrid />
          </>
        ) : (
          <div className="team-stage">
            <div className="team-heading-slot">
              <motion.div
                className="team-heading"
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: expo }}
              >
                <h2 className="font-display">Conocé a quienes están detrás de Valinor</h2>
              </motion.div>
            </div>
            <div className="team-lanyard-slot">
              <TeamLanyard team={team} inView={inView} />
            </div>
            <MobileTeamCards team={team} />
          </div>
        )}
      </div>

      <style>{`
        .team-section { position: relative; background: var(--surface-raised); }
        /* .team-stage NO es position:relative a propósito: así el contexto
           de posicionamiento de .lanyard-canvas-wrap (position:absolute, ver
           TeamLanyard.tsx) sigue subiendo hasta .team-section — ancho
           completo del navegador, sin el tope de 72rem de .section-inner —
           para que las tarjetas se puedan arrastrar hasta los bordes reales
           de la ventana. El título necesita quedar alineado con el resto del
           contenido (72rem centrado, igual que las demás secciones), así que
           tiene su propio contexto aparte: .team-heading-slot. */
        .team-heading { position: relative; z-index: 1; max-width: 46rem; margin: 0 auto clamp(3rem,6vw,4.5rem); text-align: center; }
        .team-heading h2 { font-size: clamp(3rem,6.4vw,5rem); font-weight: 650; line-height: 1.18; letter-spacing: -.03em; color: var(--ink); }
        /* Desde 1024px: título a la derecha, tarjetas cayendo a la
           izquierda. El slot reproduce el mismo ancho centrado de
           .section-inner (72rem) pero como position:absolute+inset:0 sobre
           .team-section (ancho completo) — así el título queda alineado con
           el resto del contenido del sitio, aunque el canvas de las tarjetas
           ocupe todo el navegador por debajo. El título sale del flujo
           normal para quedar junto a las tarjetas en vez de apilado arriba,
           un poco por encima del centro vertical — no exactamente centrado,
           más arriba. pointer-events:none en ambos para no bloquear el
           arrastre si una tarjeta termina debajo del texto. El alto de
           .team-stage lo sigue dando .lanyard-spacer (el único contenido que
           queda en flujo normal ahí). */
        @media (min-width: 1024px) {
          .team-heading-slot {
            position: absolute;
            inset: 0;
            z-index: 2;
            width: min(100%, 72rem);
            margin: 0 auto;
            pointer-events: none;
          }
          .team-heading-slot .team-heading {
            position: absolute;
            top: 26%;
            right: -4%;
            transform: translateY(-50%);
            max-width: 34rem;
            margin: 0;
            text-align: left;
            pointer-events: none;
          }
        }
        /* Lanyard 3D interactivo (desktop/tablet, ≥1024px) vs. tarjetas planas
           con flip (mobile, ≤1023px) — mismo corte que .team-heading-slot.
           .team-lanyard-slot oculto por display:none evita que TeamLanyard
           llegue a estar "in view" para su IntersectionObserver interno, así
           que en mobile nunca se monta el <Canvas> ni carga el motor de
           física — no es solo un tema visual. */
        .team-lanyard-slot { display: block; }
        .team-mobile-cards { display: none; }
        @media (max-width: 1023px) {
          .team-lanyard-slot { display: none; }
          .team-mobile-cards { display: flex; flex-direction: column; gap: 1.1rem; padding-bottom: 1rem; }
        }
        .team-flip-card { position: relative; width: 100%; max-width: 22rem; margin: 0 auto; aspect-ratio: 2 / 3; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; perspective: 1600px; border-radius: 18px; }
        .team-flip-card:focus-visible { outline: 2px solid var(--brand-deep); outline-offset: 4px; }
        .team-flip-inner { position: relative; width: 100%; height: 100%; transition: transform .6s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; }
        .team-flip-inner.is-flipped { transform: rotateY(180deg); }
        .team-flip-face { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; backface-visibility: hidden; border-radius: 18px; box-shadow: 0 14px 30px rgba(0,0,0,.35); }
        /* Frente: foto a pantalla completa con degradados arriba/abajo para
           que el nombre/rol (arriba) y el botón "+ Info" (abajo) queden
           legibles sobre cualquier foto. */
        .team-flip-front-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .team-flip-front-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,.55) 100%); }
        .team-flip-front-label { position: relative; margin-left: auto; padding: .85rem .85rem 0; max-width: 85%; text-align: right; }
        .team-flip-front-name { display: block; font-family: var(--font-display-stack); font-size: .92rem; font-weight: 650; letter-spacing: -.01em; line-height: 1.15; color: #fff; }
        .team-flip-front-role { display: block; margin-top: .2rem; font-size: .62rem; font-weight: 600; letter-spacing: .03em; color: rgba(255,255,255,.8); }
        .team-flip-info-btn { position: absolute; right: .75rem; bottom: .75rem; padding: .38rem .8rem; border-radius: 999px; background: #FFD447; color: #171308; font-size: .64rem; font-weight: 700; letter-spacing: .03em; }
        /* Reverso: foto arriba (poco más de la mitad) y debajo, repetidos,
           nombre + rol corto + la bio completa — no hay métricas reales
           ("seguidores", etc.) como en la referencia, así que se usa el
           texto genuino que ya existía en team. */
        .team-flip-back { transform: rotateY(180deg); background: #f5f5f2; }
        .team-flip-photo { width: 100%; height: 55%; object-fit: cover; object-position: center top; }
        .team-flip-back-info { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: .3rem; padding: .8rem .9rem; text-align: center; }
        .team-flip-back-info h3 { font-size: .92rem; font-weight: 650; letter-spacing: -.01em; color: #111; }
        .team-flip-role { font-size: .62rem; font-weight: 600; letter-spacing: .03em; color: rgba(17,17,20,.55); }
        .team-flip-bio { margin-top: .3rem; font-size: .85rem; line-height: 1.48; color: rgba(17,17,20,.65); }

        .team-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: clamp(1.5rem,3vw,2.5rem); align-items: stretch; }
        .team-card { display: flex; flex-direction: column; gap: .9rem; padding: clamp(1.75rem,3vw,2.5rem); border: 1px solid var(--border); border-top: 3px solid transparent; border-radius: 20px; background: var(--surface-raised); box-shadow: var(--shadow-sm); }
        .team-card-blue { border-top-color: #3279F9; }
        .team-card-teal { border-top-color: #24D6BC; }
        .team-avatar { width: 4rem; height: 4rem; display: grid; place-items: center; border-radius: 50%; font-family: var(--font-display-stack); font-size: 1.05rem; font-weight: 700; letter-spacing: .02em; }
        .team-card-blue .team-avatar { background: rgba(50,121,249,.14); border: 1px solid rgba(50,121,249,.4); color: #7db0ff; }
        .team-card-teal .team-avatar { background: rgba(36,214,188,.14); border: 1px solid rgba(36,214,188,.4); color: #24d6bc; }
        .team-card h3 { font-size: 1.3rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink); }
        .team-role { font-size: .76rem; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-muted); }
        .team-bio { font-size: .92rem; line-height: 1.65; color: var(--ink-muted); }
        .team-skills { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: auto; padding-top: .4rem; list-style: none; }
        .team-skills li { padding: .32rem .75rem; border: 1px solid var(--border); border-radius: 999px; color: var(--ink-muted); font-size: .72rem; letter-spacing: .01em; }
        .team-backup { max-width: 42rem; margin: clamp(2.25rem,4vw,3rem) auto 0; color: var(--ink-faint); font-size: .85rem; text-align: center; }

        @media (max-width: 760px) {
          .team-grid { grid-template-columns: 1fr; }
          .team-card { padding: 1.5rem; }
        }
      `}</style>
    </section>
  );
}

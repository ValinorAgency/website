"use client";

import { cubicBezier, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const team = [
  {
    name: "Milton Collard",
    role: "Cofundador · Frontend y Experiencia Digital",
    bio: "Especializado en desarrollo frontend, diseño de interfaces, SEO y optimización de conversiones. Combina análisis funcional y desarrollo para transformar objetivos de negocio en experiencias claras y efectivas.",
    skills: ["Frontend", "Diseño", "SEO", "Conversión", "Análisis funcional"],
    initials: "MC",
    accent: "blue",
  },
  {
    name: "Martín Abbott",
    role: "Cofundador · Backend y Arquitectura de Datos",
    bio: "Especializado en desarrollo backend, bases de datos e integraciones. Combina análisis funcional y criterio técnico para construir soluciones sólidas, mantenibles y alineadas con las necesidades del negocio.",
    skills: ["Backend", "Bases de datos", "Integraciones", "Arquitectura", "Análisis funcional"],
    initials: "MA",
    accent: "teal",
  },
] as const;

export default function TeamSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <section ref={ref} id="equipo" className="team-section section-shell">
      <div className="section-inner">
        <motion.div
          className="team-heading"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: expo }}
        >
          <h2 className="font-display">Conocé a quienes están detrás de Valinor</h2>
          <p className="team-intro">
            Dos perfiles complementarios que combinan desarrollo, diseño y análisis funcional para construir soluciones alineadas con cada negocio.
          </p>
        </motion.div>

        <div className="team-grid">
          {team.map((member, index) => (
            <motion.article
              key={member.name}
              className={`team-card team-card-${member.accent}`}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: reduce ? 0 : index * 0.12, ease: expo }}
            >
              {/* Avatar temporal con iniciales (ver DESIGN.md). Cuando existan las fotos,
                  reemplazar por /images/team/milton.webp y /images/team/martin.webp. */}
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
            </motion.article>
          ))}
        </div>

        <p className="team-backup">
          Más de ocho años de experiencia profesional cada uno en desarrollo de software.
        </p>
      </div>

      <style>{`
        .team-section { background: var(--surface); }
        .team-heading { max-width: 46rem; margin: 0 auto clamp(3rem,6vw,4.5rem); text-align: center; }
        .team-heading h2 { font-size: clamp(2.3rem,5vw,3.8rem); font-weight: 650; line-height: 1.06; letter-spacing: -.03em; color: var(--ink); }
        .team-intro { max-width: 42rem; margin: 1rem auto 0; color: var(--ink-muted); font-size: 1rem; line-height: 1.65; }
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

"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import LanyardCard from "./LanyardCard";
import type { TeamMember } from "./TeamSection";

export default function TeamLanyard({ team, inView }: { team: readonly TeamMember[]; inView: boolean }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasInView = useInView(wrapRef, { margin: "-5% 0px" });
  const [flipped, setFlipped] = useState<boolean[]>(() => team.map(() => false));
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = (index: number) => {
    setFlipped((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div className="lanyard-stage" ref={wrapRef}>
      {/* Espaciador en el flujo normal: reserva el lugar para que el texto de
          abajo no quede tapado por las tarjetas (el canvas real se posiciona
          aparte, anclado al borde de la sección). */}
      <div className="lanyard-spacer" aria-hidden="true" />
      <div className="lanyard-canvas-wrap">
        {inView && (
          <Canvas
            dpr={[1, isMobile ? 1.5 : 2]}
            camera={{ position: [0, 1.5, 22], fov: 22 }}
            gl={{ alpha: true }}
            style={{ touchAction: "none" }}
          >
            <ambientLight intensity={1.1} />
            <Physics gravity={[0, -40, 0]} paused={!canvasInView} timeStep={isMobile ? 1 / 30 : 1 / 60}>
              <Suspense fallback={null}>
                {team.map((member, index) => (
                  <LanyardCard
                    key={member.name}
                    member={member}
                    anchorX={(index - (team.length - 1) / 2) * 3.4 - 3.6}
                    anchorY={3.08}
                    isMobile={isMobile}
                    flipped={flipped[index]}
                    onToggleFlip={() => toggle(index)}
                  />
                ))}
              </Suspense>
            </Physics>
            <Environment blur={0.75}>
              <Lightformer intensity={1} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={1.5} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={1.5} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={4} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
            </Environment>
          </Canvas>
        )}

        {/* Botones reales, invisibles hasta que reciben foco por teclado: el
            click/touch directo sobre el canvas no es alcanzable por teclado ni
            lectores de pantalla. */}
        {team.map((member, index) => (
          <button
            key={member.name}
            type="button"
            className="lanyard-kbd-trigger"
            style={{ left: `${50 + ((index - (team.length - 1) / 2) / team.length) * 55}%` }}
            aria-pressed={flipped[index]}
            onClick={() => toggle(index)}
          >
            {flipped[index] ? `Ocultar información de ${member.name}` : `Ver información de ${member.name}`}
          </button>
        ))}
      </div>

      {/* Texto real siempre presente (nombre, rol, bio, skills) para
          accesibilidad y SEO: la tarjeta 3D es decorativa y su textura no es
          legible por lectores de pantalla ni indexable. */}
      <div className="sr-only">
        {team.map((member) => (
          <article key={member.name}>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <p>{member.bio}</p>
            <ul>
              {member.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <style>{`
        .lanyard-stage { display: flex; flex-direction: column; }
        .lanyard-spacer { height: clamp(26rem, 44vw, 34rem); }
        /* El contenedor ocupa TODO el ancho de la sección (no se recorta a
           una columna) para que las tarjetas se puedan arrastrar libremente
           sin toparse con un borde artificial — el título (ver
           TeamSection.tsx) flota encima con pointer-events:none, así que no
           bloquea el arrastre aunque una tarjeta termine debajo del texto.
           top negativo: cancela el padding-top de .section-shell para que
           el punto de anclaje de la cinta quede pegado al borde real de la
           sección (contra el fondo blanco de la sección anterior), no
           desplazado por el padding general de las secciones. */
        .lanyard-canvas-wrap { position: absolute; z-index: 0; top: calc(-1 * clamp(3.5rem, 9vw, 8rem)); left: 0; right: 0; height: clamp(46rem, 68vw, 58rem); overflow: hidden; pointer-events: none; }
        .lanyard-canvas-wrap canvas { touch-action: none; pointer-events: auto; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .lanyard-kbd-trigger { position: absolute; bottom: 1.5rem; transform: translateX(-50%); width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; background: var(--surface-raised); color: var(--ink); pointer-events: auto; }
        .lanyard-kbd-trigger:focus-visible { width: auto; height: auto; padding: .5rem 1rem; margin: 0; overflow: visible; clip: auto; white-space: normal; border-radius: 999px; border: 1px solid var(--border-strong); box-shadow: var(--shadow-sm); font-size: .78rem; font-weight: 600; z-index: 2; }
      `}</style>
    </div>
  );
}

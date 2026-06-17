"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion"
import SpriteParticleProbe from "./SpriteParticleProbe"

const expo = cubicBezier(0.16, 1, 0.3, 1);

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: reduceMotion ? 0 : 0.55, ease: expo },
    }),
  };

  return (
    <section
      id="about"
      className="pointer-events-none relative flex flex-col overflow-hidden px-4 sm:px-6"
      style={{ height: "calc(100svh - 5rem)" }}
    >
      <div className="pointer-events-auto relative z-10 flex min-h-0 flex-1 flex-col items-center pt-6 sm:pt-10">
        <div className="flex w-full max-w-[96rem] flex-col items-center">
          <motion.div
            custom={1}
            variants={fadeUp}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="w-full"
          >
            <SpriteParticleProbe className="h-[clamp(22rem,58svh,40rem)]" />
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="mt-3 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#contacto" className="pill-button-dark w-full sm:w-auto">
              Agendar una llamada
            </a>
            <a href="#servicios" className="pill-button-light w-full sm:w-auto">
              Servicios
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

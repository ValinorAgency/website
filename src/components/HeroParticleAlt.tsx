"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import LiquidEther from "./LiquidEther";

export default function HeroParticleAlt() {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reveal = () => setRevealed(true);
    if (document.documentElement.dataset.heroRevealed === "true") reveal();
    window.addEventListener("valinor:hero-reveal", reveal);
    return () => window.removeEventListener("valinor:hero-reveal", reveal);
  }, []);

  return (
    <section
      id="about"
      className="pointer-events-none relative flex min-h-svh flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#05060a]">
        {reduceMotion ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(50,121,249,0.22),transparent_38%),radial-gradient(circle_at_68%_62%,rgba(36,214,188,0.12),transparent_34%)]" />
        ) : (
          <LiquidEther
            colors={["#07101f", "#245fbe", "#24a99a", "#d8e5ef"]}
            mouseForce={16}
            cursorSize={88}
            iterationsPoisson={18}
            iterationsViscous={12}
            resolution={0.34}
            autoDemo
            autoSpeed={0.34}
            autoIntensity={1.55}
            autoResumeDelay={1800}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(5,6,10,0.18)_60%,rgba(5,6,10,0.68)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,6,9,0.32)_42%,rgba(6,6,9,0.86)_78%,#060609_100%)]" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-4 text-center"
        initial={{ opacity: 0, scale: 0.48, y: 0, filter: "blur(18px)" }}
        animate={revealed ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, scale: 0.48, y: 0, filter: "blur(18px)" }}
        transition={{
          duration: reduceMotion ? 0 : 1.45,
          delay: reduceMotion ? 0 : 0.08,
          ease: cubicBezier(0.22, 0.72, 0.2, 1),
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <p
            className="font-display font-black leading-[0.94]"
            style={{ fontSize: "clamp(2.9rem, 11vw, 10rem)", letterSpacing: "-0.055em" }}
          >
            <span className="block md:inline" style={{ color: "rgba(255,255,255,0.96)" }}>Valinor</span>{" "}
            <span className="block text-outline md:inline">Agency</span>
          </p>
          <h1
            className="mt-4 sm:mt-8"
            style={{
              fontSize: "clamp(0.75rem, 1.3vw, 1.56rem)",
              fontWeight: 200,
              letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.86)",
              textTransform: "uppercase",
            }}
          >
            Diseño y desarrollo web a medida
          </h1>
          <p className="mt-5 max-w-xl text-pretty px-2 text-sm leading-6 text-[var(--ink-muted)] sm:mt-6 sm:text-base sm:leading-7">
            Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina.
          </p>

          <div className="hero-cta-row pointer-events-auto mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
            <a href="#contacto" className="pill-button-dark">
              Contanos tu proyecto <span aria-hidden="true">↗</span>
            </a>
            <a href="#servicios" className="pill-button-light">
              Ver soluciones
            </a>
          </div>

          <p className="mt-6 max-w-sm text-pretty px-2 text-xs leading-5 text-[rgba(255,255,255,0.4)] sm:text-sm">
            Más de 8 años de experiencia diseñando y desarrollando soluciones digitales.
          </p>
        </div>
      </motion.div>

      <style>{`
        .hero-cta-row a { min-height: 48px; width: 100%; }
        @media (min-width: 640px) { .hero-cta-row a { width: auto; } }
      `}</style>
    </section>
  );
}

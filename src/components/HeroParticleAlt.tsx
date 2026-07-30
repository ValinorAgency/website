"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import LiquidEther from "./LiquidEther";

export default function HeroParticleAlt() {
  const expo = cubicBezier(0.16, 1, 0.3, 1);
  const reduceMotion = useReducedMotion();

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
        initial={{ opacity: 0, scale: 0.95, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: expo }}
      >
        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-display font-black leading-[0.94]"
            style={{ fontSize: "clamp(2.9rem, 11vw, 10rem)", letterSpacing: "-0.055em" }}
          >
            <span className="block md:inline" style={{ color: "rgba(255,255,255,0.96)" }}>Valinor</span>{" "}
            <span className="block text-outline md:inline">Agency</span>
          </h1>
          <p
            className="mt-4 sm:mt-8"
            style={{
              fontSize: "clamp(0.75rem, 1.3vw, 1.56rem)",
              fontWeight: 200,
              letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            Diseño y desarrollo web a medida
          </p>
        </div>
      </motion.div>
    </section>
  );
}

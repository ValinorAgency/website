"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import FeatureCard from "./FeatureCard";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const features = [
  {
    title: "Automatización",
    description:
      "Sistemas que eliminan tareas repetitivas y convierten procesos manuales en una secuencia clara, medible y mantenible.",
    accent: "var(--brand)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 8.5V6.5C5 5.12 6.12 4 7.5 4h9C17.88 4 19 5.12 19 6.5v2" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 15.5V17.5C5 18.88 6.12 20 7.5 20h9c1.38 0 2.5-1.12 2.5-2.5v-2" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 12h8" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    className: "lg:col-span-6",
    children: (
      <div className="flex flex-wrap gap-2">
        {["Brief", "Draft", "Deploy"].map((item) => (
          <span
            key={item}
            className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--ink-muted)]"
          >
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Agentes",
    description:
      "Asistentes que responden con contexto, operan sobre reglas y escalan a un humano cuando la situación lo exige.",
    accent: "var(--brand)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="var(--brand)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 16l9 5 9-5" stroke="var(--brand)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 12l9 5 9-5" stroke="var(--brand)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    className: "lg:col-span-3",
  },
  {
    title: "Proceso",
    description:
      "Orquestación de pasos, validaciones y pasos condicionales para que el sistema sea fácil de entender y de mantener.",
    accent: "var(--brand)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="2.4" stroke="var(--brand)" strokeWidth="1.6" />
        <circle cx="18" cy="6" r="2.4" stroke="var(--brand)" strokeWidth="1.6" />
        <circle cx="12" cy="18" r="2.4" stroke="var(--brand)" strokeWidth="1.6" />
        <path d="M8.2 7.2 10.9 9.6M15.8 7.2 13.1 9.6M12 10.4V15" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    className: "lg:col-span-3",
  },
  {
    title: "Verificación",
    description:
      "Checks de calidad, contenido y accesibilidad para reducir errores y salir a producción con más confianza.",
    accent: "var(--brand)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m5 13 4 4 10-11" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v10A2.5 2.5 0 0 1 17 19.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z" stroke="var(--brand)" strokeWidth="1.4" />
      </svg>
    ),
    className: "lg:col-span-6",
    children: (
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          "Contraste validado",
          "Rutas y anchors",
          "Responsivo probado",
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--ink-muted)]"
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
];

export default function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="servicios-ai" className="section-shell">
      <div className="section-inner">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: expo }}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <h2
            className="font-display text-[clamp(2.2rem,4.8vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.05em]"
            style={{ textWrap: "balance" }}
          >
            Servicios que ordenan presencia digital y automatización.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
            Cada bloque resuelve una necesidad distinta, con la misma
            disciplina visual y sin caer en layouts genéricos de agencia.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              accent={feature.accent}
              className={feature.className}
              delay={index * 0.08}
            >
              {feature.children}
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}

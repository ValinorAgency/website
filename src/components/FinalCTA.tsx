"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import { type FormEvent } from "react";
import AnimatedDots from "./AnimatedDots";

const expo = cubicBezier(0.16, 1, 0.3, 1);

export default function FinalCTA() {
  const reduceMotion = useReducedMotion();

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const projectType = String(data.get("projectType") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`Consulta ${projectType} — ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\nTipo de proyecto: ${projectType}\n\n${message}`);
    window.location.href = `mailto:hola@valinor.agency?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contacto" className="section-shell relative overflow-hidden">
      <div className="section-inner">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: expo }}
          className="surface-card relative overflow-hidden rounded-[1.75rem] px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
        >
          <AnimatedDots variant="panel" className="opacity-40" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(24rem,1.2fr)] lg:gap-16">
            <div>
              <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.01] tracking-[-0.04em]" style={{ textWrap: "balance" }}>
                Contanos qué necesitás resolver.
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
                Puede ser un sitio para presentar tu empresa, una tienda online o una herramienta para ordenar procesos. Revisamos el objetivo y te proponemos un alcance claro.
              </p>
              <p className="mt-6 text-sm leading-6 text-[var(--ink-faint)]">
                También podés escribirnos directamente a{" "}
                <a className="text-[var(--ink)] underline decoration-white/25 underline-offset-4" href="mailto:hola@valinor.agency">hola@valinor.agency</a>
              </p>
            </div>

            <form className="contact-form" onSubmit={submitContact}>
              <div className="contact-form-grid">
                <label>
                  <span>Nombre</span>
                  <input name="name" type="text" autoComplete="name" required placeholder="Tu nombre" />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required placeholder="nombre@empresa.com" />
                </label>
              </div>

              <label>
                <span>Tipo de proyecto</span>
                <select name="projectType" defaultValue="" required>
                  <option value="" disabled>Seleccioná una opción</option>
                  <option value="Sitio web">Sitio web</option>
                  <option value="Ecommerce">Ecommerce</option>
                  <option value="Aplicación web">Aplicación web</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Solución personalizada">Solución personalizada</option>
                </select>
              </label>

              <label>
                <span>¿Qué necesitás resolver?</span>
                <textarea name="message" rows={5} required placeholder="Contanos brevemente el objetivo, el problema actual o la idea que querés desarrollar." />
              </label>

              <div className="contact-form-submit">
                <p>Al enviar se abrirá tu aplicación de correo con el mensaje preparado.</p>
                <button type="submit" className="pill-button-dark">Enviar consulta <span aria-hidden="true">↗</span></button>
              </div>
            </form>
          </div>

          <style>{`
            .contact-form { display: grid; gap: 1.25rem; }
            .contact-form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; }
            .contact-form label { display: grid; gap: .5rem; }
            .contact-form label > span { color: var(--ink-muted); font-size: .72rem; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; }
            .contact-form input, .contact-form select, .contact-form textarea { width: 100%; border: 1px solid var(--border); border-radius: 10px; background: rgba(255,255,255,.035); color: var(--ink); font: inherit; font-size: .9rem; transition: border-color .2s ease, background .2s ease; }
            .contact-form input, .contact-form select { min-height: 48px; padding: 0 .9rem; }
            .contact-form textarea { min-height: 9rem; resize: vertical; padding: .85rem .9rem; line-height: 1.6; }
            .contact-form input::placeholder, .contact-form textarea::placeholder { color: var(--ink-faint); }
            .contact-form select { color-scheme: dark; }
            .contact-form input:focus, .contact-form select:focus, .contact-form textarea:focus { border-color: rgba(255,255,255,.38); background: rgba(255,255,255,.055); outline: none; }
            .contact-form-submit { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; }
            .contact-form-submit p { max-width: 29ch; color: var(--ink-faint); font-size: .7rem; line-height: 1.5; }
            .contact-form-submit button { min-height: 48px; flex-shrink: 0; border: 0; }
            @media (max-width: 640px) {
              .contact-form-grid { grid-template-columns: 1fr; }
              .contact-form-submit { align-items: stretch; flex-direction: column; }
              .contact-form-submit button { width: 100%; }
            }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}
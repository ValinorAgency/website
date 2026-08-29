"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import AnimatedDots from "./AnimatedDots";
import {
  PROJECT_TYPES,
  validateContactPayload,
  type ContactFieldErrors,
} from "@/lib/contact-validation";

const expo = cubicBezier(0.16, 1, 0.3, 1);

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const DEFAULT_HELP_TEXT = "Te respondemos por email o WhatsApp según el dato que nos dejes.";
const VALIDATION_ERROR_TEXT = "Revisá los datos marcados antes de enviar.";

const SERVER_ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Recibimos demasiadas consultas en poco tiempo. Probá de nuevo en unos minutos.",
  config: "El formulario no está disponible en este momento. Escribinos por WhatsApp o a agencyvalinor@gmail.com.",
  send_failed: "No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.",
  invalid_json: "Ocurrió un error inesperado. Probá de nuevo.",
  invalid_body: "Ocurrió un error inesperado. Probá de nuevo.",
};

const NETWORK_ERROR_TEXT = "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.";

export default function FinalCTA() {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(DEFAULT_HELP_TEXT);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const result = validateContactPayload({
      name: data.get("name"),
      contact: data.get("contact"),
      projectType: data.get("projectType"),
      message: data.get("message"),
      company: data.get("company"),
    });

    if (!result.ok) {
      setFieldErrors(result.errors);
      setStatus("error");
      setStatusMessage(VALIDATION_ERROR_TEXT);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    setStatusMessage("Enviando tu consulta…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const payload: {
        ok?: boolean;
        error?: string;
        fields?: ContactFieldErrors;
      } | null = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        if (payload?.error === "validation" && payload.fields) {
          setFieldErrors(payload.fields);
          setStatus("error");
          setStatusMessage(VALIDATION_ERROR_TEXT);
          return;
        }

        setStatus("error");
        setStatusMessage(
          (payload?.error && SERVER_ERROR_MESSAGES[payload.error]) ?? SERVER_ERROR_MESSAGES.send_failed,
        );
        return;
      }

      setStatus("success");
      setStatusMessage("¡Listo! Recibimos tu consulta y te vamos a responder a la brevedad.");
      form.reset();
    } catch {
      setStatus("error");
      setStatusMessage(NETWORK_ERROR_TEXT);
    }
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
                <a className="text-[var(--ink)] underline decoration-white/25 underline-offset-4" href="mailto:agencyvalinor@gmail.com">agencyvalinor@gmail.com</a>
              </p>
            </div>

            <form className="contact-form" onSubmit={submitContact} noValidate>
              <div className="contact-form-grid">
                <label htmlFor="contact-name">
                  <span>Nombre</span>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    maxLength={120}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                  />
                  {fieldErrors.name ? (
                    <span id="contact-name-error" role="alert" className="contact-form-error">
                      {fieldErrors.name}
                    </span>
                  ) : null}
                </label>
                <label htmlFor="contact-contact">
                  <span>Email o WhatsApp</span>
                  <input
                    id="contact-contact"
                    name="contact"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nombre@empresa.com o tu WhatsApp"
                    maxLength={120}
                    aria-invalid={Boolean(fieldErrors.contact)}
                    aria-describedby={fieldErrors.contact ? "contact-contact-error" : undefined}
                  />
                  {fieldErrors.contact ? (
                    <span id="contact-contact-error" role="alert" className="contact-form-error">
                      {fieldErrors.contact}
                    </span>
                  ) : null}
                </label>
              </div>

              <label htmlFor="contact-project-type">
                <span>Tipo de proyecto</span>
                <select
                  id="contact-project-type"
                  name="projectType"
                  defaultValue=""
                  aria-invalid={Boolean(fieldErrors.projectType)}
                  aria-describedby={fieldErrors.projectType ? "contact-project-type-error" : undefined}
                >
                  <option value="" disabled>Seleccioná una opción</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.projectType ? (
                  <span id="contact-project-type-error" role="alert" className="contact-form-error">
                    {fieldErrors.projectType}
                  </span>
                ) : null}
              </label>

              <label htmlFor="contact-message">
                <span>¿Qué necesitás resolver?</span>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Contanos brevemente el objetivo, el problema actual o la idea que querés desarrollar."
                  maxLength={2000}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                />
                {fieldErrors.message ? (
                  <span id="contact-message-error" role="alert" className="contact-form-error">
                    {fieldErrors.message}
                  </span>
                ) : null}
              </label>

              <div className="contact-form-honeypot" aria-hidden="true">
                <label htmlFor="contact-company">Empresa</label>
                <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="contact-form-submit">
                <p role="status" aria-live="polite">
                  {statusMessage}
                </p>
                <button type="submit" className="pill-button-dark" disabled={status === "submitting"}>
                  {status === "submitting" ? "Enviando…" : (
                    <>Enviar consulta <span aria-hidden="true">↗</span></>
                  )}
                </button>
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
            .contact-form input[aria-invalid="true"], .contact-form select[aria-invalid="true"], .contact-form textarea[aria-invalid="true"] { border-color: #f87171; }
            .contact-form-error { color: #f87171; font-size: .78rem; line-height: 1.4; }
            .contact-form-honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
            .contact-form-submit { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; }
            .contact-form-submit p { max-width: 29ch; color: var(--ink-faint); font-size: .7rem; line-height: 1.5; }
            .contact-form-submit button { min-height: 48px; flex-shrink: 0; border: 0; }
            .contact-form-submit button:disabled { opacity: .6; cursor: not-allowed; }
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

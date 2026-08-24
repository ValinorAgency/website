"use client";

import { AnimatePresence, cubicBezier, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

const links = [
  { label: "Inicio", href: "#about" },
  { label: "Servicios", href: "#servicios" },
  { label: "Capacidades", href: "#capacidades" },
  { label: "Por qué Valinor", href: "#por-que" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: expo }}
      className="absolute inset-x-0 top-0 z-[var(--z-sticky)] w-full"
    >
      <div className="w-full px-5 py-3.5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logoValinor-removebg.png"
              alt="Valinor Agency"
              className="h-20 w-20 object-contain brightness-0 invert"
            />
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contacto" className="pill-button-dark hidden px-5 py-2 text-sm sm:inline-flex">
              Hablemos
            </a>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Abrir navegación"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <span className="flex w-4 flex-col gap-1.5" aria-hidden="true">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-3 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[var(--z-modal)] lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button
              type="button"
              aria-label="Cerrar navegación"
              className="absolute inset-0 h-full w-full bg-black/55"
              onClick={closeMenu}
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
            />

            <motion.div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Navegación principal"
              className="absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col overflow-y-auto bg-[#ededed] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3.5 text-[#0b0b0e] sm:px-8"
              variants={{
                closed: { x: "100%" },
                open: { x: 0 },
              }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: expo }}
            >
              <div className="flex h-20 shrink-0 items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">
                  Navegación
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Cerrar navegación"
                  className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-black/15 px-3 text-xs font-medium uppercase tracking-[0.08em] transition-colors hover:bg-black hover:text-white"
                >
                  <span className="hidden sm:inline">Cerrar</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <path d="m6.5 6.5 11 11m0-11-11 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <motion.nav
                className="my-auto py-10"
                aria-label="Navegación mobile"
                variants={{
                  closed: { transition: { staggerChildren: 0.035, staggerDirection: -1 } },
                  open: { transition: { delayChildren: reduceMotion ? 0 : 0.18, staggerChildren: reduceMotion ? 0 : 0.075 } },
                }}
              >
                <ul>
                  {links.map((link, index) => (
                    <motion.li
                      key={link.label}
                      className="overflow-hidden border-b border-black/15"
                      variants={{
                        closed: { opacity: 0, y: 45 },
                        open: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: reduceMotion ? 0 : 0.55, ease: expo }}
                    >
                      <a
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={link.href}
                        onClick={closeMenu}
                        className="group flex min-h-16 items-center gap-4 py-3 font-display text-[clamp(2rem,10vw,4rem)] font-medium leading-none tracking-[-0.04em]"
                      >
                        <span className="w-6 text-[10px] font-semibold tracking-normal text-black/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="transition-transform duration-300 group-hover:translate-x-2 group-focus-visible:translate-x-2">
                          {link.label}
                        </span>
                        <span aria-hidden="true" className="ml-auto text-2xl font-light opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100">
                          ↗
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <motion.div
                className="flex items-end justify-between gap-5 border-t border-black/15 pt-5"
                variants={{ closed: { opacity: 0, y: 12 }, open: { opacity: 1, y: 0 } }}
                transition={{ delay: reduceMotion ? 0 : 0.48, duration: reduceMotion ? 0 : 0.4 }}
              >
                <p className="max-w-56 text-xs leading-5 text-black/55">
                  Websites, ecommerce y aplicaciones a medida.
                </p>
                <a href="mailto:hola@valinor.agency" className="text-xs font-semibold underline decoration-black/25 underline-offset-4">
                  hola@valinor.agency
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

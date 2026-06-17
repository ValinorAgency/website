"use client";

import { AnimatePresence, cubicBezier, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

const expo = cubicBezier(0.16, 1, 0.3, 1);

const links = [
  { label: "About", href: "#about" },
  { label: "Servicios", href: "#servicios" },
  { label: "Trabajos", href: "#trabajos" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: expo }}
      className="relative z-[var(--z-sticky)] w-full"
      style={{
        background: "transparent",
      }}
    >
      <div className="w-full px-5 py-3.5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <a href="#" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/VALINOR.png" alt="Valinor Agency" className="h-10 w-auto" />
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-white hover:bg-white/[0.08]"
                style={{ color: "rgba(255,255,255,0.78)" }}
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
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "rgba(255,255,255,0.07)",
                color: "var(--ink)",
              }}
              aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <div className="flex flex-col gap-1.5 w-4">
                <span
                  className={`h-0.5 w-full rounded-full transition-transform duration-300`}
                  style={{
                    background: "var(--ink)",
                    transform: menuOpen ? "translateY(8px) rotate(45deg)" : "",
                  }}
                />
                <span
                  className="h-0.5 w-full rounded-full transition-all duration-300"
                  style={{
                    background: "var(--ink)",
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="h-0.5 w-full rounded-full transition-transform duration-300"
                  style={{
                    background: "var(--ink)",
                    transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden lg:hidden"
            style={{ borderTop: "1px solid var(--border)", background: "rgba(8, 8, 12, 0.96)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          >
            <div className="section-inner flex flex-col gap-1 px-5 py-4 sm:px-8">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                  style={{ color: "var(--ink-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.color = "var(--ink-muted)";
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setMenuOpen(false)}
                className="pill-button-dark mt-2 justify-center px-5 py-3"
              >
                Hablemos
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

"use client";

import { useEffect, useState } from "react";

const WHATSAPP_MESSAGE =
  "Hola, me gustaría conversar sobre un proyecto digital con Valinor Agency.";
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setShowBackToTop(window.scrollY > Math.min(window.innerHeight * 0.8, 720));
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <nav
      aria-label="Accesos rápidos"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[var(--z-sticky)] flex flex-col items-end gap-2 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-6"
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar a Valinor Agency por WhatsApp"
        className="group flex h-11 items-center rounded-full border border-white/10 bg-[#15151a]/95 px-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#25D366]/50 hover:bg-[#1a1a20] focus-visible:outline-[#25D366]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
          <path d="M12.04 2a9.83 9.83 0 0 0-8.5 14.75L2 22l5.38-1.5A9.96 9.96 0 1 0 12.04 2Zm0 17.97a8.05 8.05 0 0 1-4.1-1.12l-.3-.18-3.2.89.85-3.11-.2-.32a7.98 7.98 0 1 1 6.95 3.84Zm4.4-5.98c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.2a7.3 7.3 0 0 1-1.34-1.67c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.59 4.11 3.63.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
        </svg>
        <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[width,opacity,margin] duration-300 ease-out group-hover:ml-2.5 group-hover:w-[5.4rem] group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:w-[5.4rem] group-focus-visible:opacity-100">WhatsApp</span>
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Volver arriba"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#15151a]/95 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-[opacity,transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#1a1a20] ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="m6.5 14.5 5.5-5 5.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
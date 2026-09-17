"use client";

import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { scrollToHash } from "@/lib/scroll-to-hash";

export default function Footer() {
  const year = new Date().getFullYear();
  const reduceMotion = useReducedMotion();
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");

  const links = [
    { label: t("inicio"), href: "#about" },
    { label: t("servicios"), href: "#servicios" },
    { label: t("capacidades"), href: "#capacidades" },
    { label: t("porQue"), href: "#por-que" },
    { label: t("equipo"), href: "#equipo" },
    { label: t("contacto"), href: "#contacto" },
  ];

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToHash(href, reduceMotion);
  };

  return (
    <footer
      id="footer"
      className="px-5 py-12 sm:px-8"
      style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div className="section-inner">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <a href="#" onClick={(event) => handleAnchorClick(event, "#")} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logoValinor-removebg.png"
                alt=""
                aria-hidden="true"
                className="h-20 w-20 object-contain brightness-0 invert"
              />
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]">{tFooter("brand")}</span>
            </a>
            <p className="mt-4 text-sm leading-6" style={{ color: "var(--ink-muted)" }}>
              {tFooter("tagline")}
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleAnchorClick(event, link.href)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-raised)",
                  color: "var(--ink-muted)",
                  boxShadow: "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div
          className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}
        >
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>{tFooter("copyright", { year })}</p>
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>{tFooter("bottomTagline")}</p>
        </div>
      </div>
    </footer>
  );
}

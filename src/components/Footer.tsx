"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Inicio", href: "#about" },
    { label: "Servicios", href: "#servicios" },
    { label: "Soluciones", href: "#soluciones" },
    { label: "Proyectos", href: "#portfolio" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <footer
      id="footer"
      className="px-5 py-12 sm:px-8"
      style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div className="section-inner">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <a href="#" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logoValinor-removebg.png"
                alt=""
                aria-hidden="true"
                className="h-20 w-20 object-contain brightness-0 invert"
              />
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-[var(--ink)]">Valinor Agency</span>
            </a>
            <p className="mt-4 text-sm leading-6" style={{ color: "var(--ink-muted)" }}>
              Diseñamos y desarrollamos soluciones web claras, útiles y adaptadas a cada negocio.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
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
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>© {year} Valinor Agency.</p>
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>Websites, ecommerce y aplicaciones a medida</p>
        </div>
      </div>
    </footer>
  );
}

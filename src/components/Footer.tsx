"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "About", href: "#about" },
    { label: "Servicios", href: "#servicios" },
    { label: "Trabajos", href: "#trabajos" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <footer
      id="footer"
      className="px-5 py-12 sm:px-8"
      style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="section-inner">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <a href="#" className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "var(--brand)" }}
              >
                <span className="font-display text-xs font-bold text-white tracking-tight">SL</span>
              </div>
              <p className="font-display text-[0.95rem] font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
                Valinor Agency
              </p>
            </a>
            <p className="mt-4 text-sm leading-6" style={{ color: "var(--ink-muted)" }}>
              Diseñamos interfaces que transmiten precisión, criterio y confianza.
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
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>Web premium y automatización de IA</p>
        </div>
      </div>
    </footer>
  );
}

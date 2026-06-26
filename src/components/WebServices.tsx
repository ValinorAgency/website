"use client";
import { cubicBezier, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger);

function MagneticTag({ children }: { children: string }) {
  const el  = useRef<HTMLSpanElement>(null);
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const sx  = useSpring(mx, { stiffness: 280, damping: 18, mass: 0.6 });
  const sy  = useSpring(my, { stiffness: 280, damping: 18, mass: 0.6 });

  function onMove(e: React.MouseEvent) {
    const r = el.current!.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width  / 2)) * 0.38);
    my.set((e.clientY - (r.top  + r.height / 2)) * 0.38);
  }
  function onLeave() { mx.set(0); my.set(0); }

  return (
    <motion.span
      ref={el}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ borderColor: "rgba(0,0,0,0.35)", color: "rgba(17,17,17,0.9)" }}
      transition={{ duration: 0.18 }}
      style={{
        x: sx, y: sy,
        display: "inline-block",
        fontSize: "0.85rem",
        padding: "0.4rem 1.1rem",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "99px",
        color: "rgba(17,17,17,0.50)",
        letterSpacing: "0.02em",
        cursor: "default",
      }}
    >
      {children}
    </motion.span>
  );
}

const expo = cubicBezier(0.16, 1, 0.3, 1);

const NAVBAR_H      = 72;   // px — fixed navbar height
const STACK_PEEK    = 64;   // px — visible gap between stacked card tabs
const SCROLL_BUF_VH = 1.1;  // viewport heights of scroll per card
const CARD_HEIGHT   = 750;  // px — card height

const services = [
  {
    num: "01",
    lines: ["Sitios", "Web"],
    desc: "Desde landing pages de alta conversión hasta presencias corporativas completas. Diseño a medida, SEO, mobile y CMS para que lo manejés vos.",
    tags: ["Landing Pages", "Corporativos", "SEO", "CMS"],
    bg: "#FFFFFF",
  },
  {
    num: "02",
    lines: ["E-", "Commerce"],
    desc: "Tiendas online preparadas para vender desde el día uno. Catálogos, pagos integrados, inventario y panel de gestión completo a medida.",
    tags: ["Pagos", "Inventario", "Panel admin"],
    bg: "#F6F6F6",
  },
  {
    num: "03",
    lines: ["Plataformas", "& Apps"],
    desc: "Aplicaciones web internas y conexiones con cualquier servicio externo. CRMs propios, portales de clientes, ERPs, APIs y herramientas de equipo.",
    tags: ["Dashboards", "APIs", "Integraciones", "Auth"],
    bg: "#EEEEEE",
  },
  {
    num: "04",
    lines: ["Mantenimiento", "& Soporte"],
    desc: "Tu web actualizada, segura y en funcionamiento. Monitoreo proactivo, actualizaciones y soporte técnico continuo sin sorpresas.",
    tags: ["Uptime", "Updates", "Seguridad"],
    bg: "#E6E6E6",
  },
  {
    num: "05",
    lines: ["Tiendas en", "Plataformas"],
    desc: "Shopify y Tienda Nube: las plataformas líderes para vender online sin desarrollo a medida. Setup completo, tema custom y pagos locales integrados.",
    tags: ["Shopify", "Tienda Nube", "Mercado Pago"],
    badge: "Económico",
    bg: "#DEDEDE",
  },
];

export default function WebServices() {
  const ref      = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inView   = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduce   = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const container = cardsRef.current;
    const cards     = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
    if (!container || cards.length !== services.length) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Mobile: cards flow vertically, each slides in from below on scroll
      const tweens = cards.map(card =>
        gsap.fromTo(card,
          { y: 50, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        )
      );
      return () => {
        tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
        cards.forEach(card => gsap.set(card, { clearProps: "all" }));
      };
    }

    // Desktop: pin the container and stack cards via GSAP
    const N     = services.length;
    const slotH = window.innerHeight * SCROLL_BUF_VH;
    const dwell = window.innerHeight * 0.35;
    const total = (N - 1) * slotH + dwell;

    // Set container to a fixed viewport height so absolute cards clip correctly
    gsap.set(container, { height: window.innerHeight - NAVBAR_H });

    // Cards switch to absolute positioning; left:0/right:0 combined with the
    // JSX margin gives the same horizontal inset as the mobile layout
    cards.forEach((card, i) => {
      gsap.set(card, {
        position: "absolute",
        top: i * STACK_PEEK,
        left: 0,
        right: 0,
        y: i * slotH,
        scale: 1,
        transformOrigin: "50% 0%",
      });
    });

    const st = ScrollTrigger.create({
      trigger: container,
      pin: true,
      pinSpacing: true,
      start: `top top+=${NAVBAR_H}`,
      end: `+=${total}`,
      scrub: true,
      onUpdate(self) {
        const slots = (self.progress * total) / slotH;
        cards.forEach((card, i) => {
          const depth = Math.min(Math.max(0, slots - i), N - 1 - i);
          gsap.set(card, {
            y:     Math.max(0, (i - slots) * slotH),
            scale: depth > 0.005 ? 1 - depth * 0.04 : 1,
          });
        });
      },
    });

    return () => {
      st.kill();
      gsap.set(container, { clearProps: "height" });
      cards.forEach(card =>
        gsap.set(card, { clearProps: "position,top,left,right,y,scale,transformOrigin" })
      );
    };
  }, [reduce]);

  return (
    <section ref={ref} id="servicios" style={{ position: "relative", zIndex: 15 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "clamp(5rem, 12vw, 9rem) clamp(1.5rem, 6vw, 5rem) clamp(3.5rem, 8vw, 7rem)" }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: expo }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(3.5rem, 7.5vw, 9rem)",
              fontWeight: 600,
              letterSpacing: "-0.045em",
              color: "var(--ink)",
              lineHeight: 1.0,
              maxWidth: "16ch",
              marginBottom: "100px"
            }}
          >
            Todo lo que tu negocio necesita.
          </h2>
        </motion.div>
      </div>

      {/* ── Stacking cards — pinned by ScrollTrigger (desktop) ─────────────── */}
      <div
        ref={cardsRef}
        style={{ position: "relative", overflow: "hidden", zIndex: 15 }}
      >
        {services.map((s, i) => (
          <div
            key={s.num}
            ref={el => { cardRefs.current[i] = el; }}
            className="relative"
            style={{
              // position comes from className="relative"; GSAP overrides to
              // "absolute" on desktop without React resetting it on re-renders
              height: CARD_HEIGHT,
              margin: "0 clamp(2rem, 6vw, 5rem)",
              marginBottom: "clamp(1rem, 3vw, 1.5rem)",
              zIndex: i + 1,
              background: s.bg,
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
              willChange: "transform",
            }}
          >
            {/* Subtle top glow */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 70% 25% at 50% 0%, rgba(0,0,0,0.02) 0%, transparent 70%)",
            }} />

            <div style={{
              position: "relative",
              height: "100%",
              padding: "clamp(2rem, 4vw, 3.5rem) clamp(2rem, 5vw, 4.5rem)",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Number + badge — top right */}
              <div style={{
                position: "absolute",
                top: "clamp(1.5rem, 3vw, 2.5rem)",
                right: "clamp(2rem, 5vw, 4.5rem)",
                display: "flex", alignItems: "center", gap: "0.6rem",
              }}>
                {"badge" in s && (
                  <span style={{
                    fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "0.2rem 0.65rem",
                    background: "rgba(36,214,188,0.10)",
                    border: "1px solid rgba(36,214,188,0.22)",
                    borderRadius: "99px",
                    color: "#24D6BC",
                  }}>
                    {(s as typeof s & { badge: string }).badge}
                  </span>
                )}
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.6rem", letterSpacing: "0.1em",
                  color: "rgba(0,0,0,0.22)",
                }}>
                  {s.num}
                </span>
              </div>

              {/* Title — top left, large, two-tone */}
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(3.2rem, 6.5vw, 8rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.0,
                  margin: 0,
                }}
              >
                <span style={{ display: "block", color: "#111111" }}>{s.lines[0]}</span>
                <span style={{ display: "block", color: "rgba(17,17,17,0.28)" }}>{s.lines[1]}</span>
              </h3>

              {/* Tags + description */}
              <div style={{ marginTop: "10.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {s.tags.map(t => <MagneticTag key={t}>{t}</MagneticTag>)}
                </div>

                <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: "1rem", color: "rgba(36,214,188,0.7)",
                    flexShrink: 0, marginTop: "0.1rem", lineHeight: 1.6,
                  }}>
                    ✳
                  </span>
                  <p style={{
                    fontFamily: "var(--font-lora), Georgia, serif",
                    fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
                    color: "rgba(17,17,17,0.65)",
                    lineHeight: 1.75,
                    margin: 0,
                    maxWidth: "55ch",
                  }}>
                    {s.desc}
                  </p>
                </div>
              </div>

              <div style={{ flex: 1 }} />
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

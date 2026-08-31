import { ImageResponse } from "next/og";

export const alt = "Valinor Agency — Diseño y desarrollo web a medida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Constelación sutil de partículas para el sector derecho: mismo lenguaje
// visual (puntos blancos/teal) que BackgroundCanvas.tsx en el sitio real,
// no un ícono decorativo genérico.
const particles = [
  { top: "8%", left: "20%", size: 4, color: "#EEEEF2", opacity: 0.55 },
  { top: "13%", left: "74%", size: 3, color: "#EEEEF2", opacity: 0.4 },
  { top: "19%", left: "42%", size: 5, color: "#24D6BC", opacity: 0.75 },
  { top: "27%", left: "86%", size: 3, color: "#EEEEF2", opacity: 0.35 },
  { top: "37%", left: "14%", size: 3, color: "#EEEEF2", opacity: 0.5 },
  { top: "45%", left: "66%", size: 6, color: "#EEEEF2", opacity: 0.6 },
  { top: "53%", left: "32%", size: 4, color: "#24D6BC", opacity: 0.55 },
  { top: "61%", left: "82%", size: 3, color: "#EEEEF2", opacity: 0.4 },
  { top: "69%", left: "52%", size: 5, color: "#EEEEF2", opacity: 0.65 },
  { top: "77%", left: "22%", size: 3, color: "#24D6BC", opacity: 0.5 },
  { top: "84%", left: "70%", size: 4, color: "#EEEEF2", opacity: 0.45 },
  { top: "91%", left: "40%", size: 3, color: "#EEEEF2", opacity: 0.3 },
] as const;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#060609",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "0 28px 0 76px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontSize: 74, fontWeight: 700, color: "#EEEEF2", letterSpacing: -2 }}>
              Valinor
            </span>
            <span style={{ fontSize: 74, fontWeight: 300, color: "#C9C9D3", letterSpacing: -2 }}>
              Agency
            </span>
          </div>

          <div style={{ display: "flex", marginTop: 28, width: 96, height: 5, borderRadius: 3, backgroundColor: "#24D6BC" }} />

          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 38,
              fontWeight: 600,
              lineHeight: 1.25,
              color: "#EEEEF2",
            }}
          >
            Diseño y desarrollo web a medida
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 24,
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#C9C9D3",
            }}
          >
            Sitios web · Tiendas online · Aplicaciones · Dashboards
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: 420, height: "100%" }}>
          {/* Líneas finas, como acentos abstractos */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "58%",
              left: "6%",
              width: 130,
              height: 2,
              borderRadius: 1,
              backgroundColor: "rgba(238,238,242,0.22)",
              transform: "rotate(-24deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "10%",
              left: "50%",
              width: 100,
              height: 2,
              borderRadius: 1,
              backgroundColor: "rgba(238,238,242,0.18)",
              transform: "rotate(32deg)",
            }}
          />

          {/* Partículas */}
          {particles.map((particle) => (
            <div
              key={`${particle.top}-${particle.left}`}
              style={{
                display: "flex",
                position: "absolute",
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
                borderRadius: 9999,
                backgroundColor: particle.color,
                opacity: particle.opacity,
              }}
            />
          ))}

          {/* Acento de estrella, pequeño y sobrio (sin brillo ni degradé) */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "24%",
              left: "58%",
              width: 44,
              height: 3,
              borderRadius: 2,
              backgroundColor: "#24D6BC",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "24%",
              left: "58%",
              width: 3,
              height: 44,
              borderRadius: 2,
              backgroundColor: "#24D6BC",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}

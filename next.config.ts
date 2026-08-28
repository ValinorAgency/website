import type { NextConfig } from "next";

// CSP construida a partir de los recursos reales del sitio (ver docs/ARCHITECTURE.md):
// todo el contenido, imágenes, modelos .glb y fuentes (next/font) son same-origin;
// no hay iframes, analytics ni fetch/XHR a dominios externos; wa.me y mailto: son
// navegación por <a href>, no recursos cargados por la página.
//
// 'unsafe-inline' en script-src: Next.js App Router inyecta <script> inline con el
// payload de hidratación de Server Components (self.__next_f.push(...)). Sin un
// middleware que genere un nonce por request, next.config.ts no puede aplicar CSP
// con nonces, así que se documenta esta concesión como deuda técnica en
// docs/ARCHITECTURE.md y docs/QUALITY.md en vez de omitirla silenciosamente.
//
// 'unsafe-inline' en style-src: hay atributos style={{...}} servidos en el HTML
// (por ejemplo tamaños clamp() en el hero) y Framer Motion/GSAP escriben la
// propiedad style directamente por JS. No se usa unsafe-eval: los shaders
// GLSL/WGSL de Three.js se compilan vía la API gráfica del navegador, no
// mediante eval/Function de JavaScript.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // max-age sin includeSubDomains ni preload: no hay dominio propio confirmado
  // ni política de HTTPS garantizada en todos los subdominios todavía.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Compatibilidad adicional a frame-ancestors 'none' de la CSP.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    // Los headers de seguridad solo se aplican al build/runtime de producción.
    // En `next dev` no se aplican para no arriesgar el HMR/Fast Refresh, que no
    // es la superficie pública del sitio.
    if (process.env.NODE_ENV !== "production") return [];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

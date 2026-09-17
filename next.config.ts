import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

// CSP construida a partir de los recursos reales del sitio (ver docs/ARCHITECTURE.md):
// todo el contenido, imágenes, modelos .glb y fuentes (next/font) son same-origin;
// no hay iframes, analytics ni fetch/XHR a dominios externos; wa.me y mailto: son
// navegación por <a href>, no recursos cargados por la página.
//
// 'unsafe-inline' en script-src: Next.js App Router inyecta <script> inline con el
// payload de hidratación de Server Components (self.__next_f.push(...)). Existe
// src/middleware.ts (next-intl, para el ruteo /es /en), pero no genera un nonce
// por request — agregar eso es trabajo aparte, no algo que next-intl resuelva
// solo. Mientras no haya nonce, next.config.ts no puede aplicar CSP con nonces,
// así que se documenta esta concesión como deuda técnica en docs/ARCHITECTURE.md
// y docs/QUALITY.md en vez de omitirla silenciosamente.
//
// 'wasm-unsafe-eval' en script-src: @react-three/rapier (motor de física del
// lanyard del equipo) carga rapier3d-compat como WebAssembly; los navegadores
// modernos bloquean WebAssembly.instantiate() bajo CSP sin este permiso. Es más
// acotado que 'unsafe-eval' (no habilita eval/Function de JS, solo WASM).
//
// blob: en img-src y en connect-src: las tarjetas del equipo (.glb, ver
// LanyardCard.tsx) traen su textura embebida dentro del binario; THREE.GLTFLoader
// la extrae creando un blob: URL en memoria y la carga vía fetch (connect-src),
// no como <img> (img-src) — hace falta en los dos porque no quedó documentado de
// antemano cuál de los dos usa el loader internamente. Sin esto el navegador
// bloquea esa carga (silenciosamente en local con `next dev`, que no aplica CSP,
// pero sí en producción) y las tarjetas quedan con la geometría pero sin
// textura — es decir, en blanco.
//
// 'unsafe-inline' en style-src: hay atributos style={{...}} servidos en el HTML
// (por ejemplo tamaños clamp() en el hero) y Framer Motion/GSAP escriben la
// propiedad style directamente por JS.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self' blob:",
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
  // Evita la cabecera "X-Powered-By: Next.js" (fingerprinting trivial del
  // framework/versión para quien esté evaluando el sitio).
  poweredByHeader: false,
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

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

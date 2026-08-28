# Architecture

## Resumen del sistema

Sitio institucional público construido con Next.js App Router. La implementación actual es principalmente una landing estática con componentes cliente para animación e interacción.

No existe backend propio, persistencia, autenticación, CMS ni API de negocio.

## Stack confirmado

- Next.js 16.2.9;
- React y React DOM 19.2.4;
- TypeScript 5;
- Tailwind CSS 4;
- Framer Motion;
- GSAP;
- Three.js;
- React Three Fiber;
- Leva en componentes experimentales;
- next/font.

Las versiones exactas y rangos autorizados están en package.json.

## Rutas

| Ruta | Propósito | Estado |
| --- | --- | --- |
| / | Home institucional | Activa |
| /sprite-probe | Prototipo aislado de partículas WebGPU | Experimental; no debe considerarse página pública aprobada |
| /_not-found | Página automática de Next.js | Activa |

La eliminación o exclusión de indexación de /sprite-probe está pendiente de implementación.

## Composición de la home

src/app/page.tsx compone:

- Navbar;
- HeroParticleAlt;
- Portfolio;
- TechStackSection;
- ScrollTextLines;
- WhyUs;
- FinalCTA;
- Footer.

src/app/layout.tsx aplica globalmente:

- metadata base;
- fuentes;
- LoadingOverlay;
- BackgroundCanvas;
- CustomCursor;
- FloatingActions.

Los efectos globales también se aplican actualmente a /sprite-probe.

## Fronteras y responsabilidades

### src/app

- rutas;
- layout;
- metadata;
- estilos globales.

### src/components

- secciones de contenido;
- animaciones;
- canvas y WebGL;
- navegación;
- CTA y formulario.

### public

- logos e imágenes;
- modelos 3D;
- archivos ZIP y recursos experimentales.

Todo archivo en public/ puede quedar expuesto mediante URL directa al desplegar.

## Server y Client Components

src/app/page.tsx y el layout son Server Components, pero la mayoría de las secciones renderizadas declaran use client por animaciones, estado o APIs del navegador.

La home incluye Framer Motion, GSAP y Three.js en el bundle cliente. La reducción de límites cliente y la carga diferida de efectos están pendientes de evaluación.

## Contacto

### Formulario

El formulario actual:

- valida mediante atributos HTML;
- crea un asunto y cuerpo en el navegador;
- redirige a un enlace mailto:;
- no envía datos a un backend;
- no ofrece confirmación real de recepción;
- no almacena información.

Arquitectura confirmada para el formulario real (implementación pendiente):

- proveedor: Resend;
- procesamiento: ruta de servidor (Route Handler) de Next.js;
- campos: nombre, email o WhatsApp, tipo de proyecto y mensaje;
- tipos de proyecto: sitio web, tienda online, aplicación web/dashboard, otro;
- destinatario: `agencyvalinor@gmail.com`;
- Reply-To: email ingresado por el visitante cuando corresponda;
- remitente definitivo: Pending confirmation, depende de comprar y verificar el dominio oficial;
- variable de entorno prevista: `RESEND_API_KEY`;
- debe incluir validación en cliente y en servidor, estados de carga, éxito y error, honeypot antispam y protección básica contra abuso (rate limiting).

El correo `hola@valinor.agency` referenciado actualmente en `src/components/Navbar.tsx` y `src/components/FinalCTA.tsx` queda descartado como canal operativo. Debe reemplazarse por `agencyvalinor@gmail.com` al implementar; ver hallazgo P0-03 de la auditoría.

### WhatsApp

El botón flotante genera un enlace wa.me con texto precargado, pero sin número de destino.

Número comercial confirmado (provisional): +54 9 11 5015-2833.
Enlace técnico: https://wa.me/5491150152833.
Mensaje inicial sugerido: "Hola, estuve viendo la web de Valinor y quisiera consultar por un proyecto."

Implementación pendiente; ver hallazgo P0-02 de la auditoría.

## Datos y persistencia

Not applicable en el estado actual (sin backend ni base de datos propios).

Para el formulario real, decidido y pendiente de implementación:

- proveedor: Resend;
- datos recopilados: nombre, email o WhatsApp, tipo de proyecto y mensaje;
- validación: cliente y servidor;
- retención: Pending confirmation;
- protección antispam: honeypot;
- rate limiting: protección básica contra abuso, mecanismo específico Pending confirmation;
- tratamiento de errores: estados de carga, éxito y error en el cliente;
- variables de entorno: `RESEND_API_KEY`;
- obligaciones de privacidad aplicables: Pending confirmation.

## Integraciones

### Confirmadas (implementadas)

- enlaces mailto:;
- enlace externo a WhatsApp;
- Google Fonts procesadas mediante next/font.

### Decididas, pendientes de implementación

- Resend como proveedor de email para el formulario de contacto (vía ruta de servidor de Next.js);
- número de WhatsApp comercial (provisional): +54 9 11 5015-2833;
- hosting: Vercel.

### Pendientes

- analytics;
- Search Console;
- dominio oficial (candidato: `valinoragency.com.ar`, no comprado);
- remitente definitivo del formulario (depende del dominio).

## SEO

La metadata se define actualmente en src/app/layout.tsx.

Existen title, description y Open Graph básico. Faltan o requieren confirmación:

- metadataBase;
- canonical;
- URL Open Graph;
- imagen Open Graph;
- Twitter/X image;
- robots.ts;
- sitemap.ts;
- datos estructurados;
- dominio oficial (candidato: `valinoragency.com.ar`, pendiente de compra).

## Seguridad

- No se encontraron secretos versionados durante la auditoría del 28 de agosto de 2026.
- No existen endpoints de negocio, autenticación ni base de datos.
- Las dependencias actuales presentan vulnerabilidades documentadas en la auditoría.

### Headers de seguridad (confirmado, 2026-08-28)

`next.config.ts` configura, vía `headers()`, los siguientes headers para todas las rutas (`/:path*`), aplicados solo cuando `NODE_ENV === "production"` (no se aplican en `next dev`, para no arriesgar el HMR de desarrollo, que no es la superficie pública):

- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
- `Strict-Transport-Security`: `max-age=31536000`;
- `X-Content-Type-Options`: `nosniff`;
- `Referrer-Policy`: `strict-origin-when-cross-origin`;
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`;
- `X-Frame-Options`: `DENY` (compatibilidad adicional a `frame-ancestors 'none'`).

Recursos verificados que sustentan la política (todos same-origin): HTML/JS/CSS servidos por Next.js, imágenes y modelos `.glb` en `public/`, fuentes Inter/Lora/Cinzel/DM Sans auto-hospedadas por `next/font/google` bajo `/_next/static/media/*.woff2`. El único enlace externo real del sitio es `wa.me` (navegación por `<a href>`, no un recurso cargado por la página). No hay `<iframe>`, analytics, `fetch`/XHR a dominios externos ni Web Workers. No se usa `unsafe-eval`: los shaders GLSL/WGSL de Three.js (WebGL y WebGPU) se compilan vía la API gráfica del navegador, no mediante `eval`/`Function` de JavaScript.

Deuda técnica registrada:

- `script-src 'unsafe-inline'`: Next.js App Router inyecta `<script>` inline con el payload de hidratación de Server Components (`self.__next_f.push(...)`); verificado en el HTML servido (2 bloques inline en `/`). Configurar headers solo desde `next.config.ts`, sin middleware, no permite generar un nonce por request para evitar esta concesión.
- `style-src 'unsafe-inline'`: el HTML servido contiene atributos `style="..."` reales (verificado: 78 en `/`, por ejemplo tamaños `clamp()` en el hero) y Framer Motion/GSAP escriben la propiedad `style` directamente por JS.
- `Strict-Transport-Security` sin `includeSubDomains` ni `preload`: pendiente hasta confirmar el dominio oficial y que todos los subdominios futuros estarán siempre bajo HTTPS.
- Los headers solo se aplican en runtime de producción (`next build && next start`, y por extensión Vercel); no se aplican en `next dev`.
- Verificación realizada con `npm run start` en local; falta verificar los headers sobre el dominio y hosting definitivos una vez desplegados (ver hallazgo P0-04 de la auditoría).

## Rendimiento

Factores relevantes:

- Three.js y WebGL en el hero;
- Framer Motion y GSAP;
- canvas global con animación continua;
- loader artificial;
- cuatro familias importadas globalmente;
- alta cantidad de Client Components;
- assets públicos de gran tamaño.

El objetivo cuantitativo de rendimiento está Pending confirmation.

## Deploy y operaciones

- Repositorio: ValinorAgency/website.
- Rama auditada: development.
- Proyecto Vercel dentro del equipo Valinor Agency: no identificado durante la auditoría del 28 de agosto de 2026.
- Hosting de producción: confirmado (Vercel). Proyecto de despliegue todavía no configurado.
- Dominio: no comprado. Candidato principal: `valinoragency.com.ar`.
- CI/CD: no configurado en el repositorio.

## Restricciones técnicas

- preservar App Router y el stack actual salvo decisión aprobada;
- evitar nuevas dependencias sin justificación;
- no introducir servicios externos sin autorización;
- mantener TypeScript estricto;
- priorizar mobile, accesibilidad y rendimiento;
- no convertir experimentos en rutas públicas de producción;
- no exponer secretos o datos personales.

## Preguntas abiertas

- ¿Cuándo se comprará el dominio oficial? Candidato principal: `valinoragency.com.ar`.
- ¿Cuál será el remitente definitivo del formulario? Depende de comprar y verificar el dominio.
- ¿Se mantendrá Three.js en el hero para todos los dispositivos?
- ¿Se eliminarán componentes y assets experimentales?
- ¿Se incorporará CI para lint, build y auditoría?

Resueltas por decisión confirmada del usuario (2026-08-28), pendientes de implementación: hosting (Vercel), ruta y proveedor del formulario (ruta de servidor de Next.js + Resend).


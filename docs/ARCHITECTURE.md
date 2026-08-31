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
| /api/contact | Route Handler (POST) que procesa el formulario de contacto vía Resend | Activa (implementada 2026-08-28) |
| /robots.txt | Generado por `src/app/robots.ts` (convención de Next.js) | Activa (implementada 2026-08-31) |
| /sitemap.xml | Generado por `src/app/sitemap.ts` (convención de Next.js) | Activa (implementada 2026-08-31) |
| /opengraph-image | Imagen social generada por `src/app/opengraph-image.tsx` (`next/og`), reutilizada para Twitter | Activa (implementada 2026-08-31) |
| /_not-found | Página automática de Next.js | Activa |

`/sprite-probe` (prototipo aislado de partículas WebGPU) se eliminó como ruta pública el 2026-08-31: se borró `src/app/sprite-probe/page.tsx` porque no era parte de la home ni estaba enlazada desde ningún lugar público. Ya no es una ruta indexable (`/sprite-probe` responde 404, verificado).

**Archivo huérfano para el bloque de limpieza posterior:** `src/components/SpriteParticleProbe.tsx` era usado exclusivamente por esa página y ahora no tiene ningún consumidor en el código. No se eliminó en esta tarea (fuera de alcance: solo se pidió retirar la ruta pública); queda pendiente para una limpieza posterior, junto con el resto de componentes experimentales ya identificados (ver P2-05 de la auditoría).

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

/sprite-probe ya no existe como ruta (ver "Rutas" arriba), así que los efectos globales del layout solo se aplican a las rutas activas.

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

### Formulario (implementado, 2026-08-28)

`src/components/FinalCTA.tsx` envía el formulario mediante `fetch` a `POST /api/contact` (`src/app/api/contact/route.ts`), same-origin, sin exponer ninguna credencial al navegador. Ya no usa `mailto:`.

Contrato de `POST /api/contact`:

- request JSON: `{ name, contact, projectType, message, company }` (`company` es el honeypot, debe llegar vacío);
- `projectType` es una lista cerrada: `sitio-web`, `tienda-online`, `aplicacion-web-dashboard`, `otro`;
- `contact` acepta un email válido o un teléfono razonable (8 a 15 dígitos);
- respuesta éxito: `200 { ok: true }`;
- respuesta validación fallida: `400 { ok: false, error: "validation", fields: { ... } }`;
- respuesta límite de solicitudes: `429 { ok: false, error: "rate_limited" }`;
- respuesta sin `RESEND_API_KEY` configurada: `500 { ok: false, error: "config" }`;
- respuesta con error de Resend o de red al enviar: `502 { ok: false, error: "send_failed" }`;
- si el honeypot llega completo, responde `200 { ok: true }` sin enviar nada (no revela la protección).

Validación implementada en `src/lib/contact-validation.ts`, compartida entre cliente y servidor (trim, límites de longitud, lista cerrada de tipo de proyecto, email o teléfono razonable). El cliente no confía únicamente en atributos HTML (`noValidate` + validación propia); el servidor revalida todo de forma independiente.

Antispam y abuso:

- honeypot oculto (`company`) fuera del flujo de tabulación y con `aria-hidden="true"`, para no interferir con teclado ni lectores de pantalla;
- rate limiting en `src/app/api/contact/rate-limit.ts`: máximo 5 solicitudes cada 10 minutos por IP (`x-forwarded-for`), en memoria del proceso. Es **best-effort**: en Vercel serverless cada instancia/cold start tiene su propia memoria, así que no garantiza un límite global entre instancias concurrentes. No se agregó Redis, base de datos ni CAPTCHA.

Envío de email (`resend`, dependencia oficial agregada a `package.json`):

- destinatario: `agencyvalinor@gmail.com`;
- remitente: `Valinor Agency <onboarding@resend.dev>` — **temporal**, es la dirección de pruebas provista por Resend; según el plan de la cuenta, Resend puede limitar a qué destinatarios puede entregar un remitente no verificado. El remitente definitivo queda pendiente hasta comprar y verificar el dominio oficial (`valinoragency.com.ar` candidato);
- Reply-To: se agrega solo cuando el contacto ingresado es un email válido (no cuando es un teléfono);
- variable de entorno: `RESEND_API_KEY` (ver `.env.example`; no versionada);
- el build funciona sin la variable configurada (verificado); en runtime, sin la variable el endpoint responde `500 { error: "config" }` en vez de intentar enviar o filtrar el error de Resend;
- los logs de servidor (`console.error`) no incluyen el mensaje del visitante ni datos personales, solo texto genérico de diagnóstico.

Pendiente:

- probar un envío real: no existe una `RESEND_API_KEY` válida disponible en este entorno, así que el envío efectivo a través de Resend no fue probado, solo el contrato del endpoint y el camino de error sin credenciales;
- remitente y dominio definitivos, una vez comprado y verificado el dominio oficial;
- retención de datos y obligaciones de privacidad aplicables (sin decidir).

El correo `hola@valinor.agency`, antes referenciado en `src/components/Navbar.tsx` y `src/components/FinalCTA.tsx`, fue reemplazado por `agencyvalinor@gmail.com` en ambos componentes.

### WhatsApp (implementado, 2026-08-28)

`src/components/FloatingActions.tsx` genera el enlace con el número comercial provisional y el mensaje precompletado, con `text` codificado mediante `encodeURIComponent`:

- número: +54 9 11 5015-2833;
- enlace: https://wa.me/5491150152833;
- mensaje: "Hola, estuve viendo la web de Valinor y quisiera consultar por un proyecto."

No quedan otras referencias a WhatsApp en el código con enlaces incompletos o inconsistentes (verificado).

## Datos y persistencia

No hay base de datos ni almacenamiento propio. El formulario de contacto (implementado, 2026-08-28) no persiste datos: los reenvía por email vía Resend en el momento de la solicitud.

- proveedor: Resend;
- datos recopilados: nombre, email o WhatsApp, tipo de proyecto y mensaje;
- validación: cliente y servidor (`src/lib/contact-validation.ts`);
- retención: Pending confirmation (no se almacena en el sitio; queda en la bandeja de `agencyvalinor@gmail.com` y en el historial de Resend);
- protección antispam: honeypot (implementado);
- rate limiting: básico, en memoria del proceso, best-effort (implementado; ver `docs/ARCHITECTURE.md` § Contacto);
- tratamiento de errores: estados de carga, éxito y error en el cliente (implementado);
- variables de entorno: `RESEND_API_KEY` (`.env.example` agregado; sin valor real versionado);
- obligaciones de privacidad aplicables: Pending confirmation.

## Integraciones

### Confirmadas (implementadas)

- Resend como proveedor de email para el formulario de contacto, vía `POST /api/contact` (código implementado 2026-08-28; envío real sin probar por falta de `RESEND_API_KEY` válida en este entorno);
- enlace de WhatsApp con número comercial provisional (+54 9 11 5015-2833);
- enlace mailto: directo a `agencyvalinor@gmail.com` como alternativa al formulario;
- Google Fonts procesadas mediante next/font.

### Decididas, pendientes de implementación

- hosting: Vercel.

### Pendientes

- analytics;
- Search Console;
- dominio oficial (candidato: `valinoragency.com.ar`, no comprado);
- remitente definitivo del formulario (depende del dominio);
- prueba de envío real del formulario con una `RESEND_API_KEY` válida.

## SEO (implementado, 2026-08-31)

### Resolución de la URL del sitio

`src/lib/site-url.ts` centraliza la resolución de la URL pública, sin asumir que el dominio candidato está comprado. Prioridad:

1. `SITE_URL` configurada explícitamente (variable server-only, sin prefijo `NEXT_PUBLIC_`; ver `.env.example`).
2. `VERCEL_PROJECT_PRODUCTION_URL` (dominio de producción que provee Vercel), cuando está disponible.
3. `VERCEL_URL` (URL del deployment actual), cuando corresponde.
4. `http://localhost:3000`, únicamente como último recurso para desarrollo local o un build local sin ninguna variable configurada.

Protección explícita contra previews: cuando `VERCEL_ENV === "preview"`, se ignoran `SITE_URL` y `VERCEL_PROJECT_PRODUCTION_URL` y se usa directamente `VERCEL_URL`, para que un deployment temporal nunca se anuncie a sí mismo (canonical, Open Graph, JSON-LD) como si fuera el dominio de producción. Verificado con `npm run build && npm run start`: sin ninguna variable, resuelve a `http://localhost:3000`; con `SITE_URL=valinoragency.com.ar` (sin protocolo), resuelve a `https://valinoragency.com.ar` (protocolo normalizado); con `VERCEL_ENV=preview` + `VERCEL_URL` + `SITE_URL` seteadas simultáneamente, usa la URL del preview y no la de `SITE_URL`.

El dominio candidato `valinoragency.com.ar` no está comprado ni activo; el código no lo presenta como tal, solo lo usaría si se asigna a `SITE_URL` en el entorno real.

### Metadata (`src/app/layout.tsx`)

- `metadataBase`: `new URL(getSiteUrl())`.
- `title`/`description` alineados con el copy visible del hero (`src/components/HeroParticleAlt.tsx`): título "Valinor Agency | Diseño y desarrollo web a medida", descripción "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina.".
- `alternates.canonical: "/"` (home).
- Open Graph completo: `title`, `description`, `url: "/"`, `siteName: "Valinor Agency"`, `locale: "es_AR"`, `type: "website"`; la imagen se agrega automáticamente por la convención de archivo `opengraph-image.tsx` (no se declara a mano).
- Twitter: `card: "summary_large_image"`, `title`, `description`; la imagen se reutiliza automáticamente de `opengraph-image.tsx` (comportamiento estándar de Next.js cuando no existe un `twitter-image` dedicado).
- JSON-LD `Organization` inyectado en `<head>` vía `<script type="application/ld+json">`, generado por `src/lib/organization-json-ld.ts` y serializado de forma segura (escapa `<` para que ningún valor pueda cerrar el `<script>` prematuramente). Solo datos confirmados: `name` "Valinor Agency", `url` (resuelta), `email` `agencyvalinor@gmail.com`, `telephone` `+5491150152833`, `areaServed` "Argentina", `description` (la misma del hero). Sin `address`, `priceRange`, `aggregateRating`, `foundingDate`, `numberOfEmployees` ni `sameAs`. Validado estructuralmente (JSON bien formado, `JSON.parse` exitoso) sobre el HTML servido.

### Imagen social (`src/app/opengraph-image.tsx`)

Generada con `next/og` (`ImageResponse`, incluido en Next.js, sin dependencias nuevas): fondo oscuro de marca (`#060609`), wordmark "Valinor Agency", una línea de acento teal (`#24D6BC`) y la propuesta comercial aprobada como texto de apoyo. 1200×630, `image/png`. No usa fotografías, imágenes externas ni assets generados.

### `robots.ts` y `sitemap.ts`

- `src/app/robots.ts` (corregido 2026-08-31): en producción/local permite todo (`allow: "/"`), bloquea `/api/` y apunta `sitemap` a la URL resuelta + `/sitemap.xml` (omitiendo la línea `Sitemap:` si la URL resuelta es `localhost`, para no anunciar un sitemap no público). Cuando `VERCEL_ENV === "preview"`, bloquea todo el rastreo (`disallow: "/"`) y no anuncia sitemap, para que un deployment temporal nunca quede indexable.
- `src/app/sitemap.ts`: incluye únicamente `/` (única página pública real). No incluye `/api/contact` ni `/sprite-probe` (eliminada). No declara `lastModified`: no existe una fecha real de modificación por página, y generarla en cada request sería una fecha inventada.

Pendiente: `metadataBase`/canonical/Open Graph/JSON-LD/sitemap ya resuelven una URL válida en todos los casos, pero la validación real ocurre recién sobre el dominio oficial una vez comprado, verificado y configurado como `SITE_URL` en Vercel (ver P0-04); indexación real mediante Google Search Console, todavía no configurada.

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
- ¿Funciona el envío real a través de Resend? No probado todavía: no hay una `RESEND_API_KEY` válida disponible en este entorno.
- ¿Se mantendrá Three.js en el hero para todos los dispositivos?
- ¿Se eliminarán componentes y assets experimentales?
- ¿Se incorporará CI para lint, build y auditoría?

Resueltas e implementadas: hosting decidido (Vercel, despliegue aún pendiente), formulario de contacto (`POST /api/contact` + Resend, código completo), WhatsApp con número provisional, reemplazo de `hola@valinor.agency` por `agencyvalinor@gmail.com` (2026-08-28); SEO técnico base — resolución de `SITE_URL`, metadata, `robots.ts`, `sitemap.ts`, imagen social y JSON-LD — y retiro de `/sprite-probe` como ruta pública (2026-08-31), pendiente de validación sobre el dominio real.


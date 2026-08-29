# Launch Readiness Audit — 2026-08-28

## Alcance

Auditoría read-only de la rama development orientada a:

- propuesta comercial y contenido;
- CTA y contacto;
- SEO;
- seguridad y dependencias;
- rendimiento;
- documentación y preparación para trabajo con agentes.

No se modificó implementación durante la auditoría.

## Resumen

La interfaz está avanzada y el proyecto compila, pero todavía no se considera listo para una publicación comercial. Los bloqueos principales son dependencias vulnerables, canales de contacto incompletos, SEO técnico pendiente y falta de evidencia comercial suficiente.

**Actualización documental — 28 de agosto de 2026:** el usuario confirmó un conjunto de decisiones de producto, contacto y contenido (hosting, dominio candidato, mercado, público, modalidad de trabajo, alcance de IA, tratamiento del portfolio, equipo, hero y arquitectura del formulario). Estas decisiones quedaron registradas en `PRODUCT.md`, `DESIGN.md` y `docs/ARCHITECTURE.md`. Ningún hallazgo se elimina por esto: los hallazgos con decisión confirmada se marcan explícitamente abajo, pero su implementación sigue pendiente y esta actualización no reemplaza una nueva ejecución de gates ni un nuevo browser QA.

## Evidencia verificada

- npm ci completado;
- npm run lint exitoso;
- npm run build exitoso;
- contenido estático generado para / y /sprite-probe;
- no se detectaron secretos versionados;
- next.config.ts sin headers configurados;
- proyecto website no identificado dentro del equipo Vercel de Valinor consultado;
- working tree limpio después de la auditoría.

## Prioridad P0 — antes de publicar

### P0-01 — Dependencias vulnerables

Estado: Resuelto (2026-08-28) para dependencias de producción relacionadas con Next.js.

Next.js 16.2.9 y sus dependencias transitivas de producción (`postcss`, `sharp`, `nanoid`) presentaban 4 vulnerabilidades de severidad alta registradas por `npm audit --omit=dev`. Se actualizó `next` y `eslint-config-next`, en versión coordinada, de `16.2.9` a `16.3.3`.

Versiones finales relevantes (`package-lock.json`):

- `next`: 16.2.9 → 16.3.3;
- `eslint-config-next`: 16.2.9 → 16.3.3;
- `postcss` (transitiva de `next`): 8.4.31 → 8.5.23;
- `sharp` (transitiva de `next`): 0.34.5 → 0.35.4;
- `nanoid` (transitiva de `postcss`): 3.3.12 → 3.3.18.

Resultado tras la actualización:

- `npm audit --omit=dev`: 0 vulnerabilidades (antes: 4 altas).
- `npm audit` (completo): 4 vulnerabilidades (1 moderada, 3 altas), todas en `devDependencies` sin relación con Next.js: `js-yaml` y `brace-expansion` (cadena de `eslint`/`typescript-eslint`) y una instancia de `postcss` propia de `@tailwindcss/postcss` (no la de `next`, ya corregida). Estas no forman parte del alcance de este hallazgo (dependencias de producción relacionadas con Next.js) y no se tocaron para evitar actualizaciones mayores o de riesgo no solicitadas.
- `npm run lint`: sin errores.
- `npm run build`: exitoso con Next.js 16.3.3; mismas rutas generadas (`/`, `/_not-found`, `/sprite-probe`).

No se usó `npm audit fix --force`. No se modificaron dependencias distintas de `next` y `eslint-config-next` en `package.json`; los cambios restantes en `package-lock.json` son transitivos de esas dos actualizaciones.

Si se desea eliminar también las vulnerabilidades de `devDependencies` señaladas arriba, requiere una decisión y tarea aparte (puede implicar actualizar `eslint` a una versión mayor).

### P0-02 — WhatsApp sin destinatario

Estado: Resuelto (2026-08-28). Implementación completada y verificada localmente.

FloatingActions generaba un enlace wa.me con mensaje, pero sin número de Valinor. Ahora usa `https://wa.me/5491150152833` con el mensaje "Hola, estuve viendo la web de Valinor y quisiera consultar por un proyecto." codificado correctamente con `encodeURIComponent`. Detalle en `docs/ARCHITECTURE.md`.

Verificado: HTML servido contiene el enlace completo; no quedan otras referencias a WhatsApp incompletas en el código.

Sigue pendiente: prueba manual en un dispositivo mobile real y, si se incorpora analytics, definir el evento de conversión (fuera del alcance de esta tarea).

### P0-03 — Formulario sin envío real

Estado: Resuelto (2026-08-29) para la implementación actual. Envío real verificado por el usuario.

FinalCTA usaba mailto y dependía de una aplicación de correo configurada, sin confirmación de recepción. Ahora envía vía `fetch` a `POST /api/contact` (Route Handler de Next.js + Resend), con validación en cliente y servidor, honeypot antispam y rate limiting básico. Contrato completo, campos y códigos de respuesta documentados en `docs/ARCHITECTURE.md` y `docs/QUALITY.md`.

Verificado localmente (`npm run start`, sin `RESEND_API_KEY`, vía `curl`):

- prueba local sin credenciales: confirmada — sin la variable de entorno, el endpoint responde `500 { error: "config" }` de forma controlada, sin exponer detalles de Resend;
- validación de payload inválido, honeypot completo y payload válido: confirmadas, cada una con el código de respuesta esperado;
- rate limiting: confirmado (429 al superar 5 solicitudes en 10 minutos desde el mismo origen);
- headers de seguridad presentes también en `/api/contact`, compatibles con la CSP existente (`connect-src 'self'`).

Envío real verificado (2026-08-29): el usuario envió el formulario desde la interfaz web local con `RESEND_API_KEY` configurada únicamente en `.env.local` (no versionada, no documentada ni mostrada). Resend aceptó y registró el envío, y el mensaje llegó correctamente a `agencyvalinor@gmail.com`. Detalle en `docs/QUALITY.md`.

Remitente/dominio definitivo — pendiente independiente, no bloquea este hallazgo: el remitente actual (`Valinor Agency <onboarding@resend.dev>`) sigue siendo temporal; Resend puede limitar los destinatarios de prueba según el plan de la cuenta. El remitente corporativo definitivo continúa pendiente de comprar y verificar el dominio oficial (ver P0-04).

Sigue pendiente: retención de datos y obligaciones de privacidad aplicables (sin decidir).

### P0-04 — Hosting y dominio

Estado: Parcialmente resuelto (2026-08-28). Hosting confirmado; dominio pendiente de compra.

No se identificó un proyecto website en el equipo Vercel de Valinor durante la revisión.

Decisión: hosting Vercel; dominio candidato `valinoragency.com.ar`, todavía no comprado.

Sigue pendiente: comprar el dominio, configurar el proyecto de despliegue en Vercel y validar producción, headers, canonical y formularios sobre el dominio definitivo.

## Prioridad P1 — conversión y confianza

### P1-01 — Hero sin CTA

Estado: Open. Decisión confirmada (2026-08-28); implementación pendiente.

El hero comunica marca y “Diseño y desarrollo web a medida”, pero no explicita audiencia, beneficio ni siguiente paso.

Decisión (copy aprobado, ver `DESIGN.md`): título "Diseño y desarrollo web a medida"; descripción "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina."; CTA principal "Contanos tu proyecto"; CTA secundario "Explorar conceptos"; respaldo "Más de ocho años de experiencia por fundador en desarrollo de soluciones digitales."

Sigue pendiente: implementar el copy y verificar la jerarquía SEO del h1.

### P1-02 — Ejemplos ambiguos

Estado: Open. Decisión confirmada (2026-08-28); implementación pendiente.

Portfolio presenta soluciones conceptuales con lenguaje de proyectos destacados. Deben etiquetarse como ejemplos o sustituirse por casos reales autorizados.

Decisión: el portfolio actual se presenta como proyectos o conceptos, cada uno identificado con la etiqueta "Concepto"; se reemplazarán progresivamente por casos reales autorizados. Ver `PRODUCT.md`.

### P1-03 — Evidencia comercial

Estado: Pending confirmation. Presentación del equipo confirmada (2026-08-28); implementación pendiente. Casos reales autorizados siguen sin decidir.

Faltan casos reales autorizados, presentación pública del equipo, proceso y otras señales de confianza. No inventar logos, resultados, testimonios ni métricas.

Decisión (equipo): sección breve con fotos, sin LinkedIn inicialmente. Milton Collard — Cofundador · Frontend y Experiencia Digital; Martín Abbott — Cofundador · Backend y Arquitectura de Datos. Cada fundador con más de ocho años de experiencia. Ver `PRODUCT.md`.

Sigue pendiente: fotos concretas del equipo, casos reales autorizados y definición de proceso.

### P1-04 — IA demasiado visible

Estado: Open. Política de IA confirmada (2026-08-28); implementación (revisión de copy) pendiente.

La home incluye “Agentes y herramientas avanzadas” y “INTELIGENCIA ARTIFICIAL”. Aunque la IA puede mencionarse como proceso interno, su prominencia puede interpretarse como servicio comercial.

Decisión: Valinor no ofrece IA como servicio independiente. Una integración de IA podrá evaluarse solo si el cliente la solicita y acepta los costos de API y proveedores externos; Valinor no financiará indefinidamente el consumo del cliente con una API key propia. Ver `PRODUCT.md`.

Sigue pendiente: revisar y ajustar el copy actual de la home según esta política.

## Prioridad P1 — SEO

### P1-05 — Metadata incompleta

Estado: Open.

Faltan:

- metadataBase;
- canonical;
- URL e imagen Open Graph;
- imagen Twitter/X;
- robots;
- sitemap;
- datos estructurados basados en información confirmada.

### P1-06 — Ruta experimental indexable

Estado: Open.

/sprite-probe genera una página estática con metadata propia. Debe eliminarse del producto publicable, aislarse o marcarse noindex según decisión técnica.

## Prioridad P1 — seguridad

### P1-07 — Headers

Estado: Resuelto (2026-08-28) a nivel de configuración y verificación local de producción. Verificación final sobre el dominio y hosting definitivos queda pendiente hasta el deploy (ver P0-04).

`next.config.ts` ahora configura, vía `headers()`, aplicados a todas las rutas y solo en runtime de producción (`NODE_ENV === "production"`):

- Content-Security-Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
- Strict-Transport-Security: `max-age=31536000`;
- X-Content-Type-Options: `nosniff`;
- Referrer-Policy: `strict-origin-when-cross-origin`;
- Permissions-Policy: `camera=(), microphone=(), geolocation=()`;
- X-Frame-Options: `DENY` (compatibilidad adicional a `frame-ancestors 'none'`).

La política se construyó a partir de los recursos reales verificados en el código (detalle en `docs/ARCHITECTURE.md`): todo same-origin (HTML, JS, CSS, imágenes, `.glb`, fuentes `next/font/google` auto-hospedadas); único enlace externo real es `wa.me` (navegación por `<a href>`, no un recurso cargado); sin iframes, analytics, fetch externo ni Web Workers. No se usó `unsafe-eval`: los shaders GLSL/WGSL de Three.js (WebGL y WebGPU) se compilan vía la API gráfica del navegador, no mediante `eval`/`Function` de JavaScript.

Verificación ejecutada:

- `npm run lint`: sin errores.
- `npm run build`: exitoso, mismas rutas (`/`, `/_not-found`, `/sprite-probe`).
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `npm run start` + `curl -I` sobre `/`, `/sprite-probe` y una ruta 404: los 6 headers presentes con los valores esperados en las tres respuestas.
- Inspección del HTML y CSS servidos: confirma 2 bloques `<script>` inline (payload de hidratación de Next.js) y 78 atributos `style="..."` reales en `/`, y que todas las fuentes (`.woff2`) son same-origin bajo `/_next/static/media/`.

Deuda técnica registrada (justificación completa en `docs/ARCHITECTURE.md`):

- `script-src 'unsafe-inline'` y `style-src 'unsafe-inline'`, necesarios por la hidratación de Next.js App Router y por estilos inline reales/Framer Motion/GSAP, dado que los headers se configuran solo desde `next.config.ts` sin middleware de nonce por request.
- `Strict-Transport-Security` sin `includeSubDomains` ni `preload`, pendiente de dominio oficial confirmado.
- Los headers solo se aplican en runtime de producción, no en `next dev`.

Sigue pendiente: verificar los headers sobre el dominio y hosting definitivos una vez desplegados (ver P0-04), y evaluar a futuro una CSP con nonce por request si se introduce middleware.

## Prioridad P2 — rendimiento y mantenimiento

### P2-01 — Loader bloqueante

Estado: Open.

LoadingOverlay simula una carga de aproximadamente tres segundos y bloquea interacción antes de revelar el hero.

### P2-02 — JavaScript inicial

Estado: Open.

La home referencia aproximadamente 1.08 MB de JavaScript sin comprimir, cerca de 295 KB comprimido en la build auditada. Three.js, Framer Motion y GSAP son factores principales.

### P2-03 — Animación continua

Estado: Open.

LiquidEther/WebGL y BackgroundCanvas pueden ejecutarse simultáneamente. Evaluar fallback mobile, capacidad del dispositivo, visibilidad y reducción de movimiento.

### P2-04 — Fuentes

Estado: Open.

Inter, Lora, Cinzel y DM Sans se importan globalmente, aunque no se confirmó uso actual de las tres familias adicionales en la home.

### P2-05 — Assets públicos

Estado: Open.

public/ ocupa aproximadamente 43 MB e incluye modelos GLB, ZIP y recursos experimentales. Los ZIP y modelos no contienen secretos detectados, pero pueden quedar públicamente descargables y aumentar el artefacto de deploy.

### P2-06 — Presentación de TechStackSection (mejora futura, no bloqueante)

Estado: Open. Decisión confirmada (2026-08-28).

Decisión: la sección de tecnologías se conserva por ahora sin cambios. Mejora futura registrada: separar la presentación de frontend/diseño (más creativa) de la de backend/datos (más estructurada). Ver `DESIGN.md`.

## Decisiones necesarias del usuario

1. Dominio y hosting oficial. — Parcialmente resuelto (2026-08-28): hosting Vercel confirmado; dominio pendiente de compra (candidato `valinoragency.com.ar`).
2. Número comercial de WhatsApp. — Resuelto e implementado (2026-08-28): provisional, +54 9 11 5015-2833.
3. Canal y proveedor del formulario. — Resuelto e implementado (2026-08-28): formulario web (Resend, vía ruta de servidor de Next.js) combinado con WhatsApp. Envío real verificado el 2026-08-29; remitente sigue temporal hasta comprar y verificar el dominio oficial.
4. Casos reales autorizados. — Pendiente.
5. Presentación pública del equipo. — Resuelto (2026-08-28): sección breve con bios de ambos cofundadores; fotos concretas pendientes.
6. Copy y CTA del hero. — Resuelto (2026-08-28): ver `DESIGN.md`.
7. Nivel de presencia pública de IA. — Resuelto (2026-08-28): IA no es servicio independiente; integración evaluable caso por caso si el cliente la solicita y paga costos externos.
8. Prioridades cuantitativas de rendimiento y conversión. — Pendiente.

## Orden recomendado de implementación

1. Dependencias y seguridad.
2. WhatsApp y formulario.
3. Hero, CTA y contenido comercial.
4. Casos reales, equipo y proceso.
5. SEO técnico.
6. Rendimiento y limpieza.
7. Deploy de prueba y QA completo.

## Criterio mínimo de release

- P0 resueltos;
- lint y build en verde;
- audit sin vulnerabilidades high aceptadas sin justificación;
- dominio, canonical, robots y sitemap confirmados;
- contacto probado de punta a punta;
- ruta experimental fuera del índice público;
- headers verificados en producción;
- QA mobile y desktop completada;
- accesibilidad básica verificada;
- casos, claims y datos de contacto confirmados.


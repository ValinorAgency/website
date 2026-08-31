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

Estado: Resuelto (2026-08-29). Decisión aprobada e implementación verificada.

El hero comunicaba marca y “Diseño y desarrollo web a medida”, pero no explicitaba audiencia, beneficio ni siguiente paso, y ese texto era un `<p>` decorativo, no el `h1`.

Decisión (copy aprobado, ver `DESIGN.md`): título "Diseño y desarrollo web a medida"; descripción "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina."; CTA principal "Contanos tu proyecto"; CTA secundario "Explorar conceptos" (retirado 2026-08-30, ver nota); respaldo "Más de ocho años de experiencia por fundador en desarrollo de soluciones digitales."

Implementado en `src/components/HeroParticleAlt.tsx`: el título aprobado es ahora el único `h1` de la página; "Valinor Agency" se conserva como identidad de marca visible en un `<p>`, no como `h1`. CTA principal enlaza a `#contacto` (sección de `FinalCTA.tsx`, sin cambios). Verificado por inspección de código y del HTML servido (`npm run start` + `curl`): un solo `<h1>` en la página, CTA principal presente con ese `href`, botones con `min-height: 48px` y estados `:focus-visible` heredados de `.pill-button-dark`/`.pill-button-light`.

**Actualización — 2026-08-30:** el CTA secundario cambió de "Explorar conceptos" (→ `#portfolio`) a "Ver soluciones" (→ `#servicios`), como parte del cambio de estrategia de la sección de soluciones (ver P1-02). El anchor `#portfolio` se eliminó de `Portfolio.tsx` por quedar sin consumidores. Verificado: `#servicios` existe y el CTA apunta ahí; no quedan referencias a `#portfolio` en el código.

Sigue pendiente: QA visual en navegador real (desktop y mobile) — no se pudo ejecutar en este entorno por falta de navegador disponible; requiere revisión manual del usuario.

### P1-02 — Ejemplos ambiguos

Estado: Resuelto (2026-08-30). Decisión aprobada e implementación verificada. Reemplaza una implementación intermedia descartada por el usuario (ver nota abajo).

Portfolio presentaba soluciones conceptuales con lenguaje de proyectos destacados: sin etiqueta que aclarara su naturaleza, con un campo `outcome` redactado como resultado ya logrado ("...para el cliente", "menos información dispersa", etc.) y un CTA de modal ("Consultar un proyecto similar") que presuponía un proyecto real equivalente.

**Nota — implementación intermedia descartada (2026-08-29):** se implementó primero un enfoque de "Conceptos digitales" (etiqueta "Concepto" en cada entrada, introducción declarando que "Valinor todavía no cuenta con un portfolio comercial público", y contenido organizado como caso de estudio con Problema/Propuesta/Qué demuestra). El usuario revisó ese resultado y decidió descartarlo antes de cualquier commit: la etiqueta repetida "Concepto" y la declaración explícita de no tener portfolio ponían el foco en la ausencia de casos reales en lugar de en la capacidad de Valinor. Ese enfoque nunca llegó a confirmarse como decisión final.

Decisión final: la sección no es un portfolio ni presenta proyectos conceptuales. Muestra tipos de soluciones que Valinor puede desarrollar, con una explicación breve de para qué sirve cada una y las capacidades reales de Valinor asociadas — sin clientes, problemas hipotéticos específicos, resultados, métricas ni testimonios inventados. Los ejemplos visuales o referencias concretas se comparten durante la conversación comercial con cada cliente, cuando resulte apropiado; los casos reales se incorporarán públicamente solo cuando existan y estén autorizados. Ver `PRODUCT.md`.

Implementado en `src/components/Portfolio.tsx` (`id="servicios"`, sin el anchor secundario `#portfolio`, retirado por quedar sin consumidores): título "Soluciones digitales a medida"; introducción "Diseñamos y desarrollamos soluciones web adaptadas a los objetivos, procesos y etapa de cada negocio."; seis categorías — sitios web y landing pages, tiendas online, aplicaciones web, dashboards y visualización de datos, sistemas de gestión, e integraciones y automatizaciones — cada una con una explicación breve y las capacidades reales asociadas, sin etiquetas "Concepto"/"Caso"/"Proyecto conceptual"/"Portfolio" ni campos de caso de estudio. El CTA del modal es "Conversemos sobre tu proyecto". El CTA secundario del hero cambió de "Explorar conceptos" (→ `#portfolio`) a "Ver soluciones" (→ `#servicios`).

Verificado por inspección de código y del HTML servido (`npm run start` + `curl`): no quedan las cadenas "Concepto", "Conceptos digitales", "portfolio comercial público" ni "proyecto similar"; `#servicios` existe y el CTA del hero apunta ahí; no quedan referencias a `#portfolio` (ni el `id` ni ningún `href`) en el código.

Sigue pendiente (no forma parte de este hallazgo): incorporación de casos reales autorizados, cuando existan — ver `PRODUCT.md`. QA visual interactivo (hover, modal, foco, responsive) en navegador real no se pudo ejecutar en este entorno por falta de navegador disponible; requiere revisión manual del usuario.

### P1-03 — Evidencia comercial

Estado: Parcialmente resuelto (2026-08-31). Presentación del equipo implementada y verificada. Casos reales autorizados y definición de proceso siguen sin decidir.

Faltaban casos reales autorizados, presentación pública del equipo, proceso y otras señales de confianza. No inventar logos, resultados, testimonios ni métricas.

Decisión (equipo): sección breve con fotos, sin LinkedIn inicialmente. Milton Collard — Cofundador · Frontend y Experiencia Digital; Martín Abbott — Cofundador · Backend y Arquitectura de Datos. Cada fundador con más de ocho años de experiencia. Ver `PRODUCT.md`.

Implementado en `src/components/TeamSection.tsx` (`id="equipo"`, entre `WhyUs` y `FinalCTA` en `src/app/page.tsx`): título "Conocé a quienes están detrás de Valinor"; introducción; dos tarjetas de igual jerarquía con nombre, rol, bio y capacidades breves para Milton Collard y Martín Abbott; línea de respaldo "Más de ocho años de experiencia profesional cada uno en desarrollo de software" (atribuida a cada fundador, no a la agencia). Avatares temporales con iniciales generadas por CSS, sin fotos, servicios externos ni URLs remotas; sin la palabra "temporal" visible para el visitante (documentado en `DESIGN.md` y en un comentario de código). No se agregaron rutas a `/images/team/` porque los archivos todavía no existen.

Verificado por inspección de código y del HTML servido (`npm run start` + `curl`): `id="equipo"` aparece exactamente una vez, ubicado entre el marcador de `WhyUs` y `id="contacto"`; no hay ningún `<img>` ni referencia a `/images/team/` en la sección (los únicos `<img>` del HTML son el logo de `Navbar`/`Footer`, sin relación); el texto de "más de ocho años" se atribuye a cada fundador ("cada uno"), no a Valinor como agencia.

Sigue pendiente: fotos concretas del equipo (reemplazo de los avatares de iniciales), casos reales autorizados y definición de proceso. QA visual (responsive, contraste, foco) en navegador real no se pudo ejecutar en este entorno por falta de navegador disponible; requiere revisión manual del usuario.

### P1-04 — IA demasiado visible

Estado: Resuelto (2026-08-29). Decisión aprobada e implementación verificada.

La home incluía “Agentes y herramientas avanzadas” (tarjeta de capacidad en `TechStackSection.tsx`) y “INTELIGENCIA ARTIFICIAL” (palabra del marquee decorativo, al mismo nivel que DISEÑO/DESARROLLO/ESTRATEGIA). Aunque la IA puede mencionarse como proceso interno, esa prominencia se interpretaba como servicio o pilar comercial.

Decisión: Valinor no ofrece IA como servicio independiente. Una integración de IA podrá evaluarse solo si el cliente la solicita y acepta los costos de API y proveedores externos; Valinor no financiará indefinidamente el consumo del cliente con una API key propia. Ver `PRODUCT.md`.

Implementado en `src/components/TechStackSection.tsx`: la tarjeta de capacidad ahora dice "Integraciones a medida" / "Conectamos herramientas y automatizamos tareas puntuales cuando el proyecto lo necesita", y la palabra del marquee ahora es "INTEGRACIONES A MEDIDA". Se conservó sin cambios el párrafo que menciona IA como herramienta interna para análisis, desarrollo y control de calidad, por coincidir con la formulación ya aprobada en `PRODUCT.md`. Verificado por inspección de código y del HTML servido: no quedan las cadenas "Agentes y herramientas avanzadas" ni "INTELIGENCIA ARTIFICIAL" en `src/`.

No se tocaron dependencias ni componentes experimentales cuyos nombres internos mencionen IA (fuera de alcance de este hallazgo).

## Prioridad P1 — SEO

### P1-05 — Metadata incompleta

Estado: Resuelto (2026-08-31) para el SEO técnico base. Validación sobre el dominio real y Search Console siguen pendientes (no forman parte de este hallazgo).

Faltaban: metadataBase; canonical; URL e imagen Open Graph; imagen Twitter/X; robots; sitemap; datos estructurados basados en información confirmada.

Implementado (detalle completo en `docs/ARCHITECTURE.md` § SEO y `docs/QUALITY.md` § SEO técnico base):

- `src/lib/site-url.ts`: utilidad centralizada para resolver la URL del sitio (prioridad `SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost`), sin asumir el dominio candidato como comprado, con protección explícita para que un preview de Vercel no herede `SITE_URL` de producción.
- `src/app/layout.tsx`: `metadataBase`, `alternates.canonical: "/"`, título y descripción alineados con el copy visible del hero, Open Graph completo (title, description, url, siteName, locale es_AR, type website, imagen) y Twitter `summary_large_image`.
- `src/app/opengraph-image.tsx`: imagen social generada con `next/og` (sin fotos, sin dependencias nuevas), reutilizada automáticamente para Twitter.
- `src/app/robots.ts` y `src/app/sitemap.ts`: solo `/` como página pública indexable; `/api/contact` y `/sprite-probe` excluidas; sin `lastModified` inventado.
- JSON-LD `Organization` en `<head>` (`src/lib/organization-json-ld.ts`), con únicamente datos confirmados (nombre, URL, email, teléfono/WhatsApp, área atendida, descripción) y serialización segura.

Verificado: `npm run build` sin `SITE_URL` funciona; HTML servido contiene todas las etiquetas esperadas; `/robots.txt` y `/sitemap.xml` responden con el contenido correcto; JSON-LD válido (`JSON.parse` exitoso) con las claves exactas esperadas y ninguna prohibida; resolución de `SITE_URL` probada con tres builds reales (sin variables, con `SITE_URL` sin protocolo, y simulando un preview de Vercel).

Sigue pendiente (no forma parte de este hallazgo): validación real sobre el dominio oficial una vez comprado, verificado y configurado como `SITE_URL` en Vercel (ver P0-04); indexación mediante Google Search Console. No se verificó ni se marca como verificado ningún deploy.

### P1-06 — Ruta experimental indexable

Estado: Resuelto (2026-08-31).

/sprite-probe generaba una página estática con metadata propia, indexable.

Implementado: se eliminó `src/app/sprite-probe/page.tsx` (confirmado que no era parte de la home ni estaba enlazada públicamente). La ruta ya no existe; `/sprite-probe` responde `404` (verificado con `npm run start` + `curl`). No se eliminaron componentes ni assets experimentales adicionales, salvo esta única página.

**Archivo huérfano documentado para limpieza posterior:** `src/components/SpriteParticleProbe.tsx` era usado exclusivamente por esa página y ahora no tiene ningún consumidor en el código, pero no se eliminó en esta tarea (fuera del alcance solicitado). Ver `docs/ARCHITECTURE.md` § Rutas y P2-05.

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

Estado: Resuelto (2026-09-01). Solo este hallazgo puntual del loader; el resto del rendimiento (P2-02 a P2-06) sigue abierto y no se marca como resuelto.

LoadingOverlay simulaba una carga de aproximadamente tres segundos y bloqueaba interacción antes de revelar el hero.

**Duración anterior (medida por la lógica de timers real, no estimada):** `DURATION` (conteo) 1950ms + `EXIT_DELAY` (pausa artificial en 100%) 252ms + `EXIT_DURATION` (fundido de salida) 675ms = **2877ms (~2.9s)**. Los clics quedaban bloqueados (`pointerEvents:"all"`) durante los primeros 2202ms (conteo + pausa), y solo se liberaban en el instante exacto en que arrancaba el fundido — momento en que el overlay todavía estaba 100% opaco.

**Causa de la espera prolongada:** una pausa artificial de 252ms mantenida a propósito en 100% antes de iniciar la salida, sumada a un conteo de casi 2 segundos y un fundido de 675ms; nada de esto dependía de un recurso real (imágenes, fuentes, WebGL, APIs) — ya era puramente temporizado, pero con constantes deliberadamente largas para simular "una carga real".

**Implementado en `src/components/LoadingOverlay.tsx`** (identidad visual sin cambios: fondo oscuro, grid de puntos, marcas de esquina, logo enmascarado en teal, contador monoespaciado, barra de progreso):

- `COUNT_DURATION` 380ms + `EXIT_DURATION` 260ms, sin pausa artificial entre ambos (la salida arranca apenas termina el conteo) → **duración total medida ~660–680ms** (movimiento normal), dentro del rango pedido de 500–700ms.
- Los clics se liberan (`pointerEvents:"none"`) 120ms después de que arranca la salida (no en el instante 0, para no permitir clics accidentales mientras el overlay todavía cubre visualmente la pantalla) y bastante antes de que termine el fundido completo (~535ms de los ~660–680ms totales medidos).
- Backstop determinista: un `setTimeout` de seguridad fijo (conteo + salida + 200ms de margen) fuerza el reveal del hero y el desmontaje aunque el flujo normal (`requestAnimationFrame`) nunca dispare (por ejemplo, una pestaña en segundo plano). Simulado con una réplica exacta de la lógica: nunca se activó en el flujo normal, como se espera.
- Bloqueo de scroll (`document.body.style.overflow`) agregado mientras el overlay cubre la pantalla, liberado en el mismo instante en que arranca la salida, con un `try`/cleanup adicional en el desmontaje del efecto como resguardo.
- Todos los timers (los del flujo normal y el de seguridad) se guardan en un array y se limpian con `clearTimeout`/`cancelAnimationFrame` en el cleanup del `useEffect`. Verificado con una simulación de desmontaje a mitad de camino (150ms): ningún timer disparó después del desmontaje y el scroll quedó liberado.
- `prefers-reduced-motion: reduce`: se detecta con `window.matchMedia` dentro de `useEffect` (nunca durante el render, para no romper la hidratación); en ese caso el conteo se salta y la salida dura ~60ms — **duración total medida ~87–90ms**, prácticamente inmediata.
- Sin `aria-busy` en ningún momento (nunca se agregó); el overlay entero sigue `aria-hidden="true"` (decorativo, fuera del árbol accesible) y no atrapa foco (no contiene elementos enfocables). El porcentaje mostrado es y era decorativo, nunca se anuncia a lectores de pantalla.
- Verificado que no hay pantalla intermedia en blanco/negro: el fundido revela directamente el fondo oscuro del `body`/hero (`#060609`/`#05060a`), ambos ya oscuros, sin salto de color.

Verificación ejecutada:

- `npm run lint`: sin errores (tuvo que ajustarse la implementación para cumplir las reglas `react-hooks/set-state-in-effect` y `react-hooks/refs` del linter del proyecto: ningún `setState` corre de forma síncrona fuera de un callback, y el valor de duración de salida se guarda en estado de React en vez de en un `ref` leído durante el render).
- `npm run build`: exitoso, mismas rutas.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `git diff --check`: sin errores.
- Medición de tiempos reales: se replicó la lógica exacta de constantes y control de flujo (rAF a ~60fps, mismos `setTimeout`) en un script Node temporal (no versionado, eliminado al terminar) para medir cada transición con timestamps reales, tanto en movimiento normal como con `prefers-reduced-motion`, y para confirmar que un desmontaje a mitad de camino limpia todos los timers sin disparos posteriores.
- Inspección del HTML servido (`npm run start` + `curl`): el overlay inicial sigue siendo `aria-hidden="true"`, sin `aria-busy` en ningún lugar del documento, con el mismo marcado visual que antes.

QA visual pendiente: no hay navegador disponible en este entorno; queda para revisión manual del usuario en desktop y mobile (confirmar que la transición se sienta fluida y que el hero se revela sin salto visual).

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
5. Presentación pública del equipo. — Resuelto e implementado (2026-08-31): sección breve con bios de ambos cofundadores; fotos concretas pendientes (avatares temporales con iniciales).
6. Copy y CTA del hero. — Resuelto e implementado (2026-08-29): ver `DESIGN.md`.
7. Nivel de presencia pública de IA. — Resuelto e implementado (2026-08-29): IA no es servicio independiente; integración evaluable caso por caso si el cliente la solicita y paga costos externos.
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


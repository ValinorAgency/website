# Quality

Este documento es la fuente canónica para los quality gates del proyecto y la evidencia necesaria para considerar un cambio o una entrega verificable.

## Estados

- Required: debe ejecutarse para el tipo de cambio indicado.
- Applicable: debe evaluarse cuando el cambio afecta esa superficie.
- Not configured: todavía no existe un comando o procedimiento reproducible.
- Not applicable: no corresponde al cambio evaluado.

## Gates

| Gate | Estado | Comando o procedimiento | Cuándo |
| --- | --- | --- | --- |
| Instalación reproducible | Required | npm ci | Antes de validar una instalación limpia o cambios de dependencias |
| Lint | Required | npm run lint | Después de cambios en código o configuración |
| Type checking | Required | npm run build | Actualmente está integrado en el build; gate separado no configurado |
| Tests automatizados | Not configured | Not configured | Requeridos cuando se incorpore comportamiento que justifique tests |
| Build | Required | npm run build | Antes de una entrega publicable |
| Auditoría de producción | Required para release o dependencias | npm audit --omit=dev | Antes de publicar y después de cambios de dependencias |
| Browser QA | Applicable | Procedimiento manual documentado abajo | Cambios de interfaz, interacción, rutas o responsive |
| Accesibilidad | Applicable | Procedimiento manual documentado abajo | Cambios de contenido o interfaz |
| SEO | Applicable | Checklist documentado abajo | Cambios públicos, metadata, estructura o rutas |
| Performance | Applicable | Revisión de bundle, assets y comportamiento | Cambios de animación, fuentes, imágenes, canvas o dependencias |
| Deploy validation | Not configured | Pending confirmation | Hosting confirmado (Vercel). Falta comprar el dominio (candidato: valinoragency.com.ar) y configurar el proyecto de despliegue |

## Browser QA

Para cambios visuales o interactivos verificar:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- 1440 px;
- navegación principal;
- menú mobile;
- enlaces internos;
- CTA;
- formulario;
- modales;
- ausencia de scroll horizontal;
- consola sin errores;
- página funcional con reducción de movimiento.

Registrar qué viewports y flujos se comprobaron. No declarar browser QA completa a partir de lint o build.

## Accesibilidad

Checklist mínimo:

- un solo h1;
- orden lógico de encabezados;
- landmarks semánticos;
- navegación completa por teclado;
- foco visible;
- modales con foco contenido y retorno al disparador;
- labels y nombres accesibles;
- contraste WCAG AA;
- controles táctiles cómodos;
- contenido usable con prefers-reduced-motion;
- zoom y texto ampliado sin pérdida de contenido.

La automatización con axe, Lighthouse u otra herramienta está Not configured.

## SEO

Antes de una publicación revisar:

- title y description;
- canonical;
- metadataBase;
- Open Graph y Twitter/X;
- imagen social;
- robots;
- sitemap;
- jerarquía de encabezados;
- rutas experimentales o no indexables;
- enlaces internos;
- idioma y locale;
- datos estructurados cuando existan datos confirmados;
- dominio oficial.

## Seguridad

Para cambios en dependencias, formularios, integraciones o deploy:

- ejecutar npm audit --omit=dev;
- revisar dependencias directas y transitivas afectadas;
- verificar ausencia de secretos versionados;
- validar datos en servidor si existe recepción de formularios;
- documentar rate limiting y protección antispam;
- revisar headers de seguridad;
- revisar enlaces externos;
- revisar contenido público dentro de public/.

No ejecutar correcciones automáticas con cambios de versión sin inspeccionar el diff y obtener autorización cuando corresponda.

### Formulario de contacto — implementado 2026-08-28

`POST /api/contact` (Resend + Route Handler de Next.js, detalle completo en `docs/ARCHITECTURE.md`) quedó implementado con validación server-side de todos los campos, honeypot antispam y rate limiting básico best-effort. La `RESEND_API_KEY` se lee solo en el servidor (`process.env`, sin prefijo `NEXT_PUBLIC_`) y no se expone al cliente.

Verificación ejecutada:

- `npm run lint`: sin errores.
- `npm run build` sin `RESEND_API_KEY` en el entorno: exitoso; nueva ruta `/api/contact` generada como dinámica (ƒ).
- `npm audit --omit=dev`: 0 vulnerabilidades tras agregar `resend`.
- Pruebas manuales del endpoint local (`npm run start`, sin `RESEND_API_KEY`) vía `curl`:
  - payload válido sin API key → `500 { error: "config" }`, sin detalles de Resend ni datos sensibles en la respuesta;
  - payload inválido (nombre corto, contacto inválido, tipo inválido, mensaje corto) → `400` con errores por campo;
  - honeypot completo → `200 { ok: true }` sin intentar el envío;
  - contacto como teléfono válido → pasa la validación y llega al mismo error controlado de falta de API key;
  - más de 5 solicitudes en la ventana de 10 minutos desde el mismo origen → `429 { error: "rate_limited" }`;
  - JSON malformado → manejado sin excepción no controlada;
  - headers de seguridad (CSP incluida) presentes también en las respuestas de `/api/contact`, confirmando que el `fetch` del cliente es same-origin y compatible con `connect-src 'self'`.
- No se agregó un framework de tests: el repositorio no tiene ninguno configurado (`Tests automatizados: Not configured`) y agregar uno hubiera excedido el alcance de "instalar solamente la dependencia `resend`"; la validación del servidor se verificó manualmente como se detalla arriba.

Pendiente: no se pudo probar un envío real, porque no hay una `RESEND_API_KEY` válida disponible en este entorno. El remitente (`onboarding@resend.dev`) es temporal y Resend puede limitar los destinatarios de prueba según la cuenta; el remitente definitivo depende de comprar y verificar el dominio oficial.

### Headers de seguridad — confirmado 2026-08-28

`next.config.ts` configura Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y X-Frame-Options para todas las rutas, aplicados solo en runtime de producción. Detalle completo, justificación de la política y deuda técnica registrada en `docs/ARCHITECTURE.md`.

Verificación ejecutada:

- `npm run lint`: sin errores.
- `npm run build`: exitoso, mismas rutas (`/`, `/_not-found`, `/sprite-probe`).
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `npm run start` + `curl -I` sobre `/`, `/sprite-probe` y una ruta 404: los 6 headers presentes con los valores esperados en las tres respuestas.
- Inspección del HTML y CSS servidos: confirma que los `<script>` y `style=""` inline detectados son reales (justifican `unsafe-inline`) y que todas las fuentes son same-origin.

Pendiente: verificar los mismos headers sobre el dominio y hosting definitivos una vez desplegados (no se pudo verificar in situ porque el hosting de producción todavía no está configurado).

## Performance

Revisar:

- JavaScript inicial;
- Client Components;
- fuentes;
- imágenes y assets;
- Three.js y WebGL;
- canvas globales;
- animaciones permanentes;
- loaders que bloqueen interacción;
- experiencia mobile;
- reducción de movimiento;
- Core Web Vitals una vez disponible el deploy.

Objetivos numéricos: Pending confirmation.

## Evidencia base — 2026-08-28

| Gate | Resultado |
| --- | --- |
| npm ci | Completado |
| npm run lint | Pass |
| npm run build | Pass |
| Rutas generadas | /, /_not-found y /sprite-probe |
| npm audit --omit=dev | Fail: 4 entradas de dependencias de producción afectadas con severidad alta |
| npm audit completo | Fail: 7 vulnerabilidades totales, 6 high y 1 moderate |
| Secret scan del repositorio | Sin secretos detectados por la revisión realizada |
| Browser QA local | No completada por limitación del entorno de auditoría |
| Deploy QA | No completada; hosting de producción no identificado |

Esta evidencia es una fotografía temporal. Debe actualizarse después de resolver dependencias o preparar un release.

## Reporte obligatorio

Después de cada tarea informar:

- gates ejecutados;
- resultados;
- controles manuales realizados;
- gates aplicables no ejecutados y motivo;
- riesgos o fallos pendientes.


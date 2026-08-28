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

Para el formulario real (Resend + ruta de servidor de Next.js, ver `docs/ARCHITECTURE.md`), decidido y pendiente de implementación, el gate de seguridad deberá verificar además: validación server-side de todos los campos, honeypot antispam y protección básica contra abuso (rate limiting), y que la `RESEND_API_KEY` no quede expuesta en el cliente.

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


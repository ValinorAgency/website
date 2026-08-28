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

Estado: Open.

Next.js 16.2.9 y dependencias transitivas presentan vulnerabilidades registradas por npm audit. La corrección disponible durante la auditoría indicaba Next.js 16.3.3.

Acción propuesta:

1. actualizar Next.js y eslint-config-next de forma coordinada;
2. inspeccionar lockfile y cambios transitivos;
3. ejecutar lint, build y audit;
4. realizar browser QA.

No ejecutar actualización sin autorización explícita.

### P0-02 — WhatsApp sin destinatario

Estado: Open. Decisión confirmada (2026-08-28); implementación pendiente.

FloatingActions genera un enlace wa.me con mensaje, pero sin número de Valinor.

Decisión: número comercial provisional +54 9 11 5015-2833; enlace https://wa.me/5491150152833; mensaje inicial sugerido "Hola, estuve viendo la web de Valinor y quisiera consultar por un proyecto." Ver `docs/ARCHITECTURE.md`.

Sigue pendiente:

- implementar el número en FloatingActions;
- prueba en desktop y mobile;
- definición de evento de conversión si se incorpora analytics.

### P0-03 — Formulario sin envío real

Estado: Open. Decisión confirmada (2026-08-28); implementación pendiente.

FinalCTA usa mailto y depende de una aplicación de correo configurada. No existe confirmación de recepción.

Decisión: proveedor Resend, procesado mediante una ruta de servidor de Next.js; campos nombre, email o WhatsApp, tipo de proyecto y mensaje; destinatario `agencyvalinor@gmail.com`; Reply-To con el email del visitante cuando corresponda; variable `RESEND_API_KEY`; validación en cliente y servidor, estados de carga/éxito/error, honeypot antispam y protección básica contra abuso. Ver `docs/ARCHITECTURE.md`.

Sigue pendiente:

- remitente definitivo (depende de comprar y verificar el dominio);
- retención de datos y obligaciones de privacidad;
- implementación completa.

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

Estado: Open.

next.config.ts no configura headers de seguridad. Definir una política compatible con el hosting y los recursos finales:

- Content-Security-Policy;
- Strict-Transport-Security;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- frame-ancestors.

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
2. Número comercial de WhatsApp. — Resuelto (2026-08-28): provisional, +54 9 11 5015-2833.
3. Canal y proveedor del formulario. — Resuelto (2026-08-28): formulario web (Resend, vía ruta de servidor de Next.js) combinado con WhatsApp.
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


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

Estado: Open.

FloatingActions genera un enlace wa.me con mensaje, pero sin número de Valinor.

Requiere:

- número comercial confirmado;
- formato internacional;
- prueba en desktop y mobile;
- definición de evento de conversión si se incorpora analytics.

### P0-03 — Formulario sin envío real

Estado: Open.

FinalCTA usa mailto y depende de una aplicación de correo configurada. No existe confirmación de recepción.

Requiere decisión sobre:

- proveedor;
- canal de recepción;
- validación en servidor;
- errores y confirmación;
- spam y rate limiting;
- privacidad;
- variables de entorno.

### P0-04 — Hosting y dominio

Estado: Pending confirmation.

No se identificó un proyecto website en el equipo Vercel de Valinor durante la revisión. Se necesita confirmar hosting, dominio y estrategia de deploy antes de validar producción, headers, canonical y formularios.

## Prioridad P1 — conversión y confianza

### P1-01 — Hero sin CTA

Estado: Open.

El hero comunica marca y “Diseño y desarrollo web a medida”, pero no explicita audiencia, beneficio ni siguiente paso.

Pendiente:

- copy principal;
- CTA primario;
- CTA secundario;
- jerarquía SEO del h1.

### P1-02 — Ejemplos ambiguos

Estado: Open.

Portfolio presenta soluciones conceptuales con lenguaje de proyectos destacados. Deben etiquetarse como ejemplos o sustituirse por casos reales autorizados.

### P1-03 — Evidencia comercial

Estado: Pending confirmation.

Faltan casos reales autorizados, presentación pública del equipo, proceso y otras señales de confianza. No inventar logos, resultados, testimonios ni métricas.

### P1-04 — IA demasiado visible

Estado: Open.

La home incluye “Agentes y herramientas avanzadas” y “INTELIGENCIA ARTIFICIAL”. Aunque la IA puede mencionarse como proceso interno, su prominencia puede interpretarse como servicio comercial.

Revisar copy según PRODUCT.md.

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

## Decisiones necesarias del usuario

1. Dominio y hosting oficial.
2. Número comercial de WhatsApp.
3. Canal y proveedor del formulario.
4. Casos reales autorizados.
5. Presentación pública del equipo.
6. Copy y CTA del hero.
7. Nivel de presencia pública de IA.
8. Prioridades cuantitativas de rendimiento y conversión.

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


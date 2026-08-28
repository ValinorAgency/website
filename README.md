# Valinor Agency — Website

Sitio institucional de Valinor Agency, una agencia de diseño y desarrollo digital orientada a sitios web, ecommerce, aplicaciones, dashboards y soluciones web a medida.

El objetivo del sitio es convertir visitantes en potenciales clientes mediante una presentación clara de la propuesta, los servicios, la forma de trabajo y la capacidad técnica de Valinor.

## Estado actual

- Rama de trabajo auditada: `development`.
- Aplicación principal: landing institucional de una sola página.
- Frontend: implementado.
- Backend propio: no existe.
- Formulario de contacto: actualmente prepara un correo mediante `mailto:`.
- Hosting y dominio de producción: Pending confirmation.
- Estado de lanzamiento: requiere resolver los puntos documentados en `docs/audits/2026-08-28-launch-readiness.md`.

## Documentos canónicos

| Tema | Fuente |
| --- | --- |
| Producto, usuarios, objetivos, conversión y alcance | [PRODUCT.md](PRODUCT.md) |
| Dirección visual, contenido, responsive y motion | [DESIGN.md](DESIGN.md) |
| Arquitectura, rutas, límites e integraciones | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Quality gates y comandos de validación | [docs/QUALITY.md](docs/QUALITY.md) |
| Auditoría actual de preparación para lanzamiento | [docs/audits/2026-08-28-launch-readiness.md](docs/audits/2026-08-28-launch-readiness.md) |
| Decisiones relevantes | [docs/decisions/](docs/decisions/) |
| Aprendizajes comprobados | [docs/LESSONS.md](docs/LESSONS.md) |
| Contrato para agentes de código | [AGENTS.md](AGENTS.md) |

Cada decisión debe registrarse en su fuente canónica. No duplicar reglas o requisitos en documentos paralelos.

## Alcance comercial público

Valinor presenta actualmente:

- sitios web institucionales y landing pages;
- ecommerce;
- aplicaciones web;
- dashboards y herramientas internas;
- soluciones digitales personalizadas.

La inteligencia artificial puede mencionarse como parte del proceso interno de diseño y desarrollo. No es una línea comercial independiente en el alcance actual.

## Stack confirmado

- Next.js 16 con App Router;
- React 19;
- TypeScript;
- Tailwind CSS 4;
- Framer Motion;
- GSAP;
- Three.js;
- React Three Fiber en prototipos existentes;
- `next/font`.

Las versiones exactas están en `package.json`. No actualizar ni agregar dependencias sin revisar impacto y obtener autorización.

## Comandos

Instalar dependencias reproduciblemente:

```bash
npm ci
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Validar lint:

```bash
npm run lint
```

Generar build de producción:

```bash
npm run build
```

Auditar dependencias de producción:

```bash
npm audit --omit=dev
```

La definición completa de gates, estados y evidencia requerida está en `docs/QUALITY.md`.

## Estructura principal

```text
website/
├── .valinor/
│   └── system.json
├── docs/
│   ├── audits/
│   ├── decisions/
│   ├── ARCHITECTURE.md
│   ├── LESSONS.md
│   └── QUALITY.md
├── public/
├── src/
│   ├── app/
│   └── components/
├── AGENTS.md
├── CLAUDE.md
├── DESIGN.md
├── PRODUCT.md
└── README.md
```

La home se compone en `src/app/page.tsx`. El layout global y la metadata base se encuentran en `src/app/layout.tsx`.

## Reglas de colaboración

- Leer `AGENTS.md` antes de planificar o cambiar el proyecto.
- Revisar el mapa documental y la fuente canónica relacionada con la tarea.
- No inventar contenido, métricas, casos de éxito, datos de contacto ni decisiones.
- No modificar implementación cuando la tarea solicitada sea solamente análisis o planificación.
- No hacer commit, push, deploy, instalación o cambio de servicios externos sin autorización explícita.

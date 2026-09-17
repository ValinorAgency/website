# ADR-0001 — Sitio bilingüe (español/inglés) con next-intl

- Estado: Accepted
- Fecha: 2026-09-16
- Responsables: Usuario (Milton Collard / Martín Abbott)

## Contexto

El sitio era 100% español, sin infraestructura de i18n, alineado con `PRODUCT.md` ("idioma principal español", "Mercado inicial: Argentina"). El usuario decidió comprar el dominio `.com` (en vez del candidato anterior `.com.ar`) para ampliar el mercado más allá de Argentina, y pidió: switch de idioma cerca del navbar, traducción completa del sitio (no solo el hero), y sacar la mención puntual a "Argentina" del párrafo del hero/metadata.

## Opciones consideradas

### Opción A — Toggle client-side sin cambiar la URL

Un estado en memoria que intercambia el diccionario de textos sin tocar el ruteo. Más rápido de implementar, sin dependencias nuevas.

Costo: el contenido en inglés nunca queda indexado por separado en buscadores, no es compartible como link propio, y no persiste al recargar — contradice el motivo declarado del cambio de dominio (alcanzar audiencia de habla inglesa vía SEO).

### Opción B — Rutas separadas por idioma (`/es`, `/en`) con next-intl

Cada idioma como una URL real, indexable por separado, con `hreflang`/`alternates.languages` correctos. Requiere reestructurar `src/app/` con un segmento `[locale]`, agregar middleware de detección de idioma, y una dependencia nueva (`next-intl`).

## Decisión

Opción B, con `next-intl` (en vez de armar el ruteo/diccionarios a mano). Español queda en `/` (default, `localePrefix: "as-needed"` — ninguna URL indexada hoy cambia) e inglés en `/en`.

Se evaluó `next-intl@4.14.5` contra Next 16.3.3 antes de instalar: sus `peerDependencies` declaran soporte explícito para `next: ^16.0.0` y `react: ^19.0.0`.

Alcance: traducción completa del sitio (todas las secciones, no solo el hero), incluyendo metadata SEO, JSON-LD, Open Graph image (parametrizada por idioma), sitemap con `alternates.languages`, y los mensajes de validación del formulario de contacto. El email interno que recibe el equipo de Valinor queda siempre en español (no es contenido que ve el visitante).

Efecto colateral en `next.config.ts`: el middleware de next-intl (`src/proxy.ts` — renombrado de `middleware.ts` por convención de Next 16) hizo que el comentario existente sobre `'unsafe-inline'` en `script-src` ("sin un middleware que genere un nonce") quedara desactualizado; se corrigió el comentario para reflejar que ahora sí hay middleware, pero no genera nonce (la concesión de CSP sigue siendo necesaria, sin cambios en la política en sí).

## Consecuencias

### Positivas

- Contenido en inglés indexable por separado, con `hreflang` correcto.
- Colapsa una duplicación de texto que ya existía en 3 lugares (meta description, JSON-LD, párrafo del hero) en una sola clave de traducción por idioma.
- `PRODUCT.md` actualizado: dominio candidato `.com`, mercado ya no exclusivo de Argentina.

### Negativas o trade-offs

- Mantenimiento futuro: cualquier copy nuevo debe agregarse en `messages/es.json` y `messages/en.json` a la vez, o el sitio queda con contenido en un solo idioma en esa sección.
- El `alt` de la imagen Open Graph quedó fijo en español (no parametrizado por idioma): `generateImageMetadata` corre sin contexto de request, y no vale la pena la fragilidad de resolver el locale ahí para un texto de accesibilidad menor de una imagen social.
- `areaServed: "Argentina"` en el JSON-LD no se tocó (dato estructurado, no copy) — queda como decisión aparte si se quiere ampliar.

## Validación

- `npx tsc --noEmit`, `npm run lint`, `npm run build` limpios tras la reestructura de rutas y de nuevo tras convertir todos los componentes.
- `next build && next start` (headers de seguridad activos) para confirmar que el middleware/CSP conviven sin bloquear nada.
- Navegación manual: `/` en español, `/en` en inglés, switch de idioma en ambos sentidos (navbar desktop y menú mobile), formulario de contacto validando y mostrando mensajes en el idioma activo, lanyard 3D de equipo mostrando nombre/rol/bio traducidos.
- `sitemap.xml` con `alternates.languages` en ambas entradas.
- `npm audit --omit=dev` tras instalar `next-intl`: 0 vulnerabilidades.

## Referencias

- `PRODUCT.md` (Contexto, Requisitos confirmados, Preguntas abiertas).
- `messages/es.json`, `messages/en.json`.
- `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/proxy.ts`.

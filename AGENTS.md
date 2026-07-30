# AGENTS.md

## Propósito del proyecto

Este repositorio contiene el sitio web institucional de Valinor Agency.

Valinor Agency es una agencia de diseño y desarrollo digital enfocada en:

- sitios web institucionales;
- landing pages;
- ecommerce;
- aplicaciones web;
- tableros de control y dashboards;
- soluciones digitales personalizadas.

Valinor utiliza herramientas de inteligencia artificial como parte de su proceso interno de trabajo, pero actualmente no ofrece agentes de IA, asistentes privados, chatbots empresariales ni plataformas similares a ChatGPT como un servicio independiente.

El objetivo del sitio es presentar la agencia de forma profesional, generar confianza, comunicar sus servicios y convertir visitantes en potenciales clientes.

La experiencia debe transmitir:

- calidad;
- criterio de diseño;
- confianza;
- innovación;
- atención personalizada;
- capacidad técnica;
- profesionalismo.

La identidad de Valinor puede inspirarse sutilmente en conceptos como luz, estrellas, naturaleza, creación y excelencia, pero no debe parecer una web temática de fantasía ni una referencia directa a El Señor de los Anillos.

---

## Alcance comercial actual

La comunicación del sitio debe centrarse en:

- websites;
- ecommerce;
- aplicaciones web;
- dashboards;
- sistemas digitales personalizados.

No presentar como servicios actuales:

- agentes de inteligencia artificial;
- ChatGPT privado para empresas;
- asistentes conversacionales personalizados;
- automatizaciones basadas en IA como producto independiente;
- consultoría de inteligencia artificial.

La inteligencia artificial puede mencionarse únicamente como una herramienta utilizada por Valinor para optimizar sus procesos de diseño y desarrollo, salvo que el usuario indique explícitamente un cambio en la oferta comercial.

---

## Stack técnico actual

Antes de proponer cambios, inspeccionar `package.json` y confirmar las versiones instaladas.

El proyecto utiliza actualmente:

- Next.js con App Router;
- React;
- TypeScript;
- Tailwind CSS;
- Framer Motion;
- GSAP;
- Three.js;
- React Three Fiber;
- `next/font`.

No reemplazar tecnologías existentes sin una justificación clara y aprobación explícita.

No agregar dependencias nuevas cuando el objetivo pueda resolverse razonablemente con las herramientas ya instaladas.

---

## Estructura general

La aplicación principal se encuentra en `src/app`.

Las secciones visuales y funcionales se encuentran principalmente en `src/components`.

La página principal compone actualmente secciones como:

- navegación;
- hero;
- servicios web;
- tecnologías;
- soluciones de inteligencia artificial;
- problemas resueltos;
- portfolio;
- diferenciales;
- proceso de trabajo;
- presentación del equipo;
- llamada final a la acción;
- footer.

Antes de crear un componente nuevo, comprobar si existe uno que pueda ampliarse o reutilizarse.

---

## Forma de trabajo obligatoria

### Antes de modificar código

1. Leer este archivo completo.
2. Inspeccionar:
   - `package.json`;
   - `README.md`;
   - `src/app/page.tsx`;
   - `src/app/layout.tsx`;
   - `src/app/globals.css`;
   - los componentes relacionados con la tarea.
3. Revisar el estado actual antes de asumir que algo no existe.
4. Explicar brevemente:
   - qué se entendió de la tarea;
   - qué archivos serían afectados;
   - qué enfoque se propone;
   - qué riesgos o dudas existen.
5. No modificar archivos hasta que el usuario lo autorice cuando haya pedido primero análisis, diagnóstico o planificación.

No inventar requisitos que no fueron solicitados.

No ampliar el alcance de la tarea sin consultarlo.

---

## Reglas para cambios de código

- Realizar cambios pequeños, claros y revisables.
- Mantener el alcance limitado a la tarea solicitada.
- Evitar refactors generales no relacionados.
- Evitar reescribir componentes completos cuando una modificación puntual sea suficiente.
- Preservar la funcionalidad existente.
- Mantener TypeScript estricto.
- No utilizar `any` salvo que exista una justificación técnica concreta.
- Usar nombres descriptivos para variables, funciones y componentes.
- Evitar duplicación innecesaria.
- Separar datos repetitivos de la presentación cuando mejore la claridad.
- Mantener los componentes razonablemente pequeños.
- No crear abstracciones prematuras.
- No dejar código comentado, imports sin usar ni logs de depuración.
- No exponer secretos, tokens, claves ni variables privadas.
- No modificar archivos de configuración sin explicar el motivo.

---

## Dirección visual

La web debe sentirse diseñada por una agencia profesional, no como una plantilla genérica ni como una landing generada automáticamente.

Evitar:

- exceso de tarjetas idénticas;
- grillas repetitivas sin jerarquía;
- gradientes decorativos sin intención;
- blobs genéricos;
- brillos excesivos;
- glassmorphism aplicado a todo;
- textos centrados en todas las secciones;
- iconos genéricos utilizados como decoración;
- animaciones en todos los elementos;
- secciones visualmente iguales entre sí;
- tamaños tipográficos sin una jerarquía clara;
- frases de marketing vacías;
- copiar patrones visuales de otras secciones sin adaptarlos.

Priorizar:

- composición editorial;
- jerarquía visual clara;
- contraste;
- espacios en blanco;
- tipografía cuidada;
- ritmo entre secciones;
- layouts variados;
- mensajes comerciales concretos;
- detalles visuales coherentes;
- interacciones sutiles;
- calidad tanto en desktop como en mobile.

Cada decisión visual debe ayudar a:

- comprender mejor el contenido;
- destacar la propuesta de valor;
- facilitar la navegación;
- generar confianza;
- incentivar el contacto.

---

## Diseño responsive y mobile-first

Toda modificación visual debe evaluarse primero en mobile.

Comprobar como mínimo:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- 1440 px.

Evitar:

- desbordamiento horizontal;
- textos cortados;
- botones demasiado pequeños;
- contenido importante dependiente del hover;
- alturas rígidas innecesarias;
- títulos que ocupen excesivas líneas;
- elementos 3D o canvas que afecten la lectura;
- animaciones pesadas en dispositivos móviles.

Las áreas táctiles deberían tener un tamaño cómodo para interacción móvil.

No resolver mobile simplemente ocultando contenido importante.

---

## Animaciones

El proyecto utiliza Framer Motion, GSAP y Three.js.

Antes de elegir una herramienta:

- usar CSS para transiciones simples;
- usar Framer Motion para animaciones declarativas de interfaz;
- usar GSAP para secuencias o animaciones controladas por scroll;
- usar Three.js o React Three Fiber solamente para experiencias 3D justificadas.

No combinar varias librerías en una misma interacción si no es necesario.

Las animaciones deben:

- reforzar la jerarquía;
- orientar la mirada;
- dar continuidad;
- sentirse suaves;
- evitar bloquear la interacción;
- respetar `prefers-reduced-motion`;
- funcionar correctamente en mobile;
- evitar movimientos constantes que distraigan.

No introducir animaciones solamente para demostrar capacidad técnica.

---

## Rendimiento

Prestar especial atención a:

- Three.js;
- React Three Fiber;
- canvas;
- partículas;
- imágenes;
- fuentes;
- animaciones de scroll;
- componentes cliente;
- listeners globales.

Evitar convertir componentes en Client Components sin necesidad.

Usar `"use client"` únicamente cuando exista una dependencia real de:

- estado;
- efectos;
- eventos;
- APIs del navegador;
- animaciones que lo requieran.

Evitar cargar experiencias 3D pesadas antes de que sean necesarias.

Reducir o desactivar efectos costosos en dispositivos con menor capacidad cuando corresponda.

No degradar Core Web Vitals por efectos puramente decorativos.

---

## Accesibilidad

Mantener HTML semántico.

Comprobar:

- un único `h1` principal;
- orden correcto de encabezados;
- navegación mediante teclado;
- estados de foco visibles;
- contraste suficiente;
- botones reales para acciones;
- enlaces reales para navegación;
- textos alternativos apropiados;
- etiquetas en formularios;
- mensajes de error comprensibles;
- respeto por `prefers-reduced-motion`.

No depender exclusivamente del color, hover o animación para comunicar información.

El cursor personalizado nunca debe impedir el uso normal del sitio ni afectar dispositivos táctiles.

---

## Contenido y tono

El contenido debe estar escrito en español claro, natural y profesional.

Evitar:

- exageraciones;
- frases genéricas;
- tecnicismos innecesarios;
- promesas imposibles de comprobar;
- textos que parezcan generados por inteligencia artificial;
- exceso de palabras como “revolucionario”, “disruptivo” o “transformador”.

Priorizar mensajes que expliquen:

- qué hace Valinor;
- para quién lo hace;
- qué problema resuelve;
- cómo trabaja;
- qué recibe el cliente;
- cuál es el siguiente paso.

No cambiar textos comerciales importantes sin indicarlo explícitamente.

---

## SEO y metadatos

Cuando una tarea afecte páginas, contenido principal o estructura, revisar:

- `title`;
- `description`;
- jerarquía de encabezados;
- metadata social;
- Open Graph;
- favicon;
- canonical;
- contenido indexable;
- textos alternativos;
- enlaces internos.

No utilizar contenido de relleno en una versión destinada a producción.

---

## Verificación obligatoria

Después de modificar código:

1. Revisar los cambios realizados.
2. Ejecutar:

```bash
npm run lint
# CLAUDE.md

## Instrucciones principales

Antes de analizar, planificar o modificar este proyecto, leer completamente:

- `AGENTS.md`
- `README.md`
- `package.json`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`

También inspeccionar todos los componentes relacionados con la tarea solicitada.

`AGENTS.md` es la fuente principal de reglas del repositorio.  
Si existe una contradicción entre este archivo y `AGENTS.md`, prevalece `AGENTS.md`.

---

## Contexto del proyecto

Este repositorio contiene el sitio web institucional de Valinor Agency.

Valinor Agency ofrece actualmente servicios de:

- sitios web institucionales;
- landing pages;
- ecommerce;
- aplicaciones web;
- tableros de control y dashboards;
- soluciones digitales personalizadas.

Valinor utiliza herramientas de inteligencia artificial como parte de su proceso interno de trabajo, análisis, diseño, desarrollo, documentación y revisión.

Actualmente Valinor no ofrece como servicios independientes:

- agentes de inteligencia artificial;
- asistentes privados para empresas;
- chatbots personalizados;
- plataformas similares a ChatGPT;
- consultoría independiente de inteligencia artificial;
- automatizaciones empresariales basadas en IA como producto comercial.

No incorporar estos servicios en textos, secciones, metadatos o llamadas comerciales sin una instrucción explícita del usuario.

---

## Objetivo del sitio

El sitio debe:

- presentar claramente los servicios de Valinor;
- transmitir profesionalismo y confianza;
- demostrar criterio de diseño y capacidad técnica;
- explicar la metodología de trabajo;
- mostrar proyectos y experiencia;
- convertir visitantes en potenciales clientes;
- facilitar el contacto.

La experiencia no debe parecer una plantilla genérica ni una landing generada automáticamente.

---

## Forma de trabajo

Para cada tarea:

1. Consultar `git status`.
2. Leer la documentación relevante.
3. Inspeccionar los archivos relacionados.
4. Identificar el comportamiento actual.
5. Explicar brevemente:
   - qué se entendió;
   - qué archivos se verían afectados;
   - qué enfoque se propone;
   - qué riesgos o dudas existen.
6. Esperar autorización antes de modificar cuando el usuario haya pedido primero:
   - análisis;
   - auditoría;
   - diagnóstico;
   - propuesta;
   - planificación.
7. Implementar únicamente el alcance aprobado.
8. Revisar los cambios.
9. Ejecutar las validaciones disponibles.
10. Informar con precisión qué fue modificado y verificado.

No comenzar una modificación mientras todavía se esté definiendo el alcance.

---

## Reglas de implementación

- Mantener cambios pequeños y revisables.
- No realizar refactors generales que no estén relacionados con la tarea.
- No reescribir componentes completos cuando un cambio puntual sea suficiente.
- Reutilizar componentes existentes cuando sea razonable.
- Mantener TypeScript estricto.
- Evitar `any`.
- No dejar imports sin usar.
- No dejar logs de depuración.
- No dejar código comentado innecesario.
- No crear abstracciones prematuras.
- No agregar dependencias sin autorización.
- No reemplazar tecnologías existentes sin una justificación clara.
- No modificar configuraciones fuera del alcance sin explicarlo.
- No exponer secretos ni credenciales.
- No introducir backend, base de datos, autenticación o CMS sin que hayan sido solicitados.

---

## Dirección visual

La web debe sentirse como el trabajo de una agencia profesional.

Priorizar:

- jerarquía visual;
- composición editorial;
- tipografía cuidada;
- espacios bien utilizados;
- contraste;
- claridad comercial;
- ritmo entre secciones;
- diseños variados;
- animaciones sutiles;
- buena experiencia mobile;
- identidad visual consistente.

Evitar:

- tarjetas iguales en todas las secciones;
- exceso de glassmorphism;
- gradientes sin intención;
- brillos exagerados;
- blobs genéricos;
- textos centrados en toda la página;
- iconos decorativos sin utilidad;
- animaciones constantes;
- efectos visuales que dificulten la lectura;
- frases comerciales vacías;
- estética genérica de inteligencia artificial;
- copiar estructuras visuales sin adaptarlas al contenido.

No interpretar “hacerlo más moderno” como agregar más efectos.  
Primero mejorar jerarquía, composición, tipografía, contenido y espaciado.

---

## Mobile-first

Toda modificación visual debe evaluarse primero en dispositivos móviles.

Revisar como mínimo:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- 1440 px.

Evitar:

- desbordamiento horizontal;
- textos cortados;
- títulos excesivamente largos;
- botones pequeños;
- elementos dependientes exclusivamente del hover;
- alturas rígidas innecesarias;
- contenido importante oculto en mobile;
- canvas o efectos 3D que afecten el rendimiento;
- animaciones pesadas en dispositivos móviles.

No resolver problemas responsive ocultando contenido esencial.

---

## Animaciones

El proyecto puede utilizar:

- CSS para transiciones simples;
- Framer Motion para animaciones declarativas;
- GSAP para secuencias complejas o controladas por scroll;
- Three.js o React Three Fiber para experiencias 3D justificadas.

No combinar varias librerías en una misma interacción si no es necesario.

Las animaciones deben:

- reforzar la jerarquía;
- orientar la mirada;
- sentirse suaves;
- respetar `prefers-reduced-motion`;
- evitar bloquear la interacción;
- funcionar correctamente en mobile;
- no generar movimiento permanente innecesario.

No agregar animaciones únicamente para demostrar complejidad técnica.

---

## Rendimiento

Revisar especialmente el impacto de:

- Three.js;
- React Three Fiber;
- canvas;
- partículas;
- imágenes;
- fuentes;
- animaciones por scroll;
- listeners globales;
- componentes marcados con `"use client"`.

No convertir un componente en Client Component si no existe una necesidad real.

Usar `"use client"` únicamente cuando se necesiten:

- estados;
- efectos;
- eventos;
- APIs del navegador;
- librerías que dependan del cliente.

Evitar degradar la carga inicial y los Core Web Vitals por efectos decorativos.

---

## Accesibilidad

Mantener:

- HTML semántico;
- un único `h1`;
- jerarquía correcta de encabezados;
- navegación mediante teclado;
- foco visible;
- contraste suficiente;
- botones reales para acciones;
- enlaces reales para navegación;
- textos alternativos adecuados;
- etiquetas en formularios;
- soporte para `prefers-reduced-motion`.

No depender solamente del color, hover o animación para comunicar información.

---

## Contenido

Los textos deben estar escritos en español claro, natural y profesional.

La comunicación debe centrarse en:

- sitios web;
- ecommerce;
- aplicaciones web;
- dashboards;
- soluciones digitales a medida;
- metodología de trabajo;
- resultados para el cliente.

Evitar:

- promesas imposibles de comprobar;
- tecnicismos innecesarios;
- frases genéricas;
- exageraciones;
- textos con apariencia generada automáticamente;
- presentar inteligencia artificial como un servicio actual.

La IA puede mencionarse como parte de la metodología interna de Valinor, pero no como una línea comercial independiente.

No modificar textos comerciales relevantes sin mencionarlo en el plan.

---

## Revisión de contenido relacionado con IA

Cuando una tarea afecte el contenido actual del sitio, revisar si existen:

- secciones de agentes de IA;
- referencias a chatbots;
- menciones a ChatGPT privado;
- asistentes empresariales;
- automatizaciones ofrecidas como servicio;
- metadatos relacionados con soluciones de IA;
- componentes llamados `AISolutions` o similares;
- enlaces de navegación que presenten IA como servicio.

Proponer su eliminación, transformación o reutilización según el nuevo alcance.

No borrar componentes automáticamente. Primero analizar si su estructura visual puede reutilizarse para:

- aplicaciones web;
- dashboards;
- sistemas personalizados;
- ecommerce;
- soluciones digitales.

---

## Validación

Después de modificar código, ejecutar:

```bash
npm run lint
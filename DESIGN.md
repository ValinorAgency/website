# Design

## Aplicabilidad

Aplicable. Este proyecto es la superficie institucional y comercial pública de Valinor Agency.

## Marca

Valinor debe percibirse como precisa, confiable y ambiciosa. El tono es el de un equipo experto que comunica con claridad sin exagerar.

La identidad puede inspirarse sutilmente en luz, estrellas, naturaleza, creación y excelencia. No debe convertirse en una web temática de fantasía ni realizar referencias directas a El Señor de los Anillos.

El símbolo de marca se relaciona con dos árboles y una estrella, con prioridad en legibilidad y reconocimiento a tamaños pequeños.

## Objetivo de la experiencia

La experiencia debe ayudar a que una persona:

1. entienda qué hace Valinor;
2. identifique si la agencia puede resolver su necesidad;
3. encuentre evidencia suficiente para confiar;
4. comprenda cómo sería trabajar juntos;
5. pueda iniciar una consulta sin fricción.

La calidad visual debe respaldar la propuesta comercial, no reemplazarla.

## Dirección visual

- composición editorial;
- jerarquía tipográfica clara;
- contraste alto y uso deliberado del espacio;
- superficies oscuras combinadas con secciones claras;
- acentos de color controlados;
- demos visuales que expliquen capacidad;
- interacciones sutiles y con propósito;
- layouts variados entre secciones;
- detalle profesional tanto en desktop como en mobile.

## Anti-referencias

- plantillas genéricas de agencia;
- fotos de stock de reuniones;
- estética hacker o neon saturada;
- startup SaaS genérica;
- glassmorphism en toda la interfaz;
- gradientes decorativos sin función;
- exceso de tarjetas idénticas;
- todos los textos centrados;
- animaciones en cada elemento;
- efectos que retrasen la lectura o el contacto;
- mensajes comerciales vacíos;
- referencias visuales literales a fantasía.

## Contenido y tono

El contenido público debe estar en español claro, natural y profesional.

Priorizar:

- problemas y resultados comprensibles;
- alcance concreto;
- contacto directo;
- proceso visible;
- evidencia verificable;
- próximos pasos claros.

Evitar:

- métricas, testimonios o resultados no comprobados;
- afirmar una escala de equipo que no haya sido confirmada;
- lenguaje como “revolucionario”, “disruptivo” o “transformador”;
- tecnicismos que no ayuden a decidir;
- presentar ejemplos conceptuales como trabajos reales;
- convertir la IA en protagonista comercial fuera del alcance de PRODUCT.md.

## Tipografía

### Estado actual

- Inter es la familia efectiva principal.
- Lora, Cinzel y DM Sans se importan globalmente, pero no tienen un uso confirmado en la home renderizada.
- La clase .font-display utiliza actualmente el mismo stack basado en Inter.

La conveniencia de mantener o retirar las fuentes adicionales debe resolverse como tarea de rendimiento, no como cambio implícito.

## Color

Los tokens actuales se encuentran en src/app/globals.css.

Paleta base confirmada:

- fondo principal: #060609;
- superficie: #0E0E12;
- superficie elevada: #17171D;
- texto principal: #EEEEF2;
- texto secundario: #9898A6;
- azul de marca técnico: #3279F9;
- acento verde/teal presente en animaciones: #24D6BC;
- secciones claras aproximadas: #f4f4f1 y #f5f5f2.

Los cambios de color deben mantener WCAG AA y verificar texto, controles, foco y estados interactivos.

## Layout actual

La home renderiza actualmente:

1. navegación;
2. hero de marca con fondo WebGL;
3. tipos de soluciones presentados como proyectos;
4. capacidades y demo de interfaz;
5. líneas editoriales animadas;
6. diferenciales;
7. contacto;
8. footer.

La necesidad de incorporar casos reales, equipo y proceso está identificada en la auditoría, pero todavía requiere aprobación de contenido.

### Copy aprobado del hero

Confirmado, implementación pendiente:

- Título: "Diseño y desarrollo web a medida".
- Descripción: "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina."
- CTA principal: "Contanos tu proyecto".
- CTA secundario: "Explorar conceptos".
- Respaldo: "Más de ocho años de experiencia por fundador en desarrollo de soluciones digitales."

### Sección de equipo (confirmada, implementación pendiente)

Sección breve con fotos, sin LinkedIn inicialmente. Bios en `PRODUCT.md`. Fotos concretas: Pending confirmation.

## Componentes e interacción

- Los CTA deben tener una acción inequívoca y consistente.
- Las interacciones esenciales no pueden depender de hover.
- Los ejemplos conceptuales deben etiquetarse como tales, con la etiqueta "Concepto".
- La sección de tecnologías se conserva por ahora. Mejora futura registrada: separar la presentación de frontend/diseño (más creativa) de la de backend/datos (más estructurada).
- Los diálogos deben atrapar el foco, cerrarse con Escape y devolver el foco al disparador.
- El cursor personalizado nunca debe dejar al visitante sin un cursor utilizable si JavaScript falla.
- El formulario debe comunicar si envió, falló o derivó a una aplicación externa.

## Responsive

Diseñar y verificar como mínimo:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- 1440 px.

Evitar:

- desbordamiento horizontal;
- títulos cortados;
- controles menores a un área táctil cómoda;
- contenido esencial oculto;
- layouts rígidos;
- modales que excedan el viewport;
- efectos 3D o canvas que afecten lectura, batería o interacción.

## Motion

- CSS para transiciones simples.
- Framer Motion para animación declarativa de interfaz.
- GSAP para secuencias justificadas.
- Three.js para experiencias cuyo valor sea superior a su costo de rendimiento.

Toda animación debe:

- respetar prefers-reduced-motion;
- tener un fallback estático;
- evitar bloquear interacción;
- evitar movimiento permanente innecesario;
- reducirse o desactivarse en dispositivos limitados cuando corresponda.

El loader actual bloquea temporalmente la interacción y está pendiente de revisión.

## Accesibilidad

Objetivo mínimo: WCAG AA.

Verificar:

- un único h1;
- orden de encabezados;
- navegación por teclado;
- foco visible;
- contraste;
- labels y mensajes de formularios;
- nombres accesibles;
- landmarks semánticos;
- contenido comprensible sin animación;
- comportamiento con zoom y texto ampliado;
- soporte de reducción de movimiento.

## Assets

- Logo principal actual: public/logoValinor-removebg.png.
- Favicon: src/app/favicon.ico.
- Existen modelos GLB, ZIP y recursos de prototipos en public/.
- La autorización, origen y necesidad de cada asset deben confirmarse antes del lanzamiento.

Los recursos sin uso o propios de experimentación están pendientes de limpieza según la auditoría.

## Preguntas abiertas

- Casos reales autorizados.
- Fotos concretas de la sección de equipo.
- Uso final del azul y del teal dentro del sistema de marca.
- Necesidad de mantener las fuentes adicionales.
- Comportamiento definitivo del loader y de los canvas en mobile.
- Imagen Open Graph oficial.

Resueltas por decisión confirmada del usuario (2026-08-28), pendientes de implementación: copy definitivo del hero, CTA principal y secundario, presentación pública del equipo (bios y estructura de la sección).


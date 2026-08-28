# Product

## Contexto

- Organización: Valinor Agency.
- Producto: sitio web institucional de la agencia.
- Estado: frontend avanzado, todavía no aprobado como listo para producción.
- Mercado inicial: Argentina.
- Modalidad de trabajo: además de proyectos de alcance definido, Valinor podrá ofrecer desarrollo por horas, soporte evolutivo o equipo dedicado, sujeto a alcance, disponibilidad y capacidad confirmada en cada caso.

## Problema

Dueños de empresas, profesionales, founders y equipos de marketing necesitan evaluar rápidamente si Valinor puede entender su negocio y construir una solución digital profesional.

El sitio debe reducir la incertidumbre típica al elegir un proveedor: qué puede construir, cómo trabaja, qué diferencia su propuesta, quién realizará el trabajo y cuál es el siguiente paso para solicitar una propuesta.

## Usuarios

Público principal:

- PyMEs;
- profesionales que necesitan una presencia digital sólida;
- emprendimientos.

Público secundario:

- empresas que necesitan ampliar temporalmente su capacidad de desarrollo (desarrollo por horas, soporte evolutivo o equipo dedicado, según disponibilidad y capacidad confirmada).

## Objetivos

1. Comunicar con claridad qué hace Valinor y qué problemas puede resolver.
2. Transmitir profesionalismo, confianza, calidad de diseño y capacidad técnica.
3. Mostrar evidencia real de experiencia y una forma de trabajo comprensible.
4. Facilitar el contacto desde desktop y mobile.
5. Convertir visitantes relevantes en consultas calificadas.

## Conversión principal

La conversión principal es que una persona interesada envíe una consulta con contexto suficiente para evaluar su proyecto.

Canal confirmado: combinación de formulario web real y WhatsApp comercial. Implementación pendiente; ver `docs/ARCHITECTURE.md`.

El correo oficial y receptor de consultas es `agencyvalinor@gmail.com`. Las referencias operativas a `hola@valinor.agency` quedan descartadas y deben eliminarse de la implementación pública (pendiente; ver `docs/ARCHITECTURE.md` y la auditoría de lanzamiento).

WhatsApp comercial (provisional): +54 9 11 5015-2833. Implementación pendiente; ver `docs/ARCHITECTURE.md`.

## Propuesta de valor

Valinor diseña y desarrolla soluciones web alrededor de objetivos concretos del negocio, con contacto directo con quienes realizan el trabajo, alcance explícito, entregas revisables y elección tecnológica según la necesidad real.

El copy del hero fue aprobado (título, descripción, CTA primario, CTA secundario y línea de respaldo). Texto completo en `DESIGN.md`. Implementación pendiente.

## Alcance comercial confirmado

### Incluido

- sitios web institucionales;
- landing pages;
- ecommerce;
- aplicaciones web;
- dashboards y paneles;
- herramientas internas y soluciones digitales a medida;
- diseño y desarrollo web;
- acompañamiento desde análisis hasta publicación, cuando forme parte del proyecto acordado.

### Excluido del posicionamiento actual

- agentes de inteligencia artificial como servicio independiente;
- asistentes privados o productos similares a ChatGPT;
- chatbots empresariales como línea comercial;
- consultoría de inteligencia artificial independiente;
- automatizaciones empresariales basadas en IA como producto comercial autónomo.

La IA puede mencionarse como herramienta interna para análisis, diseño, desarrollo, documentación y control de calidad.

Valinor no ofrece IA como servicio independiente. Una integración con IA dentro de un proyecto de cliente podrá evaluarse puntualmente solo si el cliente la solicita explícitamente y acepta los costos de API y de proveedores externos que implique. Valinor no financiará indefinidamente el consumo del cliente con una API key propia.

## Requisitos confirmados

- idioma principal español;
- experiencia mobile-first;
- contacto claro y accesible;
- contenido verificable, sin métricas ni promesas inventadas;
- un único `h1` y jerarquía semántica correcta;
- accesibilidad WCAG AA como objetivo mínimo;
- respeto por `prefers-reduced-motion`;
- SEO técnico básico antes del lanzamiento;
- rendimiento compatible con una experiencia comercial, incluso en mobile;
- ningún servicio, integración o dato de contacto debe inventarse.

## Contenido y evidencia

El sitio necesita distinguir claramente:

- tipos de soluciones que Valinor puede construir;
- trabajos o casos reales efectivamente autorizados para publicación;
- ejemplos conceptuales o demostraciones.

El portfolio actual debe presentarse como proyectos o conceptos. Cada concepto debe estar identificado con la etiqueta "Concepto". Los conceptos se reemplazarán progresivamente por casos reales autorizados a medida que existan. Implementación pendiente; ver hallazgo P1-02 de la auditoría.

Casos reales publicables: Pending confirmation.

Presentación pública de los integrantes: confirmada. Sección breve de equipo con fotos, sin LinkedIn inicialmente:

- Milton Collard — Cofundador · Frontend y Experiencia Digital. Especialidades: frontend, diseño de interfaces, SEO, optimización de conversiones y análisis funcional.
- Martín Abbott — Cofundador · Backend y Arquitectura de Datos. Especialidades: backend, bases de datos, integraciones y análisis funcional.

Cada fundador cuenta individualmente con más de ocho años de experiencia en desarrollo de software.

Fotos concretas del equipo: Pending confirmation. Implementación de la sección: pendiente.

Testimonios, logos de clientes y métricas: no utilizar hasta contar con autorización y fuente verificable. No usar clientes, testimonios, métricas, logos ni resultados ficticios.

## Restricciones

- frontend institucional sin backend, autenticación, base de datos ni CMS en el estado actual;
- presupuesto, fechas y alcance comercial no deben inferirse;
- el sitio no debe parecer una plantilla genérica ni una demostración técnica desconectada del negocio;
- los efectos visuales no deben retrasar o bloquear la conversión;
- el código, hosting y servicios externos no se modifican sin autorización.

## Métricas de éxito

Pending confirmation.

Posibles métricas a definir después del lanzamiento:

- clics en CTA principal;
- consultas iniciadas y enviadas;
- clics en WhatsApp;
- tasa de conversión por canal;
- rendimiento y Core Web Vitals;
- tráfico orgánico hacia servicios.

No implementar tracking hasta definir proveedor, consentimiento aplicable y alcance.

## Preguntas abiertas

Realmente pendientes:

- ¿Cuándo se comprará el dominio oficial? Candidato principal: `valinoragency.com.ar`.
- ¿Cuál será el remitente definitivo del correo del formulario? Depende de comprar y verificar el dominio.
- ¿Qué fotos concretas se usarán para la sección de equipo?
- ¿Qué proyectos reales pueden mostrarse públicamente?
- ¿Qué métricas definirán una conversión exitosa?

Resueltas por decisión confirmada del usuario (2026-08-28), pendientes de implementación:

- Hosting: Vercel.
- Número comercial de WhatsApp (provisional): +54 9 11 5015-2833.
- Canal del formulario: formulario web (Resend) y WhatsApp combinados.
- Proveedor del formulario: Resend.
- Presentación pública de integrantes y roles: sección breve de equipo con bios de ambos cofundadores.
- Mercado inicial: Argentina.

## Fuentes

- Alcance y reglas existentes del repositorio.
- Implementación actual de la rama `development`.
- Auditoría de lanzamiento del 28 de agosto de 2026.
- Decisiones expresadas por el usuario sobre el posicionamiento público de Valinor.
- Decisiones confirmadas por el usuario el 28 de agosto de 2026 sobre hosting, dominio, mercado, público, modalidad de trabajo, alcance de IA, portfolio, equipo, hero y contacto.

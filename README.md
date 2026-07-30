# Valinor Agency — Website

Sitio web institucional de Valinor Agency.

Valinor Agency es una agencia digital especializada en el diseño y desarrollo de soluciones web para empresas, profesionales y emprendimientos.

Actualmente ofrecemos:

- sitios web institucionales;
- landing pages;
- ecommerce;
- aplicaciones web;
- tableros de control y dashboards;
- soluciones digitales personalizadas.

Utilizamos herramientas de inteligencia artificial como parte de nuestro proceso interno de análisis, diseño, desarrollo, documentación y automatización. Sin embargo, en esta etapa no ofrecemos productos de inteligencia artificial independientes, asistentes privados ni sistemas similares a ChatGPT para empresas.

---

## Objetivo del proyecto

El objetivo de este sitio es presentar los servicios de Valinor Agency, comunicar nuestra metodología de trabajo y facilitar el contacto con potenciales clientes.

La experiencia debe transmitir:

- profesionalismo;
- confianza;
- calidad de diseño;
- solidez técnica;
- atención personalizada;
- claridad comercial;
- capacidad para crear soluciones a medida.

La web debe evitar una estética genérica de plantilla o de sitio generado automáticamente.

---

## Servicios presentados

### Sitios web

Diseño y desarrollo de sitios institucionales, páginas corporativas y landing pages optimizadas para comunicar servicios y generar consultas.

### Ecommerce

Creación e implementación de tiendas online adaptadas a las necesidades de cada negocio.

Según el proyecto, la solución puede construirse utilizando plataformas existentes o mediante un desarrollo personalizado.

### Aplicaciones web

Desarrollo de sistemas web para resolver procesos específicos, administrar información, digitalizar operaciones o crear productos digitales.

### Tableros de control

Creación de dashboards y paneles para visualizar información, métricas, indicadores y estados operativos.

---

## Alcance actual

Este repositorio contiene únicamente el frontend del sitio institucional de Valinor Agency.

Actualmente no incluye:

- backend propio;
- sistema de autenticación;
- panel administrativo;
- base de datos;
- ecommerce funcional;
- asistentes conversacionales;
- agentes de inteligencia artificial;
- plataformas privadas similares a ChatGPT;
- automatizaciones empresariales ofrecidas como producto independiente.

Estos elementos solo deben incorporarse cuando exista una necesidad concreta y hayan sido aprobados como parte del alcance.

---

## Stack tecnológico

El proyecto utiliza:

- [Next.js](https://nextjs.org/) con App Router;
- [React](https://react.dev/);
- [TypeScript](https://www.typescriptlang.org/);
- [Tailwind CSS](https://tailwindcss.com/);
- [Framer Motion](https://motion.dev/);
- [GSAP](https://gsap.com/);
- [Three.js](https://threejs.org/);
- [React Three Fiber](https://r3f.docs.pmnd.rs/);
- `next/font` para optimización de tipografías.

Antes de actualizar versiones o agregar dependencias, revisar `package.json` y evaluar el impacto en rendimiento y mantenimiento.

---

## Requisitos

Para ejecutar el proyecto se necesita:

- Node.js;
- npm;
- Git.

Se recomienda utilizar una versión estable y compatible de Node.js.

Para comprobar las versiones instaladas:

```bash
node --version
npm --version
git --version
```

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/ValinorAgency/website.git
```

Entrar al proyecto:

```bash
cd website
```

Instalar las dependencias:

```bash
npm install
```

---

## Desarrollo local

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

---

## Scripts disponibles

### Desarrollo

```bash
npm run dev
```

Inicia el servidor local de Next.js.

### Lint

```bash
npm run lint
```

Ejecuta ESLint para detectar errores y problemas de calidad.

### Build

```bash
npm run build
```

Genera la compilación de producción y valida errores de Next.js y TypeScript.

### Producción local

```bash
npm run start
```

Ejecuta localmente una build generada previamente.

---

## Estructura principal

```text
website/
├── public/
│   └── recursos estáticos
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── secciones y componentes visuales
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── tsconfig.json
└── README.md
```

La página principal se compone desde:

```text
src/app/page.tsx
```

Los componentes y secciones reutilizables se encuentran principalmente en:

```text
src/components
```

---

## Diseño y experiencia

El sitio debe construirse con un enfoque mobile-first.

Cada cambio visual debe revisarse como mínimo en:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- 1024 px;
- 1440 px.

La dirección visual debe priorizar:

- jerarquía tipográfica;
- composición editorial;
- claridad;
- contraste;
- espacios bien utilizados;
- animaciones sutiles;
- navegación accesible;
- rendimiento;
- diferenciación entre secciones.

Se deben evitar:

- tarjetas idénticas en todas las secciones;
- exceso de glassmorphism;
- gradientes decorativos sin intención;
- animaciones constantes;
- textos genéricos;
- estética de plantilla;
- efectos que afecten la legibilidad;
- componentes 3D pesados sin una función concreta.

---

## Uso de animaciones

El proyecto cuenta con distintas herramientas de animación.

Utilizar preferentemente:

- CSS para transiciones simples;
- Framer Motion para animaciones de interfaz;
- GSAP para secuencias complejas o animaciones controladas por scroll;
- Three.js y React Three Fiber únicamente para experiencias 3D justificadas.

No combinar varias librerías para resolver una misma interacción sin una razón técnica clara.

Todas las animaciones deben respetar:

```css
prefers-reduced-motion
```

---

## Inteligencia artificial

Valinor utiliza inteligencia artificial como herramienta interna para mejorar tareas como:

- investigación;
- exploración de ideas;
- documentación;
- generación y revisión de código;
- análisis de interfaces;
- detección de errores;
- automatización del trabajo de desarrollo.

Esto no significa que Valinor ofrezca actualmente:

- asistentes privados para empresas;
- chatbots empresariales personalizados;
- agentes autónomos;
- plataformas similares a ChatGPT;
- consultoría independiente de inteligencia artificial.

No incorporar estos servicios en textos, secciones o llamadas comerciales sin una decisión previa del equipo.

---

## Flujo de trabajo

Antes de comenzar una tarea:

```bash
git status
git pull origin main
```

Crear una rama específica:

```bash
git checkout -b feature/nombre-de-la-tarea
```

Ejemplos:

```text
feature/redesign-services
feature/mobile-navigation
fix/hero-overflow
chore/update-readme
```

Antes de entregar un cambio:

```bash
npm run lint
npm run build
```

Revisar el estado:

```bash
git status
git diff
```

---

## Convenciones de commits

Utilizar mensajes claros y descriptivos.

Ejemplos:

```text
feat: add ecommerce services section
fix: resolve hero overflow on mobile
refactor: simplify portfolio card structure
docs: update project README
style: improve spacing in services section
chore: update project configuration
```

No realizar commits o pushes automáticos desde agentes sin autorización del usuario.

---

## Trabajo con Codex y Claude

Las reglas principales para agentes se encuentran en:

```text
AGENTS.md
```

Las instrucciones adicionales para Claude se encuentran en:

```text
CLAUDE.md
```

Antes de modificar el proyecto, los agentes deben:

1. leer la documentación;
2. revisar el estado de Git;
3. inspeccionar los archivos relacionados;
4. explicar su plan;
5. mantener el cambio dentro del alcance solicitado;
6. validar con lint y build;
7. no hacer commits ni push sin autorización.

---

## Variables de entorno

Actualmente el proyecto no debería almacenar credenciales reales dentro del repositorio.

Cuando se incorporen servicios externos, documentar sus variables en:

```text
.env.example
```

Nunca subir al repositorio:

```text
.env
.env.local
.env.production
```

con secretos o credenciales reales.

---

## Despliegue

El proveedor de despliegue definitivo debe documentarse cuando quede confirmado.

Al conectar el proyecto con Vercel, Netlify u otra plataforma, verificar:

- rama de producción;
- comando de build;
- versión de Node.js;
- variables de entorno;
- dominio;
- permisos de acceso a la organización;
- comportamiento de previews;
- logs de compilación.

---

## Estado del proyecto

El sitio se encuentra en desarrollo.

Las secciones, textos, recursos visuales y servicios presentados pueden cambiar a medida que se defina la identidad comercial definitiva de Valinor Agency.

Antes de implementar cambios importantes de alcance, diseño o contenido, se debe acordar la dirección entre los responsables del proyecto.

---

## Responsables

Proyecto desarrollado y mantenido por Valinor Agency.

Repositorio:

```text
https://github.com/ValinorAgency/website
```

---

## Licencia y propiedad

Este es un proyecto privado de Valinor Agency.

El código, la identidad visual, los componentes, los textos y los recursos propios no deben reutilizarse, distribuirse ni publicarse fuera del proyecto sin autorización.
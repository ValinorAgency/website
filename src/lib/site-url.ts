// Resuelve la URL pública del sitio para metadata, canonical, Open Graph,
// JSON-LD, robots.txt y sitemap.xml. Server-only: no usar NEXT_PUBLIC_ acá,
// nada de esto se necesita en el navegador.
//
// Prioridad:
// 1. SITE_URL configurada explícitamente (pensada para el dominio de
//    producción una vez comprado y verificado; ver docs/ARCHITECTURE.md).
// 2. VERCEL_PROJECT_PRODUCTION_URL: dominio de producción del proyecto en
//    Vercel, cuando Vercel lo provee.
// 3. VERCEL_URL: URL del deployment actual (previews y builds de producción
//    sin dominio custom asignado).
// 4. http://localhost:3000, únicamente como último recurso para desarrollo
//    local o un build local sin ninguna de las variables anteriores.
//
// Excepción: en un preview de Vercel (VERCEL_ENV === "preview") se ignoran
// SITE_URL y VERCEL_PROJECT_PRODUCTION_URL a propósito, para que un
// deployment temporal nunca se anuncie a sí mismo (canonical, Open Graph,
// JSON-LD) como si fuera el dominio de producción. En ese caso se usa
// directamente la URL propia del deployment (VERCEL_URL).

const LOCALHOST_URL = "http://localhost:3000";

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function withoutTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function resolveRawSiteUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  const explicitSiteUrl = process.env.SITE_URL?.trim();
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelDeploymentUrl = process.env.VERCEL_URL?.trim();

  if (vercelEnv === "preview") {
    if (vercelDeploymentUrl) return vercelDeploymentUrl;
    return LOCALHOST_URL;
  }

  if (explicitSiteUrl) return explicitSiteUrl;
  if (vercelProductionUrl) return vercelProductionUrl;
  if (vercelDeploymentUrl) return vercelDeploymentUrl;

  return LOCALHOST_URL;
}

export function getSiteUrl(): string {
  return withoutTrailingSlash(withProtocol(resolveRawSiteUrl()));
}

export function absoluteUrl(path: string = "/"): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

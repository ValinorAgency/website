import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

// Solo páginas públicas reales que queremos indexar. /api/contact no es una
// página. No se agrega lastModified: no existe una fecha de modificación real
// por página, y generar `new Date()` en cada request sería una fecha
// inventada.
//
// Una entrada por idioma (localePrefix: "as-needed" deja español en "/" e
// inglés en "/en"), cada una con `alternates.languages` apuntando a ambas —
// así los buscadores entienden que son la misma página en dos idiomas, no
// contenido duplicado.
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {
    es: siteUrl,
    en: `${siteUrl}/en`,
  };

  return routing.locales.map((locale) => ({
    url: languages[locale],
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}

import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // Un preview de Vercel es un deployment temporal, no la superficie pública
  // real: bloquear todo el rastreo y no anunciar sitemap, para que nunca
  // termine indexado en lugar (o además) de la producción real.
  if (process.env.VERCEL_ENV === "preview") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = getSiteUrl();
  const isLocalhost = siteUrl.startsWith("http://localhost");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    // localhost no es una URL pública: no tiene sentido anunciar un sitemap ahí.
    ...(isLocalhost ? {} : { sitemap: absoluteUrl("/sitemap.xml") }),
  };
}

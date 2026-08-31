import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Solo páginas públicas reales que queremos indexar. /api/contact no es una
// página, y /sprite-probe es un prototipo interno (ver docs/ARCHITECTURE.md).
// No se agrega lastModified: no existe una fecha de modificación real por
// página, y generar `new Date()` en cada request sería una fecha inventada.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

import { getSiteUrl } from "./site-url";

// Solo datos confirmados (ver PRODUCT.md). No agregar dirección, precio,
// rating, foundingDate, cantidad de empleados ni redes sociales.
//
// `description` se recibe como parámetro (viene de messages/{locale}.json,
// clave "metadata.description") en vez de estar hardcodeada acá: es el mismo
// texto que layout.tsx usa para la meta description y HeroParticleAlt.tsx
// para el párrafo del hero — antes estaba repetido a mano en los 3 lugares,
// ahora una sola clave de traducción alimenta los tres.
export function getOrganizationJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valinor Agency",
    url: getSiteUrl(),
    email: "agencyvalinor@gmail.com",
    telephone: "+5491150152833",
    areaServed: "Argentina",
    description,
  } as const;
}

// Escapa "<" para que un valor no pueda cerrar el <script> que lo contiene
// (p. ej. si algún dato incluyera literalmente "</script>").
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

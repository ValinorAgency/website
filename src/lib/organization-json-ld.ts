import { getSiteUrl } from "./site-url";

// Solo datos confirmados (ver PRODUCT.md). No agregar dirección, precio,
// rating, foundingDate, cantidad de empleados ni redes sociales.
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valinor Agency",
    url: getSiteUrl(),
    email: "agencyvalinor@gmail.com",
    telephone: "+5491150152833",
    areaServed: "Argentina",
    description:
      "Creamos sitios web, tiendas online, aplicaciones y dashboards para empresas, profesionales y emprendimientos de Argentina.",
  } as const;
}

// Escapa "<" para que un valor no pueda cerrar el <script> que lo contiene
// (p. ej. si algún dato incluyera literalmente "</script>").
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

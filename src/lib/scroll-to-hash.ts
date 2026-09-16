// Navegación por anclas (menú, footer) sin que la URL quede con "#seccion":
// se intercepta el click y se hace el scroll a mano, en vez de dejar que el
// navegador siga el href nativo (que sí actualiza la barra de direcciones).
// Se pierde poder linkear/compartir una sección puntual, pero para esta
// landing (corta, de una sola página) no hace falta.
export function scrollToHash(href: string, reduceMotion: boolean | null): void {
  const id = href.length > 1 ? href.slice(1) : "";
  const target = id ? document.getElementById(id) : null;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  if (target) {
    target.scrollIntoView({ behavior, block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
}

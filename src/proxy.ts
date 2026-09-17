import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Excluye /api, los internals de Next y cualquier archivo con extensión
  // (favicon, imágenes públicas, etc.) — el middleware solo debe intervenir
  // en rutas de página.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

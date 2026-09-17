import { defineRouting } from "next-intl/routing";

// Español queda en "/" (ninguna URL indexada hoy cambia) e inglés en "/en"
// (localePrefix: "as-needed" solo agrega el prefijo para los locales que no
// son el default).
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

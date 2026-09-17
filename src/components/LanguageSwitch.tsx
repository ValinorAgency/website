"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// usePathname() de next-intl devuelve la ruta "interna" sin el prefijo de
// idioma (ej. "/" tanto en /es como en /en); pasarle un locale explícito al
// Link arma el link a esa misma ruta en el otro idioma, sin tener que armar
// la URL a mano.
export default function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const otherLocale = locale === "es" ? "en" : "es";

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      className={className}
      aria-label={otherLocale === "en" ? t("switchToEn") : t("switchToEs")}
    >
      {otherLocale === "en" ? "EN" : "ES"}
    </Link>
  );
}
